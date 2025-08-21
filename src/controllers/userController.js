const User = require("../models/User");

exports.create = async (req, res) => {
    const user = await User.create(req.body);
    res.status(201).json(user);
};

exports.list = async (req, res) => {
    const items = await User.find();
    res.json(items);
};

exports.get = async (req, res) => {
    const item = await User.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
}

exports.update = async (req, res) => {
    const item = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
}

exports.remove = async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).end();
};

exports.setRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!["admin", "librarian"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Role updated", user });
};