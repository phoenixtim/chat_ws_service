const Express = require('express');
const http = require('http');
// const Socket = require('socket.io');

const config = require('./utils/config');
const { connectDB } = require('./services/sequelize');

const app = Express();
const server = http.Server(app);
// const io = Socket(server);

async function runService() {
  await connectDB();

  server.listen(config.port, () => {
    console.log(`service started on port ${config.port}`); // eslint-disable-line no-console
  });
}

runService()
.catch(err => {
  console.error(err);
  process.exit(1);
});
