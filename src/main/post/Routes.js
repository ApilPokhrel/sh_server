const router = require("express").Router();
const e = require("../../handler/Error");
const c = require("./RoutesController");
const auth = require("../../middleware/Auth");
const f = require("../../handler/File");

router.post("/", auth(), f.upload, c.validate, e.catchErrors(c.create));
router.get("/", auth(), e.catchErrors(c.list));
router.get("/all", e.catchErrors(c.list));
router.get("/:id", auth(), e.catchErrors(c.get));
router.patch("/:id", auth(), e.catchErrors(c.update));
router.delete("/:id", auth(), e.catchErrors(c.remove));
router.post("/:id/file", auth(), f.upload, e.catchErrors(c.updateFile));

module.exports = router;
