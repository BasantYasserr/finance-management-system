import mongoose from "mongoose";

const bonusSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    title: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    attachments: [{
      fileName: String,
      fileUrl: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }],
    approvalHistory: [{
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected']
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comment: String,
      date: {
        type: Date,
        default: Date.now
      }
    }],
    submissionDate: {
      type: Date,
      default: Date.now
    },
    processedDate: Date
  });
  
  // Add bonus methods
  class BonusMethods {
    static async updateStatus(bonusId, status, updatedBy, comment) {
      return await this.findByIdAndUpdate(
        bonusId,
        {
          $set: { status },
          $push: {
            approvalHistory: {
              status,
              updatedBy,
              comment,
              date: new Date()
            }
          }
        },
        { new: true }
      );
    }
  
    static async getMonthlyReport(month, year) {
      return await this.aggregate([
        {
          $match: {
            status: 'approved',
            $expr: {
              $and: [
                { $eq: [{ $month: '$submissionDate' }, month] },
                { $eq: [{ $year: '$submissionDate' }, year] }
              ]
            }
          }
        },
        {
          $group: {
            _id: '$userId',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]);
    }
  }
  
  // Apply the methods to the schema
  Object.getOwnPropertyNames(BonusMethods).forEach(method => {
    bonusSchema.statics[method] = BonusMethods[method];
});

export const Bonus = mongoose.model('Bonus', bonusSchema)