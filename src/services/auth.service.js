const bcrypt = require("bcryptjs");
const AuthRepository = require("../repositories/auth.repo");
const AppError = require("../utils/AppError");
const { generateAccessToken, generateRefreshToken } = require("../helpers/token.helper");
const jwt = require("jsonwebtoken");

class AuthService {
  constructor(repo) {
    this.repo = repo;
  }
  async _hashPassword(password, salt) {
    return await bcrypt.hash(password, salt);
  }
  async _comparePassword(password, hashed) {
    return await bcrypt.compare(password, hashed);
  }
  async _sendCookie(res, name, value, options) {
    res.cookie(name, value, options);
  }
  async _verifyToken(token) {
    return jwt.verify(token, process.env.REFRESH_SECRET);
  }
  async processSignup(name, email, password) {
    const isUserExist = await this.repo.findOne({
      email,
    });
    if (isUserExist) {
      throw new AppError("User already exists with this username.", 409);
    }
    const hashed = await this._hashPassword(password, 12);
    const user = await this.repo.createAdmin({ name, email, password: hashed });
    return {
      user: user,
    };
  }
  async processLogin(email, password, res) {
    const user = await this.repo.findOne({
      email,
    });
    if (!user) {
      throw new AppError("No record found for the email you provided!", 404);
    }
    const isMatch = await this._comparePassword(password, user?.password);
    if (!isMatch) {
      throw new AppError("Invalid Credentials!", 400);
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    // store refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await user.save();
    this._sendCookie(res, "refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    return {
      accessToken,
    };
  }
  async processRefreshToken(req, res) {
    const token = req.cookies.refreshToken;
    if (!token) {
      throw new AppError("No token found!", 401);
    }

    try {
      const decoded = await this._verifyToken(token);

      const user = await this.repo.findOne({
        _id: decoded?.id,
        "refreshTokens.token": token,
      });
      if (!user) {
        throw new AppError("No refresh token found!", 404);
      }
      user.refreshTokens = user.refreshTokens.filter((t) => t.token !== token);

      const newRefreshToken = generateRefreshToken(user);
      const newAccessToken = generateAccessToken(user);

      user.refreshTokens.push({
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await user.save();

      this._sendCookie(res, "refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      });
      return { newAccessToken };
    } catch (err) {
      throw new AppError("ERROR: " + err?.message, 403);
    }
  }
  async processLogout(req, res) {
    const token = req.cookies.refreshToken;

    if (!token) throw new AppError("Unauthorized!", 401);

    const user = await this.repo.findOne({
      "refreshTokens.token": token,
    });

    if (user) {
      user.refreshTokens = user.refreshTokens.filter((t) => t.token !== token);
      await user.save();
    }

    res.clearCookie("refreshToken");

    return {
      message: "Logged out!",
    };
  }
  async processGetProfile(userId) {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new AppError("User not found!", 404);
    }
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshTokens;
    return userObj;
  }
  async processUpdateProfile(userId, payload) {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new AppError("User not found!", 404);
    }
    
    if (payload.email && payload.email !== user.email) {
      const existingUser = await this.repo.findOne({ email: payload.email });
      if (existingUser) {
        throw new AppError("Email already in use", 409);
      }
      user.email = payload.email;
    }

    if (payload.name) {
      user.name = payload.name;
    }

    if (payload.password) {
      user.password = await this._hashPassword(payload.password, 12);
    }

    await user.save();
    
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshTokens;
    return userObj;
  }
}
module.exports = new AuthService(AuthRepository);
