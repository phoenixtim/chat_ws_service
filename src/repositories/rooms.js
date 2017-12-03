const crypto = require('crypto');

const { Room } = require('../models');
const { Repository } = require('./basic');
const { convertFieldToDBConditions } = require('../utils/sequelize');

const ROOM_ID_LENGTH = 24;

class RoomsRepository extends Repository {
  async create({ values }) {
    const id = await this.generateId();
    const room = await super.create({ values: { ...values, id } });
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
