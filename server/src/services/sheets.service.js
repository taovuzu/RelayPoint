import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Connection } from '../models/connection.model.js';
import { EncryptionService } from './encryption.service.js';
import logger from '../utils/logger.js';

export class SheetsService {

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

        logger.info('Google tokens refreshed for Sheets', {
          userId,
          connectionId: connection._id
        });
      });

      const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

      return sheets;

    } catch (error) {
      logger.error('Failed to create authenticated Sheets client', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  static async getSpreadsheetMetadata(userId, spreadsheetId) {
    try {
      const sheets = await this.createAuthenticatedClient(userId);

      const response = await sheets.spreadsheets.get({
        spreadsheetId,
        includeGridData: false
      });

      return {
        id: response.data.spreadsheetId,
        title: response.data.properties.title,
        sheets: response.data.sheets.map(sheet => ({
          id: sheet.properties.sheetId,
          title: sheet.properties.title,
          rowCount: sheet.properties.gridProperties.rowCount,
          columnCount: sheet.properties.gridProperties.columnCount
        }))
      };

    } catch (error) {
      logger.error('Failed to get spreadsheet metadata', {
        userId,
        spreadsheetId,
        error: error.message
      });
      throw error;
    }
  }

  static async getSheetData(userId, spreadsheetId, range) {
    try {
      const sheets = await this.createAuthenticatedClient(userId);

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range
      });

      return response.data.values || [];

    } catch (error) {
      logger.error('Failed to get sheet data', {
        userId,
        spreadsheetId,
        range,
        error: error.message
      });
      throw error;
    }
  }

  static async appendRow(userId, spreadsheetId, range, values) {
    try {
      const sheets = await this.createAuthenticatedClient(userId);

      const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED', 
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [values]
        }
      });

      logger.info('Row appended to sheet successfully', {
        userId,
        spreadsheetId,
        range,
        updatedRows: response.data.updates.updatedRows
      });

      return {
        updatedRows: response.data.updates.updatedRows,
        updatedColumns: response.data.updates.updatedColumns,
        updatedCells: response.data.updates.updatedCells,
        updatedRange: response.data.updates.updatedRange
      };

    } catch (error) {
      logger.error('Failed to append row to sheet', {
        userId,
        spreadsheetId,
        range,
        values,
        error: error.message
      });
      throw error;
    }
  }

  static async updateCells(userId, spreadsheetId, range, values) {
    try {
      const sheets = await this.createAuthenticatedClient(userId);

      const response = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values
        }
      });

      logger.info('Cells updated successfully', {
        userId,
        spreadsheetId,
        range,
        updatedRows: response.data.updatedRows,
        updatedColumns: response.data.updatedColumns
      });

      return {
        updatedRows: response.data.updatedRows,
        updatedColumns: response.data.updatedColumns,
        updatedCells: response.data.updatedCells,
        updatedRange: response.data.updatedRange
      };

    } catch (error) {
      logger.error('Failed to update cells', {
        userId,
        spreadsheetId,
        range,
        values,
        error: error.message
      });
      throw error;
    }
  }

  static async getRowCount(userId, spreadsheetId, sheetName) {
    try {
      const sheets = await this.createAuthenticatedClient(userId);

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:Z` 
      });

      const values = response.data.values || [];
      return values.length;

    } catch (error) {
      logger.error('Failed to get row count', {
        userId,
        spreadsheetId,
        sheetName,
        error: error.message
      });
      throw error;
    }
  }

  static async getNewRows(userId, spreadsheetId, sheetName, lastRowCount) {
    try {
      const currentData = await this.getSheetData(userId, spreadsheetId, `${sheetName}!A:Z`);
      const currentRowCount = currentData.length;

      if (currentRowCount <= lastRowCount) {
        return []; 
      }

      const newRows = currentData.slice(lastRowCount);

      logger.info('New rows detected in sheet', {
        userId,
        spreadsheetId,
        sheetName,
        lastRowCount,
        currentRowCount,
        newRowCount: newRows.length
      });

      return newRows;

    } catch (error) {
      logger.error('Failed to get new rows', {
        userId,
        spreadsheetId,
        sheetName,
        lastRowCount,
        error: error.message
      });
      throw error;
    }
  }

  static async testConnection(userId) {
    try {
      const sheets = await this.createAuthenticatedClient(userId);

      const response = await sheets.spreadsheets.get({
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms' // Google's sample sheet
      });

      return {
        isValid: true,
        spreadsheetTitle: response.data.properties.title
      };

    } catch (error) {
      logger.error('Google Sheets connection test failed', {
        userId,
        error: error.message
      });

      return {
        isValid: false,
        error: error.message
      };
    }
  }

  static extractSpreadsheetId(url) {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      throw new Error('Invalid Google Sheets URL');
    }
    return match[1];
  }

  static validateRange(range) {
    const rangeRegex = /^[A-Za-z0-9\s]+![A-Z]+[0-9]+:[A-Z]+[0-9]+$/;
    return rangeRegex.test(range);
  }
}
