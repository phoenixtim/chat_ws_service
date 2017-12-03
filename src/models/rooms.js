const { sequelize, Sequelize } = require('../services/sequelize');

const ROOM_ID_LENGTH = 24;
const ROOM_NAME_MAX_LENGTH = 100;

const roomModelSchema = {
  id: {
    type: Sequelize.STRING(ROOM_ID_LENGTH),
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING(ROOM_NAME_MAX_LENGTH),
    allowNull: false,
  },
};

const RoomModel = sequelize.define('room', roomModelSchema);
module.exports = RoomModel;

RoomModel.getSimpleObject = ({ instance }) => instance.toJSON();
