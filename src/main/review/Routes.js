const router = require("express").Router();
const auth = require("../../middleware/Auth");
const c = require("./RoutesController");
const e = require("../../handler/Error");

router.get("/all", e.catchErrors(c.getAllByProducts));
router.post("/", auth(), c.validate, e.catchErrors(c.create));
router.get("/", auth(), e.catchErrors(c.list));
router.get("/product", auth(), e.catchErrors(c.getByUserAndProduct));
router.get("/:id", auth(), e.catchErrors(c.get));
router.patch("/:id", auth(), e.catchErrors(c.update));
router.delete("/:id", auth(), e.catchErrors(c.remove));

module.exports = router;
