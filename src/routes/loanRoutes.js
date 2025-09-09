const router = require("express").Router();
const ctrl = require("../controllers/loanController");
const { authMiddleware } = require("../middleware/auth");
const asyncHandler = require('../middleware/asyncHandler');
const { validateObjectIdParam } = require('../middleware/params');
const { validate } = require('../middleware/validate');
const { issueLoanSchema, previewIssueSchema, returnLoanSchema, renewLoanSchema } = require('../schemas/loanSchemas');
const { createReservationSchema } = require('../schemas/reservationSchemas');
const { loansListQuerySchema, loansOverdueQuerySchema } = require('../schemas/querySchemas');

router.post("/issue", authMiddleware(["admin", "librarian"]), validate(issueLoanSchema), asyncHandler(ctrl.issue));
router.post('/issue/preview', authMiddleware(["admin", "librarian"]), validate(previewIssueSchema), asyncHandler(ctrl.issuePreview));
router.get('/preview-return/:id', validateObjectIdParam('id'), authMiddleware(["admin", "librarian"]), asyncHandler(ctrl.previewReturn));
router.post("/return/:id", validateObjectIdParam('id'), authMiddleware(["admin", "librarian"]), validate(returnLoanSchema), asyncHandler(ctrl.returnLoan));
router.post('/renew/:id', validateObjectIdParam('id'), authMiddleware(["admin", "librarian"]), validate(renewLoanSchema), asyncHandler(ctrl.renew));
router.get('/damage-levels', authMiddleware(["admin", "librarian"]), (req, res) => {
    const { damageFeeForLevel } = require('../utils/pricing');
    const { DAMAGE_LEVELS } = require('../config/constants');
    const UK = { minor: 'Легке', moderate: 'Середнє', severe: 'Серйозне' };
    res.json(DAMAGE_LEVELS.map(v => ({ value: v, label: UK[v] || v, fee: damageFeeForLevel(v) })));
});
router.post('/reserve', authMiddleware(["admin", "librarian", "reader"]), validate(createReservationSchema), asyncHandler(ctrl.reserve));
router.get('/overdue', authMiddleware(["admin", "librarian"]), validate(loansOverdueQuerySchema, 'query'), asyncHandler(ctrl.listOverdue));
router.get("/", authMiddleware(["admin", "librarian", "reader"]), validate(loansListQuerySchema, 'query'), asyncHandler(ctrl.list));
router.get("/:id", validateObjectIdParam('id'), authMiddleware(["admin", "librarian", "reader"]), asyncHandler(ctrl.getLoan));

module.exports = router;