const router = require("express").Router();
const e = require("../../handler/Error");
const c = require("./RoutesController");
const auth = require("../../middleware/Auth");

router.post("/", auth("super_admin"), c.validate, e.catchErrors(c.create));
router.get("/", auth("super_admin"), e.catchErrors(c.list));
router.get("/:name/name", auth(), e.catchErrors(c.getByName));
router.get("/:id", auth("super_admin"), e.catchErrors(c.get));
router.patch("/:id", auth("super_admin"), e.catchErrors(c.update));
router.delete("/:id", auth("super_admin"), e.catchErrors(c.remove));

module.exports = router;
