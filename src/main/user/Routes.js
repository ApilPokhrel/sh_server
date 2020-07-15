const router = require("express").Router();
const e = require("../../handler/Error");
const c = require("./RoutesController");
const auth = require("../../middleware/Auth");

router.get("/", auth(), e.catchErrors(c.list));
router.post("/register", c.validateRegister, e.catchErrors(c.register));
router.get("/code", auth(), e.catchErrors(c.sendCode));
router.post("/code", auth(), e.catchErrors(c.verifyCode));
router.post("/sendcode", e.catchErrors(c.sendCodeUnverified));

router.post("/reset", e.catchErrors(c.resetPass));

router.get("/:address/check", e.catchErrors(c.getByContact));
router.post("/login", c.validateLogin, e.catchErrors(c.login));
router.get("/:id", auth(), e.catchErrors(c.get));
router.patch("/:id", auth(), e.catchErrors(c.edit));
router.delete("/:id", auth(), e.catchErrors(c.delete));

module.exports = router;
