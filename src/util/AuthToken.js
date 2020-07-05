const jwt = require("jsonwebtoken");
const crypto = require("crypto");

class AuthToken {
  constructor() {}

  generateAccessToken({ _id }) {
    return jwt.sign({ _id: _id.toHexString(), access: "access" }, process.env.AUTH_SECRET);
  }

  generateRefreshToken(id) {
    return jwt.sign({ _id: id.toHexString(), access: "refresh" }, process.env.REFRESH_SECRET, {
      expiresIn: process.env.REFRESH_EXPIRE
    });
  }

  decodeAccessToken(token) {
    return new Promise((resolve, reject) => {
      if (!token) reject("AccessToken Undefined");
      jwt.verify(token, process.env.AUTH_SECRET, (err, decoded) => {
        if (err) {
          reject(err);
        }
        resolve(decoded);
      });
    });
  }

  decodeRefreshToken(token) {
    return new Promise((resolve, reject) => {
      if (!token) reject("RefreshToken Undefined");
      jwt.verify(token, process.env.REFRESH_SECRET, (err, decoded) => {
        if (err) {
          reject(err);
        }
        resolve(decoded);
      });
    });
  }
}

module.exports = new AuthToken();
