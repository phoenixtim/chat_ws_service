const { sequelize, Sequelize } = require('../services/sequelize');
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

const messageModelSchema = {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  text: Sequelize.TEXT,
};

const MessageModel = sequelize.define('message', messageModelSchema);
module.exports.MessageModel = MessageModel;

MessageModel.getSimpleObject = ({ instance }) => instance.toJSON();

module.exports.messagesRepository = new MessagesRepository({
  model: MessageModel,
  convertFilterToDBConditions,
});
