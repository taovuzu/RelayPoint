import { createConsumer, KAFKA_TOPICS } from '../config/kafka.js';
import { executeRelayStage } from '../services/actionExecutor.js';
import { RelayRun } from '../models/relayRun.model.js';
import { RelayRunOutbox } from '../models/relayRunOutbox.model.js';
import { RELAY_RUN_STATUS, OUTBOX_STATUS } from '../constants.js';
import logger from '../utils/logger.js';

export class RelayExecutorConsumer {
  constructor(options = {}) {
    this.groupId = options.groupId || 'relay-executor-workers';
    this.consumer = null;
    this.isRunning = false;
  }

  async start() {
    if (this.isRunning) {
      logger.warn('Relay executor consumer is already running');
      return;
    }

    try {
      this.consumer = createConsumer(this.groupId);

      await this.consumer.connect();
      logger.info('Relay executor consumer connected');

      await this.consumer.subscribe({
        topic: KAFKA_TOPICS.WORKFLOWS,
        fromBeginning: false
      });

      this.isRunning = true;

      await this.consumer.run({
        autoCommit: false,
        partitionsConsumedConcurrently: 3,
        eachMessage: async ({ topic, partition, message }) => {
          await this.processMessage({ topic, partition, message });
        },
      });

    } catch (error) {
      logger.error('Failed to start relay executor consumer', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  async stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    try {
      if (this.consumer) {
        await this.consumer.disconnect();
        this.consumer = null;
        logger.info('Relay executor consumer disconnected');
      }
    } catch (error) {
      logger.error('Error stopping relay executor consumer', {
        error: error.message,
        stack: error.stack
      });
    }
  }

  async processMessage({ topic, partition, message }) {
    const startTime = Date.now();
    let messageData = null;

    try {
      messageData = JSON.parse(message.value.toString());
      const { relayRunId, stage, eventType, messageId } = messageData;

      logger.debug('Processing workflow message', {
        relayRunId,
        stage,
        eventType,
        messageId,
        partition,
        offset: message.offset
      });

      if (!relayRunId || stage === undefined || !eventType) {
        throw new Error('Invalid message structure: missing required fields');
      }

      let result;
      switch (eventType) {
        case 'STAGE_EXECUTION':
          result = await this.executeStage(relayRunId, stage);
          break;
        case 'WORKFLOW_START':
          result = await this.startWorkflow(relayRunId);
          break;
        default:
          logger.warn('Unknown event type', { eventType, messageId });
          result = { success: false, error: `Unknown event type: ${eventType}` };
      }

      if (result.success) {
        if (result.nextStage !== null) {
          await this.queueNextStage(relayRunId, result.nextStage);
        }

        if (result.finalStatus) {
          await this.updateWorkflowStatus(relayRunId, result.finalStatus);
        }
      } else {
        await this.handleExecutionFailure(relayRunId, stage, result.error);
      }

      await this.consumer.commitOffsets([{
        topic,
        partition,
        offset: (parseInt(message.offset) + 1).toString()
      }]);

      const duration = Date.now() - startTime;
      logger.info('Successfully processed workflow message', {
        relayRunId,
        stage,
        eventType,
        duration: `${duration}ms`
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to process workflow message', {
        error: error.message,
        stack: error.stack,
        messageData,
        duration: `${duration}ms`,
        partition,
        offset: message.offset
      });

      await this.consumer.commitOffsets([{
        topic,
        partition,
        offset: (parseInt(message.offset) + 1).toString()
      }]);

      if (messageData?.relayRunId) {
        await this.handleExecutionFailure(
          messageData.relayRunId,
          messageData.stage || 0,
          error.message
        );
      }
    }
  }

  async executeStage(relayRunId, stage) {
    try {
      const result = await executeRelayStage(relayRunId, stage);

      logger.info('Stage execution completed', {
        relayRunId,
        stage,
        nextStage: result.nextStage,
        finalStatus: result.finalStatus,
        actionStatus: result.historyEntry?.status
      });

      return {
        success: true,
        nextStage: result.nextStage,
        finalStatus: result.finalStatus,
        historyEntry: result.historyEntry
      };

    } catch (error) {
      logger.error('Stage execution failed', {
        relayRunId,
        stage,
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  async startWorkflow(relayRunId) {
    try {
      await RelayRun.findByIdAndUpdate(relayRunId, {
        status: RELAY_RUN_STATUS.RUNNING,
        startedAt: new Date()
      });

      return await this.executeStage(relayRunId, 0);

    } catch (error) {
      logger.error('Failed to start workflow', {
        relayRunId,
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  async queueNextStage(relayRunId, nextStage) {
    try {
      const outboxEntry = new RelayRunOutbox({
        relayRunId,
        stage: nextStage,
        eventType: 'STAGE_EXECUTION',
        payload: {
          scheduledAt: new Date().toISOString()
        },
        status: OUTBOX_STATUS.PENDING
      });

      await outboxEntry.save();

      logger.debug('Queued next stage', {
        relayRunId,
        nextStage,
        outboxId: outboxEntry._id
      });

    } catch (error) {
      logger.error('Failed to queue next stage', {
        relayRunId,
        nextStage,
        error: error.message
      });
      throw error;
    }
  }


  async updateWorkflowStatus(relayRunId, finalStatus) {
    try {
      const updateData = {
        status: finalStatus,
        completedAt: new Date()
      };

      await RelayRun.findByIdAndUpdate(relayRunId, updateData);

      logger.info('Updated workflow final status', {
        relayRunId,
        finalStatus
      });

      if (global.io) {
        const relayRun = await RelayRun.findById(relayRunId).select('userId');
        if (relayRun) {
          global.io.to(`user-${relayRun.userId}`).emit('workflow-completed', {
            relayRunId,
            status: finalStatus,
            completedAt: updateData.completedAt
          });
        }
      }

    } catch (error) {
      logger.error('Failed to update workflow status', {
        relayRunId,
        finalStatus,
        error: error.message
      });
      throw error;
    }
  }

  async handleExecutionFailure(relayRunId, stage, errorMessage) {
    try {
      await RelayRun.findByIdAndUpdate(relayRunId, {
        status: RELAY_RUN_STATUS.FAILED,
        errorMessage,
        completedAt: new Date()
      });

      logger.warn('Workflow execution failed', {
        relayRunId,
        stage,
        errorMessage
      });

      if (global.io) {
        const relayRun = await RelayRun.findById(relayRunId).select('userId');
        if (relayRun) {
          global.io.to(`user-${relayRun.userId}`).emit('workflow-failed', {
            relayRunId,
            stage,
            errorMessage,
            failedAt: new Date()
          });
        }
      }

    } catch (error) {
      logger.error('Failed to handle execution failure', {
        relayRunId,
        stage,
        errorMessage,
        error: error.message
      });
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      groupId: this.groupId,
      connected: this.consumer !== null
    };
  }
}

export const relayExecutorConsumer = new RelayExecutorConsumer();
