const { sequelize, Sequelize } = require('../services/sequelize');

const messageModelSchema = {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  text: Sequelize.TEXT,
};

const MessageModel = sequelize.define('message', messageModelSchema);
module.exports = MessageModel;

MessageModel.getSimpleObject = ({ instance }) => instance.toJSON();
