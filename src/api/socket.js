const { onMessage, messageSchema } = require('./handlers/messages');
const {
  roomGatewaySchema, onRoomJoin, onRoomLeave, roomCreateSchema, onRoomCreate, roomChangeNameSchema, onRoomChangeName,
  roomListSchema, onRoomList, onRoomUsersList,
} = require('./handlers/rooms');
const socketHandler = require('../services/socket');

module.exports = {
  [socketHandler.messageNames.sendMessage]: {
    requestSchema: messageSchema,
    handler: onMessage,
  },
  [socketHandler.messageNames.roomJoin]: {
    requestSchema: roomGatewaySchema,
    handler: onRoomJoin,
  },
  [socketHandler.messageNames.roomLeave]: {
    requestSchema: roomGatewaySchema,
    handler: onRoomLeave,
  },
  [socketHandler.messageNames.roomChangeName]: {
    requestSchema: roomChangeNameSchema,
    handler: onRoomChangeName,
  },
  [socketHandler.messageNames.roomCreate]: {
    requestSchema: roomCreateSchema,
    handler: onRoomCreate,
  },
  [socketHandler.messageNames.roomsList]: {
    requestSchema: roomListSchema,
    handler: onRoomList,
  },
  [socketHandler.messageNames.roomUsers]: {
    requestSchema: roomGatewaySchema,
    handler: onRoomUsersList,
  },
};
