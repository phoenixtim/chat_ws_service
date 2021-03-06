const chance = require('chance').Chance();

const { User, Room } = require('../models');
const { Repository } = require('./basic');
const { convertFieldToDBConditions } = require('../utils/sequelize');

class UsersRepository extends Repository {
  async create({ values }) {
    if (!values.name) {
      values.name = await this.generateNewName();
    }

    const user = await super.create({ values });
    return user;
  }

  async generateNewName() {
    let name;
    let foundUser;
    do {
      name = chance.name();
      foundUser = await this.findOne({ filter: { name } });
    } while (foundUser);

    return name;
  }

  async getUserRooms({ userId }) {
    const user = await this.model.findOne({
      where: { ip: userId },
      include: [{ model: Room, as: 'Rooms' }],
    });

    const userRooms = user && user.Rooms ? user.Rooms : [];
    return userRooms.map(room => (Room.getSimpleObject ? Room.getSimpleObject({ instance: room }) : room.toJSON()));
  }
}

function convertFilterToDBConditions({ filter }) {
  const searchConditions = {};

  if (filter) {
    if (filter.ip) {
      searchConditions.ip = convertFieldToDBConditions(filter.ip);
    }
    if (filter.name) {
      searchConditions.name = convertFieldToDBConditions(filter.name);
    }
    if (filter.online) {
      searchConditions.online = convertFieldToDBConditions(filter.online);
    }
  }

  return searchConditions;
}

module.exports.usersRepository = new UsersRepository({
  model: User,
  convertFilterToDBConditions,
});
