import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  service: {
    type: String,
    required: true,
    index: true
  },

  accountIdentifier: {
    type: String,
    required: false
  },

  encryptedCredentials: {
    type: String,
    required: true
  },

  iv: {
    type: String,
    required: true
  },

  isActive: {
    type: Boolean,
    default: true
  },

  lastUsedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

connectionSchema.index({ userId: 1, service: 1 });
connectionSchema.index({ userId: 1, isActive: 1 });
connectionSchema.index({ service: 1, isActive: 1 });

connectionSchema.index(
  { userId: 1, service: 1, isActive: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true }
  }
);

export const Connection = mongoose.model('Connection', connectionSchema);
