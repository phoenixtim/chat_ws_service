const SocketIO = require('socket.io');
const Joi = require('joi');

const connectionsRepo = require('./connectionsRepository');
const { usersRepository } = require('../../repositories/users');

class SocketHandler {
  constructor() {
    this.namesDelimeter = '-';
  }

  initSocket(nodeHttpServer, responses, options) {
    if (options) {
      if (options.delimeter) {
        this.namesDelimeter = options.delimeter;
      }
    }

    this.socketIO = SocketIO(nodeHttpServer, { serveClient: false });
    this.socketIO.use(SocketHandler.socketAuth);

    this.socketIO.on('connection', socket => {
      connectionsRepo.addUserConnection(socket.user.ip, socket.id);

      socket.on('disconnect', () => {
        connectionsRepo.deleteUserConnection(socket.user.ip);
        usersRepository.update({ filter: { ip: socket.user.ip }, values: { online: false } })
        .catch(err => {
          console.error(err);
        });
      });

      this.registerResponses(socket, responses);
    });
  }

  sendMessage({ userId, roomId, messageName, data }) {
    if (userId) {
      const userSocketId = connectionsRepo.getUserConnection(userId);
      if (userSocketId) {
        this.socketIO.to(userSocketId).emit(messageName, { status: 200, data });
      }
    }
    if (roomId) {
      this.socketIO.to(roomId).emit(messageName, { status: 200, data });
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
            throw { // eslint-disable-line no-throw-literal
              code: 400,
              message: validationResult.error.details.map(detail => `At '${detail.path}': ${detail.message}.`).join(' ')
              .replace(/"/g, "'"),
            };
          }

          const context = { user: socket.user };
          const responseResult = response.handler(context, request);
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
