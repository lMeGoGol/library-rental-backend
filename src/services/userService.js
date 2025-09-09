const User = require('../models/User');
const { createError } = require('../utils/errors');

class UserService {
    async create(data) {
        const exists = await User.exists({ username: data.username });
        if (exists) throw createError(400, 'USERNAME_TAKEN', 'Username already taken');
        const user = new User(data);
        await user.save();
        return user;
    }

    async list({ page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', q, role } = {}) {
        const filter = {};
        if (q) {
            filter.$or = [
                { username: { $regex: q, $options: 'i' } },
                { firstName: { $regex: q, $options: 'i' } },
                { lastName: { $regex: q, $options: 'i' } },
            ];
        }
        if (role) filter.role = role;
        const sort = { [sortBy]: order === 'asc' ? 1 : -1 };
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            User.find(filter).sort(sort).skip(skip).limit(limit).lean(),
            User.countDocuments(filter),
        ]);
        return { items, page, limit, total, pages: Math.ceil(total / limit) };
    }

    async get(id) {
        const user = await User.findById(id);
        if (!user) throw createError(404, 'USER_NOT_FOUND', 'User not found');
        return user;
    }

    async update(id, data) {
        const user = await User.findByIdAndUpdate(id, data, { new: true });
        if (!user) throw createError(404, 'USER_NOT_FOUND', 'User not found');
        return user;
    }

    async remove(id) {
        await User.findByIdAndDelete(id);
    }

    async isUsernameTaken(username) {
        if (!username) return false;
        const exists = await User.exists({ username });
        return !!exists;
    }

    async setRole(id, role) {
        if (!['admin','librarian','reader'].includes(role)) throw createError(400, 'INVALID_ROLE', 'Invalid role');
        const user = await User.findByIdAndUpdate(id, { role }, { new: true });
        if (!user) throw createError(404, 'USER_NOT_FOUND', 'User not found');
        return user;
    }

    async setDiscount(id, discountCategory) {
        const allowed = ['none','student','loyal','pensioner','vip'];
        if (discountCategory && !allowed.includes(discountCategory)) {
            throw createError(400, 'INVALID_DISCOUNT', 'Invalid discount category');
        }
        const user = await User.findById(id);
        if (!user) throw createError(404, 'USER_NOT_FOUND', 'User not found');
        if (user.role !== 'reader') throw createError(400, 'NOT_READER', 'Target is not reader');
        user.discountCategory = discountCategory;
        await user.save();
        return user;
    }

    async changePassword(userId, currentPassword, newPassword) {
        const user = await User.findById(userId);
        if (!user) throw createError(404, 'USER_NOT_FOUND', 'User not found');
        const ok = await user.comparePassword(currentPassword);
        if (!ok) throw createError(400, 'INVALID_CREDENTIALS', 'Current password is incorrect');
        user.password = newPassword;
        await user.save();
        return true;
    }

    async adminSetPassword(targetUserId, newPassword) {
        const user = await User.findById(targetUserId);
        if (!user) throw createError(404, 'USER_NOT_FOUND', 'User not found');
        user.password = newPassword;
        await user.save();
        return true;
    }
}

module.exports = new UserService();
