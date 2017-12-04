const crypto = require('crypto');

const { Room, User } = require('../models');
const { Repository } = require('./basic');
const { usersRepository } = require('./users');
const { convertFieldToDBConditions } = require('../utils/sequelize');

const ROOM_ID_LENGTH = 24;

class RoomsRepository extends Repository {
  async create({ values, userId }) {
    const id = await this.generateId();
    const room = await this.model.create({ ...values, id });

    if (userId) {
      room.addUser(userId);
    }

    return room;
  }

  async generateId() {
    let id;
    let foundRoom;
    do {
      id = crypto.randomBytes(ROOM_ID_LENGTH).toString('hex').slice(0, ROOM_ID_LENGTH);
      foundRoom = await this.findOne({ filter: { id } });
    } while (foundRoom);

    return id;
  }

  async getRoomUsers({ roomId }) {
    const room = await this.model.findOne({
      where: { id: roomId },
      include: [{ model: User, as: 'Users' }],
    });

    const roomUsers = room && room.Users ? room.Users : [];
    return roomUsers.map(user => (User.getSimpleObject ? User.getSimpleObject({ instance: user }) : user.toJSON()));
  }

  async joinRoom({ roomId, userId }) {
    const user = await usersRepository.findOne({ filter: { ip: userId } });
    if (!user) {
      throw {
        code: 400,
        message: 'user not found',
      };
    }

    let room = await this.model.findOne({
      where: { id: roomId },
      include: [{ model: User, as: 'Users' }],
    });
    if (!room) {
      room = await this.create({ values: {} });
    }
    await room.addUser(user.ip);

    const roomUsers = [...room.Users, user];
    return roomUsers.map(roomUser =>
      (User.getSimpleObject ? User.getSimpleObject({ instance: roomUser }) : roomUser.toJSON()));
  }

  async leaveRoom({ roomId, userId }) {
    const user = await usersRepository.findOne({ filter: { ip: userId } });
    if (!user) {
      throw {
        code: 400,
        message: 'user not found',
      };
    }

    const room = await this.model.findOne({
      where: { id: roomId },
      include: [{ model: User, as: 'Users' }],
    });
    if (!room) {
      throw {
        code: 400,
        message: 'room not found',
      };
    }

    if (room.Users.length <= 1) {
      await this.delete({ filter: { id: roomId } });
      return;
    }
    await room.removeUser(user);
  }
}

function convertFilterToDBConditions({ filter }) {
  const searchConditions = {};

  if (filter) {
    if (filter.id) {
      searchConditions.id = convertFieldToDBConditions(filter.id);
    }
    if (filter.name) {
      searchConditions.name = convertFieldToDBConditions(filter.name);
    }
  }

  return searchConditions;
}

module.exports.roomsRepository = new RoomsRepository({
  model: Room,
  convertFilterToDBConditions,
});
