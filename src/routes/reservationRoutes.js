const router = require('express').Router();
const ctrl = require('../controllers/reservationController');
const { authMiddleware } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { validateObjectIdParam } = require('../middleware/params');

router.get('/', authMiddleware(['admin','librarian']), asyncHandler(ctrl.list));
router.get('/mine', authMiddleware(['admin','librarian','reader']), asyncHandler(ctrl.listMine));
router.post('/:id/cancel', validateObjectIdParam('id'), authMiddleware(['admin','librarian','reader']), asyncHandler(ctrl.cancel));

module.exports = router;
