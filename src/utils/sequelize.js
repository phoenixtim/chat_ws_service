const Sequelize = require('sequelize');

module.exports.convertFieldToDBConditions = function (filter) {
  const dbConditions = {};

  if (filter instanceof Date || typeof filter === 'boolean') {
    return filter;
  }

  if (typeof filter === 'string') {
    if (filter.startsWith('>_')) {
      dbConditions[Sequelize.Op.gt] = filter.slice(2);
    } else if (filter.startsWith('like_')) {
      dbConditions[Sequelize.Op.iLike] = `%${filter.slice(5)}%`;
    } else {
      return filter;
    }
  } else if (Array.isArray(filter)) {
    dbConditions[Sequelize.Op.in] = filter;
  }

  return dbConditions;
};
