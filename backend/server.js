const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");
const mysql = require("mysql2/promise");
const app = require("./index");
const config = require("./config");
const { sequelize, GroupMember, UserMessage, User } = require("./database/models");
const seedDatabase = require("./database/seed");
const enviroment = require("../client/src/environments/enviroment");

const host = config.app.host || enviroment.baseUrl || "0.0.0.0";
const port = config.app.port;

const formatMessage = (record) => ({
  id: record.uuid_User,
  userId: record.userID,
  userName: record.userName,
  userEmail: record.userEmail,
  message: record.userMessage,
  groupId: record.groupId,
  isAdmin: record.isAdmin,
  messagedAt: record.messagedAt,
});

const { setIO } = require("./socket");

const initializeSockets = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:4200', 'http://localhost:8081'],
      credentials: true,
    },
  });

  setIO(io); // Store for use in routes

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Unauthorized"));
    }
    try {
      const payload = jwt.verify(token, config.jwt.accessSecret);
      socket.user = payload;
      return next();
    } catch (error) {
      return next(new Error("Unauthorized"));
    }
  });

  // Track typing users per group
  const typingUsers = new Map(); // groupId -> Set of userIds

  io.on("connection", (socket) => {
    const { userId } = socket.user;
    socket.join(`user:${userId}`);

    socket.on("messenger:joinGroup", async ({ groupId }) => {
      try {
        // First check if user account is approved
        const user = await User.findByPk(userId);
        if (!user || !user.status) {
          socket.emit("messenger:joinRejected", {
            groupId,
            reason: "Your account needs admin approval before you can join groups.",
          });
          return;
        }

        // Then check group membership approval
        const membership = await GroupMember.findOne({ where: { groupId, userId } });
        if (!membership || membership.status !== "approved") {
          socket.emit("messenger:joinRejected", {
            groupId,
            reason: "Join request not approved yet.",
          });
          return;
        }
        socket.join(`group:${groupId}`);
        socket.emit("messenger:joined", { groupId });
      } catch (error) {
        socket.emit("messenger:error", { message: error.message });
      }
    });

    socket.on("messenger:leaveGroup", ({ groupId }) => {
      socket.leave(`group:${groupId}`);
      // Clean up typing indicator when leaving
      if (typingUsers.has(groupId)) {
        typingUsers.get(groupId).delete(userId);
        if (typingUsers.get(groupId).size === 0) {
          typingUsers.delete(groupId);
        }
      }
      socket.to(`group:${groupId}`).emit("messenger:typingStop", { userId, groupId });
    });

    // Typing indicator events
    socket.on("messenger:typingStart", ({ groupId }) => {
      if (!typingUsers.has(groupId)) {
        typingUsers.set(groupId, new Set());
      }
      typingUsers.get(groupId).add(userId);
      socket.to(`group:${groupId}`).emit("messenger:typingStart", { userId, groupId });
    });

    socket.on("messenger:typingStop", ({ groupId }) => {
      if (typingUsers.has(groupId)) {
        typingUsers.get(groupId).delete(userId);
        if (typingUsers.get(groupId).size === 0) {
          typingUsers.delete(groupId);
        }
      }
      socket.to(`group:${groupId}`).emit("messenger:typingStop", { userId, groupId });
    });

    socket.on("messenger:sendMessage", async ({ groupId, content }, callback) => {
      try {
        // First check if user account is approved
        const user = await User.findByPk(userId);
        if (!user || !user.status) {
          const response = { success: false, message: "Your account needs admin approval before you can send messages." };
          callback?.(response);
          socket.emit("messenger:error", response);
          return;
        }

        // Then check group membership approval
        const membership = await GroupMember.findOne({ where: { groupId, userId } });
        if (!membership || membership.status !== "approved") {
          const response = { success: false, message: "Join request not approved yet." };
          callback?.(response);
          socket.emit("messenger:error", response);
          return;
        }
        
        // Stop typing when message is sent
        if (typingUsers.has(groupId)) {
          typingUsers.get(groupId).delete(userId);
          if (typingUsers.get(groupId).size === 0) {
            typingUsers.delete(groupId);
          }
        }
        socket.to(`group:${groupId}`).emit("messenger:typingStop", { userId, groupId });
        
        const record = await UserMessage.create({
          userID: userId,
          userName: user.name || "User",
          userEmail: socket.user.email,
          userMessage: content,
          groupId,
          uuid_User: uuid.v1(),
          isAdmin: socket.user.role === "admin",
        });
        const payload = formatMessage(record);
        io.to(`group:${groupId}`).emit("messenger:newMessage", payload);
        callback?.({ success: true, message: payload });
      } catch (error) {
        const response = { success: false, message: error.message };
        callback?.(response);
        socket.emit("messenger:error", response);
      }
    });

    socket.on("disconnect", () => {
      // Clean up typing indicators on disconnect
      typingUsers.forEach((userSet, groupId) => {
        if (userSet.has(userId)) {
          userSet.delete(userId);
          if (userSet.size === 0) {
            typingUsers.delete(groupId);
          }
          io.to(`group:${groupId}`).emit("messenger:typingStop", { userId, groupId });
        }
      });
    });
  });

  return io;
};

module.exports = { initializeSockets };

const ensureDatabaseExists = async () => {
  const { host, user, password, port, name } = config.database;
  const connection = await mysql.createConnection({
    host,
    user,
    password,
    port,
    multipleStatements: true,
  });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${name}\`;`);
  await connection.end();
};

const startServer = async () => {
  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    await sequelize.sync();
    await seedDatabase();
    const server = http.createServer(app);
    initializeSockets(server);
    server.listen(port, host, () => {
      console.log(`The server is running on http://${host}:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
