import cron from 'node-cron';
import { Relay } from '../models/relay.model.js';
import { RelayRun } from '../models/relayRun.model.js';
import { RelayRunOutbox } from '../models/relayRunOutbox.model.js';
import { SheetsService } from '../services/sheets.service.js';
import logger from '../utils/logger.js';

export class SheetsTriggerPoller {
  static isRunning = false;
  static cronJob = null;

  static start(cronExpression = '*/5 * * * *') {
    if (this.isRunning) {
      logger.warn('Sheets trigger poller is already running');
      return;
    }

    this.cronJob = cron.schedule(cronExpression, async () => {
      await this.pollSheetsTriggers();
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    this.cronJob.start();
    this.isRunning = true;

    logger.info('Sheets trigger poller started', {
      cronExpression,
      timezone: 'UTC'
    });
  }

  static stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    this.isRunning = false;

    logger.info('Sheets trigger poller stopped');
  }

  static async pollSheetsTriggers() {
    try {
      logger.debug('Starting sheets trigger polling cycle');

      const sheetsTriggers = await Relay.find({
        active: true,
        'trigger.triggerId': 'NEW_GOOGLE_SHEET_ROW'
      }).populate('userId', 'email');

      if (sheetsTriggers.length === 0) {
        logger.debug('No active Google Sheets triggers found');
        return;
      }

      logger.info(`Polling ${sheetsTriggers.length} Google Sheets triggers`);

      for (const relay of sheetsTriggers) {
        try {
          await this.processSheetsTrigger(relay);
        } catch (error) {
          logger.error('Failed to process sheets trigger', {
            relayId: relay._id,
            userId: relay.userId._id,
            error: error.message
          });
        }
      }

      logger.debug('Sheets trigger polling cycle completed');

    } catch (error) {
      logger.error('Sheets trigger polling error', {
        error: error.message,
        stack: error.stack
      });
    }
  }

  static async processSheetsTrigger(relay) {
    try {
      const { spreadsheetId, sheetName } = relay.trigger.config;
      const lastProcessedIdentifier = relay.trigger.config.lastProcessedIdentifier;

      if (!spreadsheetId || !sheetName) {
        logger.warn('Invalid sheets trigger configuration', {
          relayId: relay._id,
          spreadsheetId,
          sheetName
        });
        return;
      }

      const currentRowCount = await SheetsService.getRowCount(
        relay.userId._id,
        spreadsheetId,
        sheetName
      );

      if (!lastProcessedIdentifier || currentRowCount <= parseInt(lastProcessedIdentifier)) {
        logger.debug('No new rows detected', {
          relayId: relay._id,
          lastProcessedIdentifier,
          currentRowCount
        });
        return;
      }

      const newRows = await SheetsService.getNewRows(
        relay.userId._id,
        spreadsheetId,
        sheetName,
        parseInt(lastProcessedIdentifier)
      );

      if (newRows.length === 0) {
        logger.debug('No new rows to process', {
          relayId: relay._id,
          lastProcessedIdentifier,
          currentRowCount
        });
        return;
      }

      logger.info('New rows detected in Google Sheet', {
        relayId: relay._id,
        userId: relay.userId._id,
        spreadsheetId,
        sheetName,
        newRowCount: newRows.length,
        lastProcessedIdentifier,
        currentRowCount
      });

      for (let i = 0; i < newRows.length; i++) {
        const rowData = newRows[i];
        await this.processNewRow(relay, rowData, i);
      }

      await Relay.findByIdAndUpdate(relay._id, {
        'trigger.config.lastProcessedIdentifier': currentRowCount.toString(),
        lastRunAt: new Date()
      });

      logger.info('Sheets trigger processed successfully', {
        relayId: relay._id,
        userId: relay.userId._id,
        rowsProcessed: newRows.length,
        newLastProcessedIdentifier: currentRowCount
      });

    } catch (error) {
      logger.error('Failed to process sheets trigger', {
        relayId: relay._id,
        userId: relay.userId._id,
        error: error.message
      });
      throw error;
    }
  }


  static async processNewRow(relay, rowData, rowIndex) {
    try {
      const relayRun = await RelayRun.create({
        relayId: relay._id,
        userId: relay.userId._id,
        status: 'pending',
        triggerMetadata: {
          type: 'NEW_GOOGLE_SHEET_ROW',
          spreadsheetId: relay.trigger.config.spreadsheetId,
          sheetName: relay.trigger.config.sheetName,
          rowData,
          rowIndex,
          timestamp: new Date()
        }
      });

      await RelayRunOutbox.create({
        relayRunId: relayRun._id,
        userId: relay.userId._id,
        stage: 0,
        eventType: 'STAGE_EXECUTION',
        payload: {
          triggerData: {
            type: 'NEW_GOOGLE_SHEET_ROW',
            spreadsheetId: relay.trigger.config.spreadsheetId,
            sheetName: relay.trigger.config.sheetName,
            rowData,
            rowIndex,
            timestamp: new Date()
          },
          relayConfig: relay
        },
        status: 'pending'
      });

      logger.info('New sheet row processed and queued for execution', {
        relayId: relay._id,
        relayRunId: relayRun._id,
        userId: relay.userId._id,
        rowIndex,
        rowDataLength: rowData.length
      });

    } catch (error) {
      logger.error('Failed to process new sheet row', {
        relayId: relay._id,
        userId: relay.userId._id,
        rowIndex,
        error: error.message
      });
      throw error;
    }
  }

  static getStatus() {
    return {
      isRunning: this.isRunning,
      nextRun: this.cronJob ? this.cronJob.nextDate() : null,
      lastRun: this.cronJob ? this.cronJob.lastDate() : null
    };
  }
}
