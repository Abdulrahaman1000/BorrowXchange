const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  walletId: { type: String, default: uuidv4 },
  balance: { type: Number, default: 0 },
});

module.exports = mongoose.model('Wallet', walletSchema);
