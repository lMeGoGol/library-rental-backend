const router = require("express").Router();
const ctrl = require("../controllers/bookController");
const { authMiddleware } = require("../middleware/auth");
const { validateObjectIdParam } = require('../middleware/params');
const { validate } = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');
const { booksListQuerySchema } = require('../schemas/querySchemas');
const { createBookSchema, updateBookSchema } = require('../schemas/bookSchemas');
const Book = require('../models/Book');


router.post("/", authMiddleware(["admin", "librarian"]), validate(createBookSchema), asyncHandler(ctrl.create));
router.get("/", authMiddleware(["admin", "librarian", "reader"]), validate(booksListQuerySchema, 'query'), asyncHandler(ctrl.list));
router.get("/:id", validateObjectIdParam('id'), authMiddleware(["admin", "librarian", "reader"]), asyncHandler(ctrl.get));
router.put("/:id", validateObjectIdParam('id'), authMiddleware(["admin", "librarian"]), validate(updateBookSchema), asyncHandler(ctrl.update));
router.delete("/:id", validateObjectIdParam('id'), authMiddleware(["admin"]), asyncHandler(ctrl.remove));

// Manual release of reservation (admin/librarian)
router.post('/:id/release-reservation', validateObjectIdParam('id'), authMiddleware(['admin','librarian']), asyncHandler(async (req, res) => {
	const book = await Book.findById(req.params.id);
	if (!book) return res.status(404).json({ error: { message: 'Not found' } });
	book.isReserved = false;
	book.reservedUntil = null;
	if (book.quantity === 1) {
		const issued = await require('../models/IssuedBook').exists({ book: book._id, status: 'issued' });
		if (!issued) {
			book.availableCount = 1;
			book.available = true;
		}
	}
	await book.save();
	res.json({ message: 'Released', book });
}));

module.exports = router;