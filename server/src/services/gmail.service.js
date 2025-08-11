import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Connection } from '../models/connection.model.js';
import { EncryptionService } from './encryption.service.js';
import logger from '../utils/logger.js';


export class GmailService {

  static async createAuthenticatedClient(userId) {
    try {
      const connection = await Connection.findOne({
        userId,
        service: 'google',
        isActive: true
      });

      if (!connection) {
        throw new Error('No active Google connection found for user');
      }

      const tokens = EncryptionService.decryptObject(connection.encryptedCredentials);

      const oauth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      oauth2Client.setCredentials(tokens);

      oauth2Client.on('tokens', async (newTokens) => {
        if (newTokens.refresh_token) {
          tokens.refresh_token = newTokens.refresh_token;
        }

        const updatedTokens = { ...tokens, ...newTokens };
        const encryptedCredentials = EncryptionService.encryptObject(updatedTokens);
        const iv = encryptedCredentials.split(':')[0];

        await Connection.findByIdAndUpdate(connection._id, {
          encryptedCredentials,
          iv,
          lastUsedAt: new Date()
        });

        logger.info('Google tokens refreshed', {
          userId,
          connectionId: connection._id
        });
      });

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      return gmail;

    } catch (error) {
      logger.error('Failed to create authenticated Gmail client', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  static async startWatchingUser(userId, options = {}) {
    try {
      const gmail = await this.createAuthenticatedClient(userId);

      const watchRequest = {
        userId: 'me',
        requestBody: {
          topicName: process.env.GOOGLE_PUBSUB_TOPIC_NAME,
          labelIds: options.labelIds || ['INBOX'],
          labelFilterBehavior: options.labelFilterBehavior || 'include'
        }
      };

      const response = await gmail.users.watch(watchRequest);

      logger.info('Gmail watch started', {
        userId,
        historyId: response.data.historyId,
        expiration: response.data.expiration
      });

      return {
        historyId: response.data.historyId,
        expiration: response.data.expiration
      };

    } catch (error) {
      logger.error('Failed to start Gmail watch', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  static async getHistorySince(userId, historyId) {
    try {
      const gmail = await this.createAuthenticatedClient(userId);

      const response = await gmail.users.history.list({
        userId: 'me',
        startHistoryId: historyId,
        historyTypes: ['messageAdded']
      });

      return response.data.history || [];

    } catch (error) {
      logger.error('Failed to get Gmail history', {
        userId,
        historyId,
        error: error.message
      });
      throw error;
    }
  }

  static async getMessage(userId, messageId) {
    try {
      const gmail = await this.createAuthenticatedClient(userId);

      const response = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });

      return response.data;

    } catch (error) {
      logger.error('Failed to get Gmail message', {
        userId,
        messageId,
        error: error.message
      });
      throw error;
    }
  }

  static async sendEmail(userId, options) {
    try {
      const gmail = await this.createAuthenticatedClient(userId);

      const { to, subject, body, from, cc, bcc } = options;

      if (!to || !subject || !body) {
        throw new Error('To, subject, and body are required');
      }

      const message = this.createMimeMessage({
        to,
        subject,
        body,
        from,
        cc,
        bcc
      });

      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage
        }
      });

      logger.info('Email sent successfully', {
        userId,
        messageId: response.data.id,
        to,
        subject
      });

      return {
        messageId: response.data.id,
        threadId: response.data.threadId
      };

    } catch (error) {
      logger.error('Failed to send email', {
        userId,
        to: options.to,
        subject: options.subject,
        error: error.message
      });
      throw error;
    }
  }


  static createMimeMessage(options) {
    const { to, subject, body, from, cc, bcc } = options;

    const messageId = `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@relaypoint.app>`;

    let headers = [
      `Message-ID: ${messageId}`,
      `Date: ${new Date().toUTCString()}`,
      `Subject: ${subject}`,
      `To: ${to}`
    ];

    if (from) {
      headers.push(`From: ${from}`);
    }

    if (cc && cc.length > 0) {
      headers.push(`Cc: ${cc.join(', ')}`);
    }

    if (bcc && bcc.length > 0) {
      headers.push(`Bcc: ${bcc.join(', ')}`);
    }

    const isHtml = body.includes('<') && body.includes('>');
    const contentType = isHtml ? 'text/html' : 'text/plain';

    headers.push(`Content-Type: ${contentType}; charset=UTF-8`);
    headers.push('MIME-Version: 1.0');
    const message = [
      ...headers,
      '',
      body
    ].join('\r\n');

    return message;
  }


  static parseMessage(message) {
    const headers = message.payload.headers;
    const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value;

    const parsed = {
      id: message.id,
      threadId: message.threadId,
      subject: getHeader('subject') || '',
      from: getHeader('from') || '',
      to: getHeader('to') || '',
      date: getHeader('date') || '',
      snippet: message.snippet || '',
      body: this.extractBody(message.payload)
    };

    return parsed;
  }

  static extractBody(payload) {
    if (payload.body && payload.body.data) {
      return Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
          if (part.body && part.body.data) {
            return Buffer.from(part.body.data, 'base64').toString('utf-8');
          }
        }
      }
    }

    return '';
  }
}
