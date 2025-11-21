const express = require("express");
const router = express.Router();
const authentication = require("../services/authentication");
const uuid = require("uuid");
const { Op } = require("sequelize");
const { ChatGroup, GroupMember, UserMessage, User } = require("../database/models");

const mapMembership = (member) => ({
  id: member.id,
  userId: member.userId,
  status: member.status,
  role: member.role,
  name: member.member ? member.member.name : "Unknown",
  email: member.member ? member.member.email : undefined,
});

const mapMessage = (record) => ({
  id: record.uuid_User,
  userId: record.userID,
  userName: record.userName,
  userEmail: record.userEmail,
  groupId: record.groupId,
  message: record.userMessage,
  isAdmin: record.isAdmin,
  messagedAt: record.messagedAt,
});

const assertGroupOwner = async (groupId, userId) => {
  const group = await ChatGroup.findByPk(groupId);
  if (!group) {
    const error = new Error("Group not found");
    error.status = 404;
    throw error;
  }
  if (group.ownerId !== userId) {
    const error = new Error("Only group owners can perform this action");
    error.status = 403;
    throw error;
  }
  return group;
};

const assertApprovedMember = async (groupId, userId, action = "access") => {
  const membership = await GroupMember.findOne({ where: { groupId, userId } });
  if (!membership) {
    const error = new Error("You need to join this group first.");
    error.status = 403;
    throw error;
  }
  if (membership.status !== "approved") {
    const error = new Error(
      membership.status === "pending"
        ? "Your join request is pending approval."
        : "Your join request was rejected."
    );
    error.status = 403;
    throw error;
  }
  return membership;
};

