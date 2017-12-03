const { UserModel } = require('./users');
const { MessageModel } = require('./messages');
const { RoomModel } = require('./rooms');

module.exports = function () {
  UserModel.hasMany(MessageModel, { as: 'messages', foreignKey: 'senderIp', onDelete: 'CASCADE' });
  MessageModel.belongsTo(UserModel, { as: 'sender' });

  RoomModel.hasMany(MessageModel, { as: 'messages', foreignKey: 'roomId', onDelete: 'CASCADE' });
  MessageModel.belongsTo(RoomModel, { as: 'room' });
};
