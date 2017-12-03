const Express = require('express');
const http = require('http');

const config = require('./utils/config');
const { connectDB } = require('./services/sequelize');
const socket = require('./services/socket');
const socketResponses = require('./api/socket');
const associate = require('./repositories/associations');

async function runService() {
  const app = Express();
  const server = http.Server(app);

  associate();
  await connectDB();
  socket.initSocket(server, socketResponses);

  server.listen(config.port, () => {
    console.log(`service started on port ${config.port}`); // eslint-disable-line no-console
  });
}

runService()
.catch(err => {
  console.error(err);
  process.exit(1);
});
