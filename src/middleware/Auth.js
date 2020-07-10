const User = require("../main/user/Schema");
const AuthToken = require("../util/AuthToken");
const Role = require("../main/auth/RoleSchema");

module.exports = (...perms) => {
  return async function (req, res, next) {
    try {
      let { token } = req.headers || req.body || req.query;
      let user = null;
      let d = await AuthToken.decodeAccessToken(token);
      if (!d) {
        res.status(401).send("Unable to decode token");
        return;
      }
      let rExist = await redisClient.exists(d._id);
      if (rExist === 1) {
        let userStr = redisClient.get(d._id);
        user = JSON.parse(userStr);
      } else {
        user = await getUser(d._id);
        if (!user) {
          res.status(401).send("User Not Found");
          return;
        }
        let key = user._id.toString();
        await redisClient.set(key, JSON.stringify(user));
        await redisClient.expire(key, process.env.REDIS_EXPIRE);
        user = user;
      }
      if (!user.is_verified) {
        res.status(403).send("Not Verified");
        return;
      }

      if (!user.is_admin) {
        if (perms && perms.length) {
          await calculateAuth(user.perms, perms);
        }
      }
      req.user = user;
      next();
    } catch (err) {
      console.log(err);
      res.status(401).send(err);
    }
  };
};

let calculateAuth = async (user_perms, perms) => {
  return new Promise(async (resolve, reject) => {
    if (checkPermissions(user_perms, perms)) {
      resolve();
    } else {
      reject("Permission Denied");
    }
  });
};

const checkPermissions = (user_perm, access_perm) => {
  if (!user_perm || !user_perm.length) {
    return;
  }
  return user_perm.some(v => access_perm.indexOf(v) !== -1);
};

let getUser = async id => {
  let data = await User.findById(id);
  let perms = [];
  let is_admin = false;
  for (let r of data.roles) {
    let role = await Role.findOne({ name: r });
    if (role) {
      if (!is_admin) {
        is_admin = role.is_admin;
      }
      role.permissions.forEach(e => perms.push(e));
    }
  }
  data.perms = perms;
  data.is_admin = is_admin;
  return data;
};
