import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  testSheetsConnection,
  getSpreadsheetMetadata,
  getSheetData,
  appendRow,
  updateCells,
  getRowCount,
  extractSpreadsheetId
} from '../controllers/sheets.controller.js';

const router = express.Router();

router.use(verifyJWT);

router.post('/test', testSheetsConnection);
router.get('/spreadsheet/:spreadsheetId/metadata', getSpreadsheetMetadata);
router.get('/spreadsheet/:spreadsheetId/data', getSheetData);
router.post('/spreadsheet/:spreadsheetId/append', appendRow);
router.put('/spreadsheet/:spreadsheetId/update', updateCells);
router.get('/spreadsheet/:spreadsheetId/row-count', getRowCount);
router.post('/extract-id', extractSpreadsheetId);

export default router;
