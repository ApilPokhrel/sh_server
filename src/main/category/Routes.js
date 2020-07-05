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
router.get("/subtype", auth(), e.catchErrors(c.listCategorySubType));
router.get("/subtype/all", e.catchErrors(c.all));
router.get("/subtype/:id", auth(), e.catchErrors(c.getCategorySubType));
router.patch("/subtype/:id", auth(), e.catchErrors(c.updateCategorySubType));
router.delete("/subtype/:id", auth(), e.catchErrors(c.removeCategorySubType));
router.post("/subtype/:id/profile", auth(), f.upload, e.catchErrors(c.updateProfile));

//TODO Category Type
router.post("/type", auth(), c.validateCategoryType, e.catchErrors(c.createCategoryType));
router.get("/type", auth(), e.catchErrors(c.listCategoryType));
router.get("/type/:id", auth(), e.catchErrors(c.getCategoryType));
router.get("/type/:category/category", auth(), e.catchErrors(c.getByCategory));
router.patch("/type/:id", auth(), e.catchErrors(c.updateCategoryType));
router.delete("/type/:id", auth(), e.catchErrors(c.removeCategoryType));
router.post("/type/upload/:id", auth(), f.upload, e.catchErrors(c.uploadTypeFiles));
router.delete("/type/:id/file", auth(), e.catchErrors(c.removeTypeFile));

//TODO Category
router.post("/", auth(), c.validateCategory, e.catchErrors(c.createCategory));
router.get("/", auth(), e.catchErrors(c.listCategory));
router.get("/:slug", auth(), e.catchErrors(c.getCategory));
router.patch("/:slug", auth(), e.catchErrors(c.updateCategory));
router.delete("/:id", auth(), e.catchErrors(c.removeCategory));
router.post("/upload/:slug", auth(), f.upload, e.catchErrors(c.uploadCategoryFiles));
router.delete("/:id/file", auth(), e.catchErrors(c.removeCategoryFile));

module.exports = router;
