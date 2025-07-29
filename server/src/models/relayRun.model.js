import mongoose from 'mongoose';
import { AVAILABLE_RELAY_RUN_STATUS, AVAILABLE_EXECUTION_STATUS } from '../constants.js';

const executionHistorySchema = new mongoose.Schema({
  actionOrder: {
    type: Number,
    required: true
  },
  actionName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: AVAILABLE_EXECUTION_STATUS,
    required: true
  },
  output: {
    type: String
  },
  error: {
    type: String
  },
  executedAt: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number // in milliseconds
  }
});

const relayRunSchema = new mongoose.Schema({
  relayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relay',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: AVAILABLE_RELAY_RUN_STATUS,
    default: 'pending'
  },
  triggerMetadata: {
    type: mongoose.Schema.Types.Mixed
  },
  executionHistory: [executionHistorySchema],
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  totalDuration: {
    type: Number
  },
  errorMessage: {
    type: String
  },
  currentStage: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

relayRunSchema.index({ relayId: 1, createdAt: -1 });
relayRunSchema.index({ userId: 1, createdAt: -1 });
relayRunSchema.index({ status: 1 });

relayRunSchema.pre('save', function(next) {
  if (this.completedAt && this.startedAt) {
    this.totalDuration = this.completedAt.getTime() - this.startedAt.getTime();
  }
  next();
});

export const RelayRun = mongoose.model('RelayRun', relayRunSchema);
