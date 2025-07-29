import mongoose from 'mongoose';
import { AVAILABLE_ACTION_TYPES, AVAILABLE_TRIGGER_TYPES } from '../constants.js';

const actionInstanceSchema = new mongoose.Schema({
  actionId: {
    type: String,
    required: true,
    enum: AVAILABLE_ACTION_TYPES
  },

  config: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },

  name: {
    type: String,
    required: true
  },

  order: {
    type: Number,
    required: true
  }
}, { _id: false });

const triggerInstanceSchema = new mongoose.Schema({
  triggerId: {
    type: String,
    required: true,
    enum: AVAILABLE_TRIGGER_TYPES
  },

  config: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  name: {
    type: String,
    required: true
  }
}, { _id: false });

const relaySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  active: {
    type: Boolean,
    default: false
  },
  trigger: triggerInstanceSchema,
  actions: [actionInstanceSchema],

  webhookUrl: {
    type: String,
    unique: true,
    sparse: true
  },

  lastRunAt: {
    type: Date
  },
  runCount: {
    type: Number,
    default: 0
  },
  successCount: {
    type: Number,
    default: 0
  },
  failureCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

relaySchema.index({ "actions.actionId": 1 });
relaySchema.index({ "trigger.triggerId": 1 });
relaySchema.index({ userId: 1, active: 1 });

relaySchema.pre('save', function (next) {
  if (this.trigger.triggerId === 'INCOMING_WEBHOOK' && !this.webhookUrl) {
    const base = process.env.BACKEND_URL?.replace(/\/$/, '') || '';
    this.webhookUrl = `${base}/api/v1/hooks/catch/${this.userId}/${this._id}`;
  }
  next();
});

export const Relay = mongoose.model('Relay', relaySchema);
