// src/controllers/authController.js
const Admin = require("../legacy/models/admin.model");const { generateAccessToken, generateRefreshToken } = require("../helpers/token.helper");
const AuthService = require("../services/auth.service");
const Response = require("../helpers/response.helper");
class AuthController {
  constructor(service) {
    this.service = service;
  }
  async signup(req, res, next) {
    const { name, email, password } = req.body;
    const result = await this.service.processSignup(
      name,
      email,
      password,
      next,
    );
    return Response.success(res, "Registration successfull.", result, 201);
  }
  async login(req, res) {
    const { email, password } = req.body;
    const result = await this.service.processLogin(email, password, res);
    return Response.success(res, "Logged in!", result, 201);
  }
  async refresh(req, res) {
    const result = await this.service.processRefreshToken(req, res);
    return Response.success(res, "success", result);
  }
  async logout(req, res) {
    const result = await this.service.processLogout(req, res);
    return Response.success(res, result?.message);
  }
  async getProfile(req, res) {
    const userId = req.user.id;
    const result = await this.service.processGetProfile(userId);
    return Response.success(res, "Profile fetched successfully", result);
  }
  async updateProfile(req, res) {
    const userId = req.user.id;
    const result = await this.service.processUpdateProfile(userId, req.body);
    return Response.success(res, "Profile updated successfully", result);
  }
}
module.exports = new AuthController(AuthService);
