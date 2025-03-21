const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String, required: true },
  type: { type: String, enum: ['global', 'cible'], default: 'global' },//global pour toute les users et cible pour un receipent sepecifique
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
