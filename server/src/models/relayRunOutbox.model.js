import mongoose from 'mongoose';
import { AVAILABLE_OUTBOX_STATUS } from '../constants.js';

const relayRunOutboxSchema = new mongoose.Schema({
  relayRunId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RelayRun',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    enum: AVAILABLE_OUTBOX_STATUS,
    default: 'pending',
    index: true
  },
  retryCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

relayRunOutboxSchema.index({ status: 1, createdAt: 1 });
relayRunOutboxSchema.index({ relayRunId: 1, status: 1 });
relayRunOutboxSchema.index({ userId: 1, status: 1 });

export const RelayRunOutbox = mongoose.model('RelayRunOutbox', relayRunOutboxSchema);
