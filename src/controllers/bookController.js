const Book = require("../models/Book");

exports.create = async (req, res) => {
    const book = await Book.create(req.body);
    res.status(201).json(book);
};

exports.list = async (req, res) => {
    const items = await Book.find();
    res.json(items);
};

exports.get = async (req, res) => {
    const item = await Book.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
}

exports.update = async (req, res) => {
    const item = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
}

exports.remove = async (req, res) => {
    await Book.findByIdAndDelete(req.params.id);
    res.status(204).end();
};