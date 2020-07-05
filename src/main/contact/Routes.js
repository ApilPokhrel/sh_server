const router = require("express").Router();
const e = require("../../handler/Error");
const c = require("./RoutesController");
const auth = require("../../middleware/Auth");

router.post("/", c.validate, e.catchErrors(c.create));
router.get("/", auth(), e.catchErrors(c.list));
router.get("/:id", auth(), e.catchErrors(c.get));
router.patch("/:id", auth(), e.catchErrors(c.update));
router.delete("/:id", auth(), e.catchErrors(c.remove));

module.exports = router;
