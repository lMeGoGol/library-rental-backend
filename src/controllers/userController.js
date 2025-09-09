const userService = require('../services/userService');

exports.create = async (req, res) => {
    const user = await userService.create(req.body);
    res.status(201).json(user);
};

exports.list = async (req, res) => {
    const items = await userService.list(req.query);
    res.json(items);
};

exports.get = async (req, res) => {
    const item = await userService.get(req.params.id);
    res.json(item);
}

exports.update = async (req, res) => {
    const item = await userService.update(req.params.id, req.body);
    res.json(item);
}

exports.remove = async (req, res) => {
    await userService.remove(req.params.id);
    res.status(204).end();
};

exports.setRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    const user = await userService.setRole(id, role);
    res.json({ message: 'Role updated', user });
};

exports.isUsernameTaken = async (req, res) => {
    const { username } = req.query;
    res.json({ taken: await userService.isUsernameTaken(username) });
};

exports.setDiscount = async (req, res) => {
    const { id } = req.params;
    const { discountCategory } = req.body;
    const user = await userService.setDiscount(id, discountCategory);
    res.json({ message: 'Discount updated', user });
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await userService.changePassword(req.user.id, currentPassword, newPassword);
    res.json({ message: 'Password changed' });
};

exports.adminChangePassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    await userService.adminSetPassword(id, newPassword);
    res.json({ message: 'Password changed' });
};