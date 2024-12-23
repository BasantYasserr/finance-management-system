import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true
    },
    description: String,
    resource: {
      type: String,
      required: true
    },
    actions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete']
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  });
  
  export const Permission = mongoose.model('Permission', permissionSchema);