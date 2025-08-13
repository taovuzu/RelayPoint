import { SheetsService } from '../services/sheets.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';

export const testSheetsConnection = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const result = await SheetsService.testConnection(userId);

    return ApiResponse.success(
      result,
      result.isValid ? 'Google Sheets connection test successful' : 'Google Sheets connection test failed',
      200
    ).withRequest(req).send(res);

  } catch (error) {
    logger.error('Google Sheets connection test error', {
      userId,
      error: error.message
    });

    return ApiResponse.success(
      {
        isValid: false,
        error: error.message
      },
      'Google Sheets connection test failed',
      200
    ).withRequest(req).send(res);
  }
});

export const getSpreadsheetMetadata = asyncHandler(async (req, res) => {
  const { spreadsheetId } = req.params;
  const userId = req.user._id;

  if (!spreadsheetId) {
    throw ApiError.badRequest('Spreadsheet ID is required');
  }

  try {
    const metadata = await SheetsService.getSpreadsheetMetadata(userId, spreadsheetId);

    return ApiResponse.success(
      { metadata },
      'Spreadsheet metadata retrieved successfully',
      200
    ).withRequest(req).send(res);

  } catch (error) {
    logger.error('Failed to get spreadsheet metadata', {
      userId,
      spreadsheetId,
      error: error.message
    });

    throw ApiError.badRequest(`Failed to get spreadsheet metadata: ${error.message}`);
  }
});

export const getSheetData = asyncHandler(async (req, res) => {
  const { spreadsheetId } = req.params;
  const { range } = req.query;
  const userId = req.user._id;

  if (!spreadsheetId) {
    throw ApiError.badRequest('Spreadsheet ID is required');
  }

  if (!range) {
    throw ApiError.badRequest('Range parameter is required');
  }

  try {
    const data = await SheetsService.getSheetData(userId, spreadsheetId, range);

    return ApiResponse.success(
      { data },
      'Sheet data retrieved successfully',
      200
    ).withRequest(req).send(res);

  } catch (error) {
    logger.error('Failed to get sheet data', {
      userId,
      spreadsheetId,
      range,
      error: error.message
    });

    throw ApiError.badRequest(`Failed to get sheet data: ${error.message}`);
  }
});

export const appendRow = asyncHandler(async (req, res) => {
  const { spreadsheetId } = req.params;
  const { range, values } = req.body;
  const userId = req.user._id;

  if (!spreadsheetId) {
    throw ApiError.badRequest('Spreadsheet ID is required');
  }

  if (!range) {
    throw ApiError.badRequest('Range is required');
  }

  if (!values || !Array.isArray(values)) {
    throw ApiError.badRequest('Values array is required');
  }

  try {
    const result = await SheetsService.appendRow(userId, spreadsheetId, range, values);

    logger.info('Row appended to sheet', {
      userId,
      spreadsheetId,
      range,
      updatedRows: result.updatedRows
    });

    return ApiResponse.success(
      { result },
      'Row appended successfully',
      200
    ).withRequest(req).send(res);

  } catch (error) {
    logger.error('Failed to append row to sheet', {
      userId,
      spreadsheetId,
      range,
      values,
      error: error.message
    });

    throw ApiError.badRequest(`Failed to append row: ${error.message}`);
  }
});

export const updateCells = asyncHandler(async (req, res) => {
  const { spreadsheetId } = req.params;
  const { range, values } = req.body;
  const userId = req.user._id;

  if (!spreadsheetId) {
    throw ApiError.badRequest('Spreadsheet ID is required');
  }

  if (!range) {
    throw ApiError.badRequest('Range is required');
  }

  if (!values || !Array.isArray(values)) {
    throw ApiError.badRequest('Values array is required');
  }

  try {
    const result = await SheetsService.updateCells(userId, spreadsheetId, range, values);

    logger.info('Cells updated in sheet', {
      userId,
      spreadsheetId,
      range,
      updatedRows: result.updatedRows
    });

    return ApiResponse.success(
      { result },
      'Cells updated successfully',
      200
    ).withRequest(req).send(res);

  } catch (error) {
    logger.error('Failed to update cells in sheet', {
      userId,
      spreadsheetId,
      range,
      values,
      error: error.message
    });

    throw ApiError.badRequest(`Failed to update cells: ${error.message}`);
  }
});

export const getRowCount = asyncHandler(async (req, res) => {
  const { spreadsheetId } = req.params;
  const { sheetName } = req.query;
  const userId = req.user._id;

  if (!spreadsheetId) {
    throw ApiError.badRequest('Spreadsheet ID is required');
  }

  if (!sheetName) {
    throw ApiError.badRequest('Sheet name is required');
  }

  try {
    const rowCount = await SheetsService.getRowCount(userId, spreadsheetId, sheetName);

    return ApiResponse.success(
      { rowCount },
      'Row count retrieved successfully',
      200
    ).withRequest(req).send(res);

  } catch (error) {
    logger.error('Failed to get row count', {
      userId,
      spreadsheetId,
      sheetName,
      error: error.message
    });

    throw ApiError.badRequest(`Failed to get row count: ${error.message}`);
  }
});

export const extractSpreadsheetId = asyncHandler(async (req, res) => {
  const { url } = req.body;

  if (!url) {
    throw ApiError.badRequest('URL is required');
  }

  try {
    const spreadsheetId = SheetsService.extractSpreadsheetId(url);

    return ApiResponse.success(
      { spreadsheetId },
      'Spreadsheet ID extracted successfully',
      200
    ).withRequest(req).send(res);

  } catch (error) {
    logger.error('Failed to extract spreadsheet ID', {
      url,
      error: error.message
    });

    throw ApiError.badRequest(`Invalid Google Sheets URL: ${error.message}`);
  }
});
