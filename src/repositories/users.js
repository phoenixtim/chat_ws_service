const chance = require('chance').Chance();

const { sequelize, Sequelize } = require('../services/sequelize');
const { Repository } = require('./basic');
const { convertFieldToDBConditions } = require('../utils/sequelize');

const USER_IP_LENGTH = 45;
const USER_NAME_MAX_LENGTH = 80;
const USER_NAME_MIN_LENGTH = 3;

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
module.exports.UserModel = UserModel;

UserModel.getSimpleObject = ({ instance }) => instance.toJSON();

module.exports.usersRepository = new UsersRepository({
  model: UserModel,
  convertFilterToDBConditions,
});
