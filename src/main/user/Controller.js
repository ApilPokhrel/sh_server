const Mailer = require("../../util/Mailer");

let generateCode = async user_id => {
  let key = "code";
  let code = Math.random().toString(36).substring(6);
  let expire = 400000;
  await redisClient.set(`${code}-${user_id}`, code);
  await redisClient.expire(key, expire);
  return code;
};

let updateRedis = async id => {
  let rExist = await redisClient.exists(id);
  if (rExist) {
    let userStr = redisClient.get(id);
    user = JSON.parse(userStr);
    user.is_verified = true;
    await redisClient.set(id, JSON.stringify(user));
    await redisClient.expire(id, process.env.REDIS_EXPIRE);
  }
};

let verifyCode = async code => {
  let rExist = await redisClient.exists(code);
  if (rExist !== 1) return Promise.reject("Code Expired");
};

let sendMail = async ({ to, user_id }) => {
  let template = Mailer.TEMPLATES.SIGNUP_CREDENTIALS;
  let code = await generateCode(user_id);
  Mailer.sendMail(to, { code }, template);
  return code;
};

module.exports = { generateCode, sendMail, verifyCode, updateRedis };
