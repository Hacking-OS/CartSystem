// Socket.IO instance manager to avoid circular dependencies
let ioInstance = null;

const setIO = (io) => {
  ioInstance = io;
};

const getIO = () => ioInstance;

module.exports = { setIO, getIO };

