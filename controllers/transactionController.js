const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.transfer = async (req, res) => {
  const { receiver_wallet_id, amount } = req.body;

  try {
    const senderWallet = await Wallet.findOne({ user: req.user.id });
    const receiverWallet = await Wallet.findOne({ walletId: receiver_wallet_id });

    if (!receiverWallet || senderWallet.walletId === receiver_wallet_id) {
      return res.status(400).json({ message: 'Invalid receiver' });
    }

    if (senderWallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Deduct amount temporarily until accepted
    senderWallet.balance -= amount;
    await senderWallet.save();

    const transaction = await Transaction.create({
      sender: req.user.id,
      receiver: receiverWallet.user,
      amount,
      status: 'PENDING'
    });

    await Notification.create({
      user: receiverWallet.user,
      message: 'You have a pending transfer'
    });

    res.status(201).json({
      message: 'Transfer initiated successfully',
      transaction: {
        _id: transaction._id,
        sender: transaction.sender,
        receiver: transaction.receiver,
        amount: transaction.amount,
        status: transaction.status.toLowerCase()
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.acceptTransaction = async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction || transaction.status !== 'PENDING')
    return res.status(400).json({ message: 'Invalid transaction' });

  const receiverWallet = await Wallet.findOne({ user: transaction.receiver });
  receiverWallet.balance += transaction.amount;
  transaction.status = 'COMPLETED';

  await transaction.save();
  await receiverWallet.save();
  await Notification.create({ user: transaction.sender, message: 'Transfer accepted' });

  res.status(200).json({
    message: 'Transfer completed successfully',
    transaction: {
      _id: transaction._id,
      sender: transaction.sender,
      receiver: transaction.receiver,
      amount: transaction.amount,
      status: transaction.status
    }
  });
};

exports.declineTransaction = async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction || transaction.status !== 'PENDING')
    return res.status(400).json({ message: 'Invalid transaction' });

  const senderWallet = await Wallet.findOne({ user: transaction.sender });
  senderWallet.balance += transaction.amount;
  transaction.status = 'DECLINED';

  await transaction.save();
  await senderWallet.save();
  await Notification.create({ user: transaction.sender, message: 'Transfer declined' });

  res.status(200).json({
    message: 'Transfer declined successfully',
    transaction: {
      _id: transaction._id,
      sender: transaction.sender,
      receiver: transaction.receiver,
      amount: transaction.amount,
      status: transaction.status
    }
  });
};


exports.getTransactions = async (req, res) => {
  const { status, type, limit = 10, skip = 0 } = req.query;
  let query = { $or: [{ sender: req.user.id }, { receiver: req.user.id }] };

  if (status) query.status = status;
  if (type === 'sent') query.sender = req.user.id;
  if (type === 'received') query.receiver = req.user.id;

  const transactions = await Transaction.find(query).limit(+limit).skip(+skip);
  res.json(transactions);
};


exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 });

    res.json({ message: 'All transactions fetched', transactions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};
