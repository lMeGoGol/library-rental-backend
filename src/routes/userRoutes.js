const router = require("express").Router();
const ctrl = require("../controllers/userController");
const { authMiddleware, isEdit } = require("../middleware/auth");
const { validate } = require('../middleware/validate');
const { validateObjectIdParam } = require('../middleware/params');
const { updateUserSchema, setRoleSchema, setDiscountSchema, changePasswordSchema, adminChangePasswordSchema } = require('../schemas/userSchemas');
const { usersListQuerySchema } = require('../schemas/querySchemas');
const asyncHandler = require('../middleware/asyncHandler');

router.post("/", authMiddleware(["admin"]), asyncHandler(ctrl.create));
router.get('/check-username', asyncHandler(ctrl.isUsernameTaken));
router.get('/me', authMiddleware(["admin","librarian","reader"]), asyncHandler(async (req, res) => {
	res.json(req.user);
}));
router.get("/", authMiddleware(["admin", "librarian"]), validate(usersListQuerySchema, 'query'), asyncHandler(ctrl.list));
router.get("/:id", validateObjectIdParam('id'), authMiddleware(["admin", "librarian", "reader"]), isEdit, asyncHandler(ctrl.get));
router.put("/:id", validateObjectIdParam('id'), authMiddleware(["admin", "librarian", "reader"]), isEdit, validate(updateUserSchema), asyncHandler(ctrl.update));
router.delete("/:id", validateObjectIdParam('id'), authMiddleware(["admin"]), asyncHandler(ctrl.remove));
router.post("/:id/role", validateObjectIdParam('id'), authMiddleware(["admin"]), validate(setRoleSchema), asyncHandler(ctrl.setRole));
router.post('/:id/discount', validateObjectIdParam('id'), authMiddleware(["admin","librarian"]), validate(setDiscountSchema), asyncHandler(ctrl.setDiscount));
router.post('/me/change-password', authMiddleware(["admin","librarian","reader"]), validate(changePasswordSchema), asyncHandler(ctrl.changePassword));
router.post('/:id/change-password', validateObjectIdParam('id'), authMiddleware(["admin","librarian"]), validate(adminChangePasswordSchema), asyncHandler(ctrl.adminChangePassword));

module.exports = router;