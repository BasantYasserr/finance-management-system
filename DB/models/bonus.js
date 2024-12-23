import mongoose from "mongoose";

const bonusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  title: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },  
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  attachments: [
    {
      fileName: String,
      fileUrl: String,
      uploadDate: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  approvalHistory: [
    {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      comment: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  submissionDate: {
    type: Date,
    default: Date.now,
  },
  processedDate: Date,
});

// Define statics explicitly
bonusSchema.statics.updateStatus = async function (
  bonusId,
  status,
  updatedBy,
  comment
) {
  return await this.findByIdAndUpdate(
    bonusId,
    {
      $set: { status },
      $push: {
        approvalHistory: {
          status,
          updatedBy,
          comment,
          date: new Date(),
        },
      },
    },
    { new: true }
  );
};

bonusSchema.statics.getMonthlyReport = async function (month, year) {
  return await this.aggregate([
    {
      $match: {
        status: "approved",
        $expr: {
          $and: [
            { $eq: [{ $month: "$submissionDate" }, month] },
            { $eq: [{ $year: "$submissionDate" }, year] },
          ],
        },
      },
    },
    {
      $group: {
        _id: "$userId",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);
};

bonusSchema.statics.getPendingRequests = async function (
  month,
  year,
  status = null
) {
  if (!status) return await this.find({});

  return await this.find({
    status: status,
  });
};

export const Bonus = mongoose.model("Bonus", bonusSchema);
