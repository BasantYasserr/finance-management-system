import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  });
  
export const Attachment = mongoose.model('Attachment', attachmentSchema);