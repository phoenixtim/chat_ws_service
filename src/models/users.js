const { sequelize, Sequelize } = require('../services/sequelize');

const USER_IP_LENGTH = 45;
const USER_NAME_MAX_LENGTH = 80;
const USER_NAME_MIN_LENGTH = 3;

const userModelSchema = {
  ip: {
    type: Sequelize.STRING(USER_IP_LENGTH),
    validate: { isIP: true },
    set(value) {
      this.setDataValue('ip', value.toLowerCase());
    },
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING(USER_NAME_MAX_LENGTH),
    allowNull: false,
    validate: { len: [USER_NAME_MIN_LENGTH, USER_NAME_MAX_LENGTH] },
  },
  online: {
    type: Sequelize.BOOLEAN,
    default: true,
  },
};

const UserModel = sequelize.define('user', userModelSchema);
module.exports = UserModel;

UserModel.getSimpleObject = ({ instance }) => instance.toJSON();
