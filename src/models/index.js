const User = require('./users');
const Message = require('./messages');
const Room = require('./rooms');

User.hasMany(Message, { as: 'messages', foreignKey: 'senderIp', onDelete: 'CASCADE' });
Message.belongsTo(User, { as: 'sender' });

Room.hasMany(Message, { as: 'messages', foreignKey: 'roomId', onDelete: 'CASCADE' });
Message.belongsTo(Room, { as: 'room' });

User.belongsToMany(Room, { as: 'Rooms', through: 'room_users', foreignKey: 'userIp' });
Room.belongsToMany(User, { as: 'Users', through: 'room_users', foreignKey: 'roomId' });

module.exports = { User, Room, Message };
