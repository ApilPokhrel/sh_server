const router = require("express").Router();
const e = require("../../handler/Error");
const c = require("./RoutesController");
const auth = require("../../middleware/Auth");
const f = require("../../handler/File");

//TODO Category subtype
router.post(
  "/subtype",
  auth(),
  f.upload,
  c.validateSubType,
  e.catchErrors(c.createCategorySubType)
);
router.get("/subtype", auth("super_admin"), e.catchErrors(c.listCategorySubType));
router.get("/subtype/all", e.catchErrors(c.all));
router.get("/subtype/:id", auth("super_admin"), e.catchErrors(c.getCategorySubType));
router.patch("/subtype/:id", auth("super_admin"), e.catchErrors(c.updateCategorySubType));
router.delete("/subtype/:id", auth("super_admin"), e.catchErrors(c.removeCategorySubType));
router.post("/subtype/:id/profile", auth("super_admin"), f.upload, e.catchErrors(c.updateProfile));

//TODO Category Type
router.post(
  "/type",
  auth("super_admin"),
  c.validateCategoryType,
  e.catchErrors(c.createCategoryType)
);
router.get("/type", auth("super_admin"), e.catchErrors(c.listCategoryType));
router.get("/type/:id", auth("super_admin"), e.catchErrors(c.getCategoryType));
router.get("/type/:category/category", auth("super_admin"), e.catchErrors(c.getByCategory));
router.patch("/type/:id", auth("super_admin"), e.catchErrors(c.updateCategoryType));
router.delete("/type/:id", auth("super_admin"), e.catchErrors(c.removeCategoryType));
router.post("/type/upload/:id", auth("super_admin"), f.upload, e.catchErrors(c.uploadTypeFiles));
router.delete("/type/:id/file", auth("super_admin"), e.catchErrors(c.removeTypeFile));

//TODO Category
router.post("/", auth("super_admin"), c.validateCategory, e.catchErrors(c.createCategory));
router.get("/", auth("super_admin"), e.catchErrors(c.listCategory));
router.get("/:slug", auth("super_admin"), e.catchErrors(c.getCategory));
router.patch("/:slug", auth("super_admin"), e.catchErrors(c.updateCategory));
router.delete("/:id", auth("super_admin"), e.catchErrors(c.removeCategory));
router.post("/upload/:slug", auth("super_admin"), f.upload, e.catchErrors(c.uploadCategoryFiles));
router.delete("/:id/file", auth("super_admin"), e.catchErrors(c.removeCategoryFile));

module.exports = router;
