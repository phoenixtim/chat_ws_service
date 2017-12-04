const Joi = require('joi');

const { roomsRepository } = require('../../repositories/rooms');
const socketHandler = require('../../services/socket');

module.exports.roomGatewaySchema = Joi.object({
  roomId: Joi.string().required(),
});

module.exports.onRoomJoin = async (socket, request) => {
  const { roomId } = request;

  await roomsRepository.joinRoom({ roomId, userId: socket.user.ip });
  socket.join(roomId);

  socketHandler.sendMessage({
    roomId,
    messageName: socketHandler.messageNames.userConnected,
    from: socket.user,
  });
};

module.exports.onRoomLeave = async (socket, request) => {
  const { roomId } = request;

  await roomsRepository.leaveRoom({ roomId, userId: socket.user.ip });
  socket.leave(roomId);

  socketHandler.sendMessage({
    roomId,
    messageName: socketHandler.messageNames.userDisconnected,
    from: socket.user,
  });
};

module.exports.roomCreateSchema = Joi.object({
  roomName: Joi.string().required(),
});

module.exports.onRoomCreate = async (socket, request) => {
  const { roomName } = request;

  const room = await roomsRepository.create({ values: { name: roomName }, userId: socket.user.ip });
  socket.join(room.id);
};

module.exports.roomChangeNameSchema = Joi.object({
  roomId: Joi.string().required(),
  roomName: Joi.string().required(),
});

module.exports.onRoomChangeName = async (socket, request) => {
  const { roomId, roomName } = request;

  const roomUsers = await roomsRepository.getRoomUsers({ roomId });
  if (!roomUsers.find(user => user.id === socket.user.id)) {
    throw {
      code: 400,
      message: 'user not in room',
    };
  }

  await roomsRepository.update({ filter: { id: roomId }, values: { name: roomName } });

  socketHandler.sendMessage({
    roomId,
    messageName: socketHandler.messageNames.roomNewName,
    from: socket.user,
    data: roomName,
  });
};

module.exports.onRoomUsersList = async (socket, request) => {
  const { roomId } = request;

  const roomUsers = await roomsRepository.getRoomUsers({ roomId });
  if (!roomUsers.find(user => user.id === socket.user.id)) {
    throw {
      code: 400,
      message: 'user not in room',
    };
  }

  return roomUsers;
};

module.exports.roomListSchema = Joi.object({
  name: Joi.string(),
  limit: Joi.number().integer().min(0).max(50).required(), // eslint-disable-line newline-per-chained-call
  offset: Joi.number().integer().min(0),
});

module.exports.onRoomList = async (socket, request) => {
  const { limit, offset, name } = request;
  const filter = {};
  if (name) {
    filter.name = `like_${name}`;
  }

  const rooms = await roomsRepository.find({ limit, offset, filter });
  return rooms;
};
