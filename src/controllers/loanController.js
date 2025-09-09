const loanService = require('../services/loanService');
const reservationService = require('../services/reservationService');

exports.issue = async (req, res) => {
    const result = await loanService.issue(req.body);
    res.status(201).json(result);
};

exports.issuePreview = async (req, res) => {
    const result = await loanService.issuePreview(req.body);
    res.json(result);
};

exports.returnLoan = async (req, res) => {
    const result = await loanService.returnLoan(req.params.id, req.body);
    res.json(result);
};

exports.list = async (req, res) => {
    res.json(await loanService.listForUser(req.user, req.query));
};

exports.getLoan = async (req, res) => {
    const loan = await loanService.getById(req.user, req.params.id);
    res.json(loan);
};

exports.previewReturn = async (req, res) => {
    const preview = await loanService.previewReturn(req.params.id);
    res.json(preview);
};

exports.renew = async (req, res) => {
    const loan = await loanService.renew(req.params.id, req.body);
    res.json(loan);
};

exports.reserve = async (req, res) => {
    const readerId = req.body.readerId || req.user.id;
    const { bookId, desiredDays } = req.body;
    const reservation = await reservationService.create({ bookId, readerId, desiredDays });
    res.status(201).json(reservation);
};

exports.listOverdue = async (req, res) => {
    const result = await loanService.listOverdue(req.user, req.query);
    res.json(result);
};

