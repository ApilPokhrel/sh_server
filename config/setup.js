const User = require("../src/main/user/Schema");
const Role = require("../src/main/auth/RoleSchema");

let init = async () => {
  let rPayload = {
    name: "super_admin",
    is_admin: true,
    permissions: [],
    desc: "Super Admin can do anything"
  };

  let role = Role(rPayload);
  await role.save();

  let uPayload = {
    name: {
      first: "Suresh",
      last: "Parajuli"
    },
    contact: [
      {
        type: "email",
        address: "",
        is_verified: true
      },
      {
        type: "phone",
        address: "9858022037",
        is_verified: true
      }
    ],
    roles: ["super_admin"],
    is_verified: true,
    password: "a1a2a3a4"
  };

  let user = await User(uPayload);
  await user.save();
};

init();
