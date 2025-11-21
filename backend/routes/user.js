const express = require('express');
const Token = require("jsonwebtoken");
const router = express.Router();
const authentication = require("../services/authentication");
const CheckRole = require("../services/checkRole");
const config = require("../config");
const emailService = require("../services/emailService");
const { User, sequelize } = require("../database/models");

router.post("/signup", async (req, res) => {
  try {
    const payload = req.body.userInput;
    const existing = await User.findOne({ where: { email: payload.email } });
    if (existing) {
      return res.status(400).json({ message: "Email Already Exist !" });
    }
    await User.create({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
      status: 0,
      role: "user",
    });
    return res.status(200).json({ message: "User Registered Successfully !" });
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const payload = req.body.userInput;
    const user = await User.findOne({ where: { email: payload.email } });
    if (!user || user.password !== payload.password) {
      return res.status(401).json({ message: "Invalid UserName/Email or Password!" });
    }
    if (!user.status) {
      return res.status(401).json({ message: "Wait For Admin Approval!" });
    }
    const response = { email: user.email, role: user.role, userId: user.id };
    const AccessToken = Token.sign(response, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessTtl,
    });
    const newRefreshToken = generateRefreshToken(response);
    res.status(200).json({
      email: user.email,
      token: AccessToken,
      userRole: user.role,
      userId: user.id,
      refreshToken: newRefreshToken.refreshToken,
      userName: user.name,
      userStatus: user.status, // Include user approval status
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.post("/forgetPassword", async (req, res) => {
  try {
    const payload = req.body.userInput;
    const user = await User.findOne({ where: { email: payload.email } });
    if (!user) {
      return res.status(200).json({ message: "Password sent Successfully to you email Address!(Not)" });
    }
    const mailingOptions = {
      to: user.email,
      subject: "Password By DeveloperCodingPreview:",
      html: `<p><b>Your login details:</b><br><b>email :</b> ${user.email}<br><b>password: ${user.password}</b><br><br> click <a href='http://localhost:4200'>here</a> to login</p>`,
    };
    await emailService.sendMail(mailingOptions);
    return res.status(200).json({ message: "Password sent Successfully to you email Address!" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to send email right now." });
  }
});

router.get("/get", authentication.authenticateToken, CheckRole.CheckRole, async (req, res) => {
  try {
    const users = await User.findAll({ where: { role: "user" } });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/token", (req, res) => {
  const response = {
    email: res.locals.email,
    role: res.locals.role,
  };
  const AccessToken = Token.sign(response, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessTtl,
  });
  return res.status(200).json({ response: AccessToken });
});

router.get("/validToken/:token", (req, res) => {
  if (!req.params.token) {
    return res.status(401).json({ response: false });
  }
  Token.verify(req.params.token, config.jwt.accessSecret, (error) => {
    if (error) {
      return res.status(403).json({ response: false });
    }
    return res.status(200).json({ response: true });
  });
});

router.post("/getResults", authentication.authenticateToken, async (req, res) => {
  try {
    const query = req.body.query || "";
    if (!query.trim().toLowerCase().startsWith("select")) {
      return res.status(400).json({ message: "Only SELECT statements are allowed." });
    }
    const [results] = await sequelize.query(query);
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.patch("/update", authentication.authenticateToken, CheckRole.CheckRole, async (req, res) => {
  try {
    const payload = req.body;
    const user = await User.findByPk(payload.userInput);
    if (!user) {
      return res.status(400).json({ message: "User Not Exist !" });
    }
    const [affected] = await User.update({ status: payload.Status }, { where: { id: payload.userInput } });
    if (!affected) {
      return res.status(400).json({ message: "User Not Exist !" });
    }
    
    // Emit approval notification via Socket.IO (lazy load to avoid circular dependency)
    const socketModule = require("../socket");
    const io = socketModule.getIO();
    if (io) {
      const updatedUser = await User.findByPk(payload.userInput);
      io.to(`user:${payload.userInput}`).emit("approval:statusChanged", {
        userId: payload.userInput,
        status: payload.Status,
        approved: payload.Status === 1,
        message: payload.Status === 1 
          ? "Your account has been approved! You can now log in." 
          : "Your account approval has been revoked.",
        userName: updatedUser?.name || "User",
        userEmail: updatedUser?.email || "",
      });
      
      // Also notify admins about the status change
      io.emit("admin:userStatusChanged", {
        userId: payload.userInput,
        status: payload.Status,
        userName: updatedUser?.name || "User",
        userEmail: updatedUser?.email || "",
        changedBy: res.locals.email,
      });
    }
    
    return res.status(200).json({ message: "User Updated Succesfully!" });
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/checkToken", authentication.authenticateToken, (req, res) => {
  return res.status(200).json({ message: "true" });
});

router.post("/changePassword", authentication.authenticateToken, async (req, res) => {
  try {
    const payload = req.body;
    const email = res.locals.email;
    const user = await User.findOne({ where: { email, password: payload.oldPassword } });
    if (!user) {
      return res.status(400).json({ message: "Incorrect Old password !" });
    }
    user.password = payload.newPassword;
    await user.save();
    return res.status(200).json({ message: "Password Updated Successfully!" });
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.post('/refresh-token', (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Invalid refresh token!' });
  }
  Token.verify(refreshToken, config.jwt.refreshSecret, (error, payload) => {
    if (error) {
      return res.status(401).json({ error: 'Invalid refresh token!' });
    }
    const newAccessToken = generateAccessToken({ email: payload.email, role: payload.role, userId: payload.userId });
    return res.status(200).json({ success: 'Success', access_token: newAccessToken.accessToken, error: '' });
  });
});

function generateAccessToken(payload) {
  const accessToken = Token.sign(payload, config.jwt.accessSecret, { expiresIn: config.jwt.accessTtl });
  return { accessToken };
}
function generateRefreshToken(payload) {
  const refresh_Token = Token.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshTtl });
  return { refreshToken: refresh_Token };
}

module.exports = router;

