const { Message } = require('../models');
const { Repository } = require('./basic');
const { convertFieldToDBConditions } = require('../utils/sequelize');

class MessagesRepository extends Repository {
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

module.exports.messagesRepository = new MessagesRepository({
  model: Message,
  convertFilterToDBConditions,
});
