const router = require("express").Router();
const ctrl = require("../controllers/loanController");
const { authMiddleware } = require("../middleware/auth");

router.post("/issue", authMiddleware(["admin", "librarian"]), ctrl.issue);
router.post("/return/:id", authMiddleware(["admin", "librarian"]), ctrl.returnLoan);
router.get("/", authMiddleware(["admin", "librarian", "reader"]), ctrl.list);

module.exports = router;