const router = require("express").Router();
const auth = require("../../middleware/Auth");
const c = require("./RoutesController");
const e = require("../../handler/Error");
const f = require("../../handler/File");

router.post("/", auth(), f.upload, c.validate, e.catchErrors(c.add));
router.get("/all", e.catchErrors(c.all));
router.get("/filter", e.catchErrors(c.filter));

router.get("/", auth(), e.catchErrors(c.list));
router.get("/:id", auth(), e.catchErrors(c.get));
router.patch("/:id", auth(), e.catchErrors(c.update));
router.delete("/:id", auth(), e.catchErrors(c.remove));
router.get("/:slug/slug", e.catchErrors(c.getBySlug));
router.post("/:id/profile", auth(), f.upload, e.catchErrors(c.updateProfile));
router.post("/:id/files", auth(), f.upload, e.catchErrors(c.updateFiles));

module.exports = router;
