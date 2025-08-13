import { GmailService } from '../services/gmail.service.js';
import { Relay } from '../models/relay.model.js';
import { RelayRun } from '../models/relayRun.model.js';
import { RelayRunOutbox } from '../models/relayRunOutbox.model.js';
import { User } from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import logger from '../utils/logger.js';

export const handleGmailPushNotification = asyncHandler(async (req, res) => {
  try {
    const message = req.body.message;
    if (!message || !message.data) {
      logger.warn('Invalid Pub/Sub message format', { body: req.body });
      return res.status(400).json({ error: 'Invalid message format' });
    }

    const data = Buffer.from(message.data, 'base64').toString('utf-8');
    const notification = JSON.parse(data);

    const { emailAddress, historyId } = notification;

    if (!emailAddress || !historyId) {
      logger.warn('Missing required fields in Gmail notification', { notification });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    logger.info('Gmail push notification received', {
      emailAddress,
      historyId,
      messageId: message.messageId
    });

    const user = await User.findOne({ email: emailAddress });
    if (!user) {
      logger.warn('User not found for Gmail notification', { emailAddress });
      return res.status(404).json({ error: 'User not found' });
    }

    const gmailTriggers = await Relay.find({
      userId: user._id,
      active: true,
      'trigger.triggerId': 'EMAIL_RECEIVED'
    });

    if (gmailTriggers.length === 0) {
      logger.info('No active Gmail triggers found for user', {
        userId: user._id,
        emailAddress
      });
      return res.status(200).json({ message: 'No active triggers' });
    }

    for (const relay of gmailTriggers) {
      try {
        await processGmailTrigger(relay, historyId, user._id);
      } catch (error) {
        logger.error('Failed to process Gmail trigger', {
          relayId: relay._id,
          userId: user._id,
          error: error.message
        });
      }
    }

    return res.status(200).json({ message: 'Notification processed successfully' });

  } catch (error) {
    logger.error('Gmail webhook processing error', {
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

async function processGmailTrigger(relay, historyId, userId) {
  try {
    const lastHistoryId = relay.trigger.config?.lastHistoryId;

    if (!lastHistoryId) {
      logger.warn('No last history ID found for Gmail trigger', {
        relayId: relay._id,
        userId
      });
      return;
    }

    const history = await GmailService.getHistorySince(userId, lastHistoryId);

    if (!history || history.length === 0) {
      logger.info('No new messages in Gmail history', {
        relayId: relay._id,
        userId,
        lastHistoryId,
        newHistoryId: historyId
      });
      return;
    }

    for (const historyRecord of history) {
      if (historyRecord.messagesAdded) {
        for (const messageAdded of historyRecord.messagesAdded) {
          await processNewEmail(relay, messageAdded.message.id, userId);
        }
      }
    }

    await Relay.findByIdAndUpdate(relay._id, {
      'trigger.config.lastHistoryId': historyId,
      lastRunAt: new Date()
    });

    logger.info('Gmail trigger processed successfully', {
      relayId: relay._id,
      userId,
      messagesProcessed: history.length,
      newHistoryId: historyId
    });

  } catch (error) {
    logger.error('Failed to process Gmail trigger', {
      relayId: relay._id,
      userId,
      error: error.message
    });
    throw error;
  }
}

async function processNewEmail(relay, messageId, userId) {
  try {
    const message = await GmailService.getMessage(userId, messageId);
    const parsedMessage = GmailService.parseMessage(message);

    const relayRun = await RelayRun.create({
      relayId: relay._id,
      userId,
      status: 'pending',
      triggerMetadata: {
        type: 'EMAIL_RECEIVED',
        messageId,
        email: parsedMessage
      }
    });

    await RelayRunOutbox.create({
      relayRunId: relayRun._id,
      userId,
      stage: 0,
      eventType: 'STAGE_EXECUTION',
      payload: {
        triggerData: parsedMessage,
        relayConfig: relay
      },
      status: 'pending'
    });

    logger.info('New email processed and queued for execution', {
      relayId: relay._id,
      relayRunId: relayRun._id,
      userId,
      messageId,
      subject: parsedMessage.subject
    });

  } catch (error) {
    logger.error('Failed to process new email', {
      relayId: relay._id,
      userId,
      messageId,
      error: error.message
    });
    throw error;
  }
}

export const testGmailConnection = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const gmail = await GmailService.createAuthenticatedClient(userId);

    const profile = await gmail.users.getProfile({ userId: 'me' });

    return ApiResponse.success(
      {
        isValid: true,
        emailAddress: profile.data.emailAddress,
        messagesTotal: profile.data.messagesTotal,
        threadsTotal: profile.data.threadsTotal
      },
      'Gmail connection test successful',
      200
    ).withRequest(req).send(res);

  } catch (error) {
    logger.error('Gmail connection test failed', {
      userId,
      error: error.message
    });

    return ApiResponse.success(
      {
        isValid: false,
        error: error.message
      },
      'Gmail connection test failed',
      200
    ).withRequest(req).send(res);
  }
});
