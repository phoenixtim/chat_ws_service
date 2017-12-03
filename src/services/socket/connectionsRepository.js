class SocketConnectionsRepository {
  constructor() {
    this.connections = new Map();
  }

  getUserConnection(userId) {
    return this.connections.get(userId);
  }

  deleteUserConnection(userId) {
    this.connections.delete(userId);
  }

  addUserConnection(userId, socket) {
    this.connections.set(userId, socket);
  }
}

module.exports = new SocketConnectionsRepository();
