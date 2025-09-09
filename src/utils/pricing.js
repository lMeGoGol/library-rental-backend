const DISCOUNT = { none:0, student:20, loyal:15, pensioner:50, vip:30 };
const PENALTY_PER_DAY = 10;
const DAMAGE_FEE = { none:0, minor:100, moderate:300, severe:800 };

function discountPercent(cat) { return DISCOUNT[cat] ?? 0; }
function calcTotal(pricePerDay, days, discPercent) {
    const raw = pricePerDay * days;
    return Math.max(0, Math.round((raw - raw * (discPercent/100)) * 100) / 100);
}
function calcPenalty(expected, actual) {
    if (!actual || actual <= expected) return 0;
    const d = Math.ceil((actual.getTime() - expected.getTime()) / (1000*60*60*24));
    return d * PENALTY_PER_DAY;
}
function damageFeeForLevel(level) { return DAMAGE_FEE[level] ?? 0; }

module.exports = { PENALTY_PER_DAY, discountPercent, calcTotal, calcPenalty, damageFeeForLevel };