const bookService = require('../services/bookService');

exports.create = async (req, res) => {
    const book = await bookService.create(req.body);
    res.status(201).json(book);
};

exports.list = async (req, res) => {
    const isReader = req.user && req.user.role === 'reader';
    const query = { ...req.query };
    if (isReader) query.available = true;
    const items = await bookService.list(query);
    res.json(items);
};

exports.get = async (req, res) => {
    const item = await bookService.get(req.params.id);
    res.json(item);
}

exports.update = async (req, res) => {
    const item = await bookService.update(req.params.id, req.body);
    res.json(item);
}

exports.remove = async (req, res) => {
    await bookService.remove(req.params.id);
    res.status(204).end();
};