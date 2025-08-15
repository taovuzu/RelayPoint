import { RelayRunOutbox } from '../models/relayRunOutbox.model.js';
import { getProducer, KAFKA_TOPICS } from '../config/kafka.js';
import { OUTBOX_STATUS } from '../constants.js';
import logger from '../utils/logger.js';

export class OutboxPoller {
  constructor(options = {}) {
    this.pollInterval = options.pollInterval || 5000; // 5 seconds
    this.batchSize = options.batchSize || 10;
    this.isRunning = false;
    this.timeoutId = null;
  }

  async start() {
    if (this.isRunning) {
      logger.warn('Outbox poller is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting outbox poller', {
      pollInterval: this.pollInterval,
      batchSize: this.batchSize
    });

    await this.poll();
  }


  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    logger.info('Outbox poller stopped');
  }

  async poll() {
    if (!this.isRunning) {
      return;
    }

    try {
      await this.processPendingEntries();
    } catch (error) {
      logger.error('Error in outbox poller', {
        error: error.message,
        stack: error.stack
      });
    }

    if (this.isRunning) {
      this.timeoutId = setTimeout(() => this.poll(), this.pollInterval);
    }
  }

  async processPendingEntries() {
    const producer = await getProducer();

    const pendingEntries = await RelayRunOutbox.find({
      status: OUTBOX_STATUS.PENDING
    })
      .sort({ createdAt: 1 })
      .limit(this.batchSize)
      .lean();

    if (pendingEntries.length === 0) {
      return;
    }

    logger.debug(`Processing ${pendingEntries.length} outbox entries`);

    const messages = [];
    const entryIds = [];

    for (const entry of pendingEntries) {
      try {
        await RelayRunOutbox.findByIdAndUpdate(entry._id, {
          status: OUTBOX_STATUS.PROCESSING,
          processedAt: new Date()
        });

        const message = {
          key: entry.relayRunId.toString(),
          value: JSON.stringify({
            relayRunId: entry.relayRunId.toString(),
            stage: entry.stage,
            eventType: entry.eventType,
            payload: entry.payload,
            timestamp: entry.createdAt.toISOString(),
            messageId: entry._id.toString()
          }),
          headers: {
            eventType: entry.eventType,
            relayRunId: entry.relayRunId.toString(),
            stage: entry.stage.toString(),
            messageId: entry._id.toString()
          }
        };

        messages.push(message);
        entryIds.push(entry._id);

      } catch (error) {
        logger.error('Error preparing outbox entry for Kafka', {
          entryId: entry._id,
          error: error.message
        });
      }
    }

    if (messages.length === 0) {
      return;
    }

    try {
      await producer.send({
        topic: KAFKA_TOPICS.WORKFLOWS,
        messages: messages
      });

      await RelayRunOutbox.deleteMany({
        _id: { $in: entryIds }
      });

      logger.info(`Successfully processed ${messages.length} outbox entries to Kafka`);

    } catch (error) {
      logger.error('Failed to send messages to Kafka', {
        error: error.message,
        messageCount: messages.length
      });

      await RelayRunOutbox.updateMany(
        { _id: { $in: entryIds } },
        {
          status: OUTBOX_STATUS.PENDING,
          $unset: { processedAt: 1 }
        }
      );

      throw error;
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      pollInterval: this.pollInterval,
      batchSize: this.batchSize
    };
  }
}

export const outboxPoller = new OutboxPoller();
