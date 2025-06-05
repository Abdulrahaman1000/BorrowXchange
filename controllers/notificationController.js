const Notification = require('../models/Notification');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });

    const enriched = await Promise.all(
      notifications.map(async (note) => {
        let updatedMessage = note.message;

        // Only customize message if it's a "pending transfer" type
        if (note.message.includes('pending transfer')) {
          const transaction = await Transaction.findOne({
            receiver: req.user.id,
            status: 'PENDING'
          }).sort({ createdAt: -1 });

          if (transaction) {
            const sender = await User.findById(transaction.sender);
            if (sender) {
              updatedMessage = `You received ${transaction.amount} from ${sender.name} (pending)`;
            }
          }
        }

        return {
          _id: note._id,
          user: note.user,
          message: updatedMessage,
          read: note.read,
          createdAt: note.createdAt,
          __v: note.__v
        };
      })
    );

    res.status(200).json(enriched);
  } catch (err) {
    console.error('Error getting notifications:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
