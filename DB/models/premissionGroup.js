import mongoose from 'mongoose';

const permissionGroupSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true
    },
    description: String,
    permissions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Permission'
    }],
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
});

export const PermissionGroup = mongoose.model('PermissionGroup', permissionGroupSchema);