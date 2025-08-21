const router = require("express").Router();
const ctrl = require("../controllers/bookController");
const { authMiddleware } = require("../middleware/auth");

router.post("/", authMiddleware(["admin", "librarian"]), ctrl.create);
router.get("/", authMiddleware(["admin", "librarian", "reader"]), ctrl.list);
router.get("/:id", authMiddleware(["admin", "librarian", "reader"]),  ctrl.get);
router.put("/:id", authMiddleware(["admin", "librarian"]), ctrl.update);
router.delete("/:id", authMiddleware(["admin"]), ctrl.remove);

module.exports = router;