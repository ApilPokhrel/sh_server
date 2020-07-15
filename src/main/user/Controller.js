const Mailer = require("../../util/Mailer");
const bcrypt = require("bcryptjs");

let generateCode = async user_id => {
  let key = "code";
  let code = Math.random().toString(36).substring(6);
  let expire = 900000;
  await redisClient.set(`${code}-${user_id.toString()}`, code);
  await redisClient.expire(key, expire);
  return code;
};

let updateRedis = async id => {
  return new Promise((resolve, reject) => {
    redisClient.exists(id.toString(), async (err, ok) => {
      if (ok === 1) {
        redisClient.get(id.toString(), async (err, userStr) => {
          user = JSON.parse(userStr);
          user.is_verified = true;
          await redisClient.set(id.toString(), JSON.stringify(user));
          await redisClient.expire(id.toString(), process.env.REDIS_EXPIRE);
          resolve(true);
        });
      }
      resolve(true);
    });
  });
};

let verifyCode = async (code, user_id) => {
  let full = `${code}-${user_id.toString()}`;
  return new Promise((resolve, reject) => {
    redisClient.exists(full, (err, ok) => {
      if (err && err !== null) reject("Try Again");
      if (ok !== 1) reject("Code Expired");
      resolve(ok);
    });
  });
};

let sendMail = async ({ to, user_id }) => {
  let template = Mailer.TEMPLATES.SIGNUP_CREDENTIALS();
  let code = await generateCode(user_id);
  Mailer.sendMail(to, { code }, template);
  return code;
};

let generateHash = str => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        reject(err);
      }
      bcrypt.hash(str, salt, function (err, hash) {
        if (err) {
          reject(err);
        }
        resolve(hash);
      });
    });
  });
};

let verifyHash = async (str, hash) => {
  const res = await bcrypt.compare(str, hash);
  if (!res) return Promise.reject("Did Not Match");
  return res;
};

module.exports = { generateCode, sendMail, verifyCode, updateRedis, generateHash, verifyHash };
