const SocketIO = require('socket.io');
const Joi = require('joi');

const connectionsRepo = require('./connectionsRepository');
const { usersRepository } = require('../../repositories/users');

class SocketHandler {
  constructor() {
    this.namesDelimeter = '-';
    this.messageNames = {
      roomCreate: `room${this.namesDelimeter}create`,
      roomChangeName: `room${this.namesDelimeter}name${this.namesDelimeter}change`,
      roomNewName: `room${this.namesDelimeter}name${this.namesDelimeter}new`,

      roomJoin: `room${this.namesDelimeter}join`,
      userConnected: `user${this.namesDelimeter}connected`,
      roomLeave: `room${this.namesDelimeter}leave`,
      userDisconnected: `user${this.namesDelimeter}disconnected`,

      roomUsers: `room${this.namesDelimeter}users`,
      roomsList: `room${this.namesDelimeter}list`,

      sendMessage: `message${this.namesDelimeter}send`,
      message: 'message',
    };
  }

  initSocket(nodeHttpServer, responses, options) {
    this.responses = responses;
    if (options) {
      if (options.delimeter) {
        this.namesDelimeter = options.delimeter;
      }
    }

    this.socketIO = SocketIO(nodeHttpServer, { serveClient: false });
    this.socketIO.use(SocketHandler.socketAuth);

    this.socketIO.on('connection', async socket => {
      connectionsRepo.addUserConnection(socket.user.ip, socket.id);
      const userRooms = await usersRepository.getUserRooms({ userId: socket.user.ip });
      userRooms.forEach(room => socket.join(room.id));

      socket.on('disconnect', () => {
        connectionsRepo.deleteUserConnection(socket.user.ip);
        usersRepository.update({ filter: { ip: socket.user.ip }, values: { online: false } })
        .catch(err => {
          console.error(err);
        });
      });

      this.registerResponses(socket, this.responses);
    });
  }

  sendMessage({ userId, roomId, messageName, data, from }) {
    let messageData = data;
    if (from) {
      messageData = { from, message: data };
    }

    if (userId) {
      const userSocketId = connectionsRepo.getUserConnection(userId);
      if (userSocketId) {
        this.socketIO.to(userSocketId).emit(messageName, { status: 200, data: messageData });
      }
    }
    if (roomId) {
      this.socketIO.to(roomId).emit(messageName, { status: 200, data: messageData });
    }
  }

  registerResponses(socket, responses) {
    Object.keys(responses).forEach(requestName => {
      const response = responses[requestName];

      socket.on(requestName, async request => {
        const responseName = `${requestName}${this.namesDelimeter}response`;

        let result;
        try {
          const validationResult = Joi.validate(request, response.requestSchema, { abortEarly: false });
          if (validationResult.error) {
            throw {
              code: 400,
              message: validationResult.error.details.map(detail => `At '${detail.path}': ${detail.message}.`).join(' ')
              .replace(/"/g, "'"),
            };
          }

          const responseResult = response.handler(socket, request);
          if (responseResult instanceof Promise) {
            result = await responseResult;
          } else {
            result = responseResult;
          }
        } catch (err) {
          if (err.code) {
            console.error(err);
          }
          socket.emit(responseName, { status: err.code || 500, error: err.message });
          return;
        }

        socket.emit(responseName, { status: 200, data: result });
      });
    });
  }

  static async socketAuth(socket, next) {
    const ip = socket.conn.remoteAddress;

    let user = await usersRepository.findOne({ filter: { ip } });
    if (!user) {
      user = await usersRepository.create({ values: { ip, online: true } });
    } else {
      await usersRepository.update({ filter: { ip }, values: { online: true } });
    }

    socket.user = { ip, name: user.name };
    return next();
  }
}

module.exports = new SocketHandler();
