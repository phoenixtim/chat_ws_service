// require('pg').defaults.parseInt8 = true; // tells pg to parse bigint as integer, not as string
const Sequelize = require('sequelize');

const config = require('../utils/config');

module.exports.Sequelize = Sequelize;

const sequelize = new Sequelize(
  `postgres://${config.postgres.user}:${config.postgres.password}@${config.postgres.host}:${config.postgres.port}/` +
  `${config.postgres.dbName}`,
  {
    logging: config.debug ? console.log : false, // eslint-disable-line no-console
  },
);
module.exports.sequelize = sequelize;

module.exports.connectDB = async () => {
  await sequelize.sync({ force: Boolean(process.env.DROP_DB) });
};
