const router = require("express").Router();
const ctrl = require("../controllers/userController");
const { authMiddleware } = require("../middleware/auth");

router.post("/", authMiddleware(["admin"]), ctrl.create);
router.get("/", authMiddleware(["admin", "librarian"]), ctrl.list);
router.get("/:id", authMiddleware(["admin", "librarian", "reader"]), isEdit, ctrl.get);
router.put("/:id", authMiddleware(["admin", "librarian", "reader"]), isEdit, ctrl.update);
router.delete("/:id", authMiddleware(["admin"]), ctrl.remove);
router.post("/:id/role", authMiddleware(["admin"]), ctrl.setRole);

module.exports = router;