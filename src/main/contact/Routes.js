const router = require("express").Router();
const e = require("../../handler/Error");
const c = require("./RoutesController");
const auth = require("../../middleware/Auth");

router.post("/", c.validate, e.catchErrors(c.create));
router.get("/", auth("super_admin"), e.catchErrors(c.list));
router.get("/:id", auth("super_admin"), e.catchErrors(c.get));
router.patch("/:id", auth("super_admin"), e.catchErrors(c.update));
router.delete("/:id", auth("super_admin"), e.catchErrors(c.remove));

module.exports = router;