router.get("/groups", authentication.authenticateToken, async (req, res) => {
  try {
    const userId = res.locals.userId;
    const groups = await ChatGroup.findAll({
      include: [
        {
          model: GroupMember,
          as: "members",
          include: [{ model: User, as: "member", attributes: ["id", "name", "email"] }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const response = groups.map((group) => {
      const membership = group.members.find((member) => member.userId === userId);
      const pendingRequests =
        group.ownerId === userId
          ? group.members.filter((member) => member.status === "pending").map(mapMembership)
          : [];
      return {
        id: group.id,
        name: group.name,
        description: group.description,
        ownerId: group.ownerId,
        requiresApproval: group.requiresApproval,
        memberCount: group.members.filter((member) => member.status === "approved").length,
        membership: membership ? mapMembership(membership) : null,
        pendingRequests,
        createdAt: group.createdAt,
      };
    });

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to fetch groups" });
  }
});

router.post("/groups", authentication.authenticateToken, async (req, res) => {
  try {
    const userId = res.locals.userId;
    const { name, description, requiresApproval = true } = req.body;
    const group = await ChatGroup.create({
      name,
      description,
      requiresApproval,
      ownerId: userId,
    });
    await GroupMember.create({
      groupId: group.id,
      userId,
      status: "approved",
      role: "owner",
    });

    // Emit real-time group creation event to all users
    const socketModule = require("../socket");
    const io = socketModule.getIO();
    if (io) {
      const owner = await User.findByPk(userId);
      io.emit("messenger:groupCreated", {
        group: {
          id: group.id,
          name: group.name,
          description: group.description,
          ownerId: group.ownerId,
          requiresApproval: group.requiresApproval,
          createdAt: group.createdAt,
        },
        owner: {
          id: owner?.id,
          name: owner?.name,
          email: owner?.email,
        },
      });
    }

    return res.status(201).json(group);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to create group" });
  }
});

router.post("/groups/:groupId/join", authentication.authenticateToken, async (req, res) => {
  try {
    const userId = res.locals.userId;
    const groupId = parseInt(req.params.groupId, 10);
    const group = await ChatGroup.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (group.ownerId === userId) {
      return res.status(200).json({ message: "You manage this group already." });
    }
    const existingMembership = await GroupMember.findOne({ where: { groupId, userId } });
    if (existingMembership) {
      return res.status(200).json({
        message: `You already have a ${existingMembership.status} invitation.`,
        membership: mapMembership(existingMembership),
      });
    }
    
    const requester = await User.findByPk(userId);
    const membership = await GroupMember.create({
      groupId,
      userId,
      status: group.requiresApproval ? "pending" : "approved",
      role: "member",
    });

    // Emit real-time join request event
    const socketModule = require("../socket");
    const io = socketModule.getIO();
    if (io) {
      if (group.requiresApproval) {
        // Notify group owner about pending request
        io.to(`user:${group.ownerId}`).emit("messenger:joinRequest", {
          groupId: group.id,
          groupName: group.name,
          membership: mapMembership(membership),
          requester: {
            id: requester?.id,
            name: requester?.name,
            email: requester?.email,
          },
        });
      } else {
        // Auto-approved - notify user and group members
        io.to(`user:${userId}`).emit("messenger:joinApproved", {
          groupId: group.id,
          groupName: group.name,
          membership: mapMembership(membership),
        });
        io.to(`group:${groupId}`).emit("messenger:memberJoined", {
          groupId: group.id,
          membership: mapMembership(membership),
        });
      }
    }

    return res.status(201).json({
      message: group.requiresApproval
        ? "Join request submitted. Waiting for approval."
        : "Joined the group successfully.",
      membership: mapMembership(membership),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to join group" });
  }
});

router.patch(
  "/groups/:groupId/members/:memberId",
  authentication.authenticateToken,
  async (req, res) => {
    try {
      const userId = res.locals.userId;
      const { action } = req.body;
      const groupId = parseInt(req.params.groupId, 10);
      await assertGroupOwner(groupId, userId);
      const membership = await GroupMember.findOne({
        where: { id: req.params.memberId, groupId },
        include: [{ model: User, as: "member", attributes: ["id", "name", "email"] }],
      });
      if (!membership) {
        return res.status(404).json({ message: "Membership not found" });
      }
      if (membership.role === "owner") {
        return res.status(400).json({ message: "Cannot update owner membership" });
      }

      if (action === "approve") {
        membership.status = "approved";
      } else if (action === "reject") {
        membership.status = "rejected";
      } else {
        return res.status(400).json({ message: "Invalid action provided" });
      }

      await membership.save();
      const mappedMembership = mapMembership(membership);

      // Emit real-time membership update events
      const socketModule = require("../socket");
      const io = socketModule.getIO();
      if (io) {
        const group = await ChatGroup.findByPk(groupId);
        if (action === "approve") {
          // Notify the approved user
          io.to(`user:${membership.userId}`).emit("messenger:joinApproved", {
            groupId: group.id,
            groupName: group.name,
            membership: mappedMembership,
          });
          // Notify group members about new member
          io.to(`group:${groupId}`).emit("messenger:memberJoined", {
            groupId: group.id,
            membership: mappedMembership,
          });
        } else {
          // Notify the rejected user
          io.to(`user:${membership.userId}`).emit("messenger:joinRejected", {
            groupId: group.id,
            groupName: group.name,
            reason: "Your join request was rejected by the group owner.",
          });
        }
        // Notify group owner to update pending requests list
        io.to(`user:${group.ownerId}`).emit("messenger:membershipUpdated", {
          groupId: group.id,
          membership: mappedMembership,
          action,
        });
      }

      return res.status(200).json({ message: "Membership updated", membership: mappedMembership });
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ message: error.message || "Unable to update membership" });
    }
  }
);

router.get(
  "/groups/:groupId/messages",
  authentication.authenticateToken,
  async (req, res) => {
    try {
      const userId = res.locals.userId;
      const groupId = parseInt(req.params.groupId, 10);
      const group = await ChatGroup.findByPk(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      if (group.ownerId !== userId) {
        await assertApprovedMember(groupId, userId, "view messages");
      }
      const messages = await UserMessage.findAll({
        where: { groupId },
        order: [["messagedAt", "ASC"]],
      });
      return res.status(200).json(messages.map(mapMessage));
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ message: error.message || "Unable to fetch messages" });
    }
  }
);

router.post(
  "/groups/:groupId/messages",
  authentication.authenticateToken,
  async (req, res) => {
    try {
      const userId = res.locals.userId;
      const email = res.locals.email;
      const groupId = parseInt(req.params.groupId, 10);
      const { message } = req.body;
      await assertApprovedMember(groupId, userId);
      const sender = await User.findByPk(userId);
      const record = await UserMessage.create({
        userID: userId,
        userName: sender?.name || "User",
        userEmail: email,
        userMessage: message,
        groupId,
        uuid_User: uuid.v1(),
        isAdmin: res.locals.role === "admin",
      });
      return res.status(201).json(mapMessage(record));
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ message: error.message || "Unable to send message" });
    }
  }
);

router.delete(
  "/groups/:groupId/messages/:id",
  authentication.authenticateToken,
  async (req, res) => {
    try {
      const userId = res.locals.userId;
      const groupId = parseInt(req.params.groupId, 10);
      const group = await ChatGroup.findByPk(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      const message = await UserMessage.findOne({
        where: { uuid_User: req.params.id, groupId },
      });
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      if (message.userID !== userId && group.ownerId !== userId) {
        return res.status(403).json({ message: "You cannot delete this message" });
      }
      await message.destroy();
      return res.status(200).json({ message: "Message deleted" });
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ message: error.message || "Unable to delete message" });
    }
  }
);

module.exports = router;
