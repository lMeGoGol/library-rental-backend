const DISCOUNTS = {
    none: 0,
    student: 20,
    loyal: 15,
    pensioner: 50,
    vip: 30
};

const PENALTY_PER_DAY = 10;

function discountPercent(category = "none") {
    return DISCOUNTS[category] ?? 0;
}

function calcTotal(basePerDay, days, discountPercent) {
    const raw = basePerDay * days;
    const discount = raw * (discountPercent / 100);
    return Math.max(0, Math.round((raw - discount) * 100) / 100);
}

function daysBetween(a, b) {
    const ms = b.getTime() - a.getTime();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function calcPenalty(expected, actual) {
    if (!actual || actual <= expected) return 0;
    const d = daysBetween(expected, actual);
    return d * PENALTY_PER_DAY;
}

module.exports = {
    PENALTY_PER_DAY,
    discountPercent,
    calcTotal,
    calcPenalty,
    daysBetween
};