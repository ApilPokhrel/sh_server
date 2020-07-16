const router = require("express").Router();
const e = require("../../handler/Error");
const c = require("./RoutesController");
const auth = require("../../middleware/Auth");
const f = require("../../handler/File");

router.post("/", auth("super_admin"), f.upload, c.validate, e.catchErrors(c.create));
router.get("/", auth("super_admin"), e.catchErrors(c.list));
router.get("/all", e.catchErrors(c.list));
router.get("/:id", auth("super_admin"), e.catchErrors(c.get));
router.patch("/:id", auth("super_admin"), e.catchErrors(c.update));
router.delete("/:id", auth("super_admin"), e.catchErrors(c.remove));
router.post("/:id/file", auth("super_admin"), f.upload, e.catchErrors(c.updateFile));

module.exports = router;
