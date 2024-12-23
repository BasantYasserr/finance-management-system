import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['bonus_request', 'bonus_approved', 'bonus_rejected', 'system_alert'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    relatedTo: {
      model: {
        type: String,
        enum: ['Bonus', 'User']
      },
      id: mongoose.Schema.Types.ObjectId
    },
    read: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });
  
  // Add notification methods
  notificationSchema.statics.markAsRead = async function(notificationId) {
    return this.findByIdAndUpdate(notificationId, { read: true }, { new: true });
  };
  
  notificationSchema.statics.getUnreadCount = async function(userId) {
    return this.countDocuments({ recipient: userId, read: false });
  };
  
  export const Notification = mongoose.model('Notification', notificationSchema);