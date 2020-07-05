const router = require("express").Router();
const e = require("../../handler/Error");
const c = require("./RoutesController");
const auth = require("../../middleware/Auth");

router.post("/grant", e.catchErrors(c.grant));
router.post("/calculate", e.catchErrors(c.calculate));
router.post("/access", e.catchErrors(c.access));

router.get("/:entity/search", auth(), e.catchErrors(c.search));

router.get("/role", auth(), e.catchErrors(c.role.list));
router.post("/role", auth(), e.catchErrors(c.role.create));
router.get("/role/:id", auth(), e.catchErrors(c.role.get));
router.patch("/role/:id", e.catchErrors(c.role.update));
router.delete("/role/:id", auth(), e.catchErrors(c.role.delete));
router.post("/role/:name/permissions", auth(), e.catchErrors(c.role.removePerms));

module.exports = router;
