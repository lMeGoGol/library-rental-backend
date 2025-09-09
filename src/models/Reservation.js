const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  reader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  desiredDays: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'fulfilled', 'cancelled'], default: 'pending' },
  cancelReason: { type: String }
}, { timestamps: true });

reservationSchema.index({ book: 1, createdAt: 1 });
reservationSchema.index({ status: 1, createdAt: 1 });
reservationSchema.index({ reader: 1, status: 1 });

reservationSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Reservation', reservationSchema);
