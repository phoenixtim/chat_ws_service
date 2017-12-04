const Joi = require('joi');

const { roomsRepository } = require('../../repositories/rooms');
const { messagesRepository } = require('../../repositories/messages');
const socketHandler = require('../../services/socket');

module.exports.messageSchema = Joi.object({
  to: Joi.string().required(),
  message: Joi.string().required(),
});

module.exports.onMessage = async (socket, request) => {
  const { to, message } = request;
  const roomUsers = await roomsRepository.getRoomUsers({ roomId: to });
  if (!roomUsers.length) {
    throw {
      code: 400,
      message: 'room not found',
    };
  }
  if (!roomUsers.find(user => socket.user.ip === user.ip)) {
    throw {
      code: 400,
      message: 'user not in room',
    };
  }

  await messagesRepository.create({ values: {
    text: message,
    senderIp: socket.user.ip,
    roomId: to,
  } });

  socketHandler.sendMessage({
    roomId: to,
    messageName: socketHandler.messageNames.message,
    from: socket.user,
    data: message,
  });
};
