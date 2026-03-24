import express from 'express';
import multer from 'multer';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import { addTransactions } from '../data/store.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// ───────────────────────────────────────────────
//  PDF PARSING UTILITIES
// ───────────────────────────────────────────────

/**
 * Attempt to normalise a messy date string into YYYY-MM-DD.
 * Handles: DD/MM/YYYY, DD-MM-YYYY, DD MMM YYYY, MMM DD YYYY, etc.
 */
function parseDate(raw) {
  if (!raw) return null;
  raw = raw.trim();

  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  let m = raw.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  if (m) {
    let [, d, mo, y] = m;
    if (y.length === 2) y = '20' + y;
    return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // YYYY-MM-DD (already ISO)
  m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return raw;

  // DD MMM YYYY  e.g. 15 Jan 2026
  const MONTHS = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 };
  m = raw.match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})$/);
  if (m) {
    const [, d, monStr, y] = m;
    const mo = MONTHS[monStr.slice(0, 3).toLowerCase()];
    if (mo) return `${y}-${String(mo).padStart(2,'0')}-${d.padStart(2,'0')}`;
  }

  // Try JS Date as last resort
  const d = new Date(raw);
  if (!isNaN(d)) return d.toISOString().split('T')[0];
  return null;
}

/** Strip commas/currency symbols and parse a float */
function parseAmount(raw) {
  if (!raw) return 0;
  const cleaned = String(raw).replace(/[₹$€£,\s]/g, '');
  return parseFloat(cleaned) || 0;
}

/** Guess expense category from description keywords */
function guessCategory(desc) {
  desc = (desc || '').toLowerCase();
  if (/rent|lease|property/i.test(desc))        return 'Rent';
  if (/salary|salari|payroll|wages/i.test(desc)) return 'Salaries';
  if (/material|inventory|stock|purchase/i.test(desc)) return 'Inventory';
  if (/util|electric|water|gas|internet|broadband/i.test(desc)) return 'Utilities';
  if (/market|advertis|promo/i.test(desc))      return 'Marketing';
  if (/software|saas|subscription|license/i.test(desc)) return 'Software';
  if (/equip|machin|tool|hardware/i.test(desc)) return 'Equipment';
  if (/transport|logistic|delivery|courier|fuel/i.test(desc)) return 'Transport';
  if (/tax|gst|tds|income tax/i.test(desc))     return 'Taxes';
  if (/sales|revenue|invoice|receipt|payment received/i.test(desc)) return 'Sales';
  if (/service|consult|professional/i.test(desc)) return 'Services';
  return 'Uncategorized';
}

/**
 * Extract transactions from raw PDF text.
 *
 * Strategy: detect rows that contain a date, some description text,
 * and one or more amounts.  Supports both:
 *   A) Debit / Credit separated columns → common in Indian bank statements
 *   B) Single Amount + Dr/Cr suffix
 */
function extractTransactionsFromText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const results = [];

  // Regex for an amount (with optional commas, ₹ sign)
  const AMT = /₹?\s*[\d,]+\.?\d*/;

  for (const line of lines) {
    // Must contain a date-like token
    const dateMatch = line.match(
      /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{1,2}\s+[A-Za-z]{3,}\s+\d{4}|\d{4}-\d{2}-\d{2})\b/
    );
    if (!dateMatch) continue;

    const rawDate = dateMatch[1];
    const date = parseDate(rawDate);
    if (!date) continue;

    // Remove the date from line and look at rest
    const rest = line.replace(dateMatch[0], '').trim();

    // Find all amounts in the remaining text
    const amounts = [...rest.matchAll(/₹?\s*([\d,]+\.?\d*)/g)]
      .map(m => parseAmount(m[1]))
      .filter(a => a > 0);

    if (!amounts.length) continue;

    // Description: the longest non-numeric, non-date chunk
    const desc = rest
      .replace(/₹?\s*[\d,]+\.?\d*/g, '')
      .replace(/\b(Dr|Cr|DR|CR|debit|credit)\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (!desc || desc.length < 3) continue;

    // Determine type
    let type = 'expense'; // default debit
    if (/\b(Cr|CR|credit|credited|received|inward|deposit)\b/i.test(line)) type = 'income';
    if (/\b(Dr|DR|debit|debited|paid|charge|withdrawal)\b/i.test(line)) type = 'expense';

    // Take the first meaningful amount (skip balance column — usually last/largest)
    const amount = amounts[0];
    if (!amount) continue;

    results.push({
      date,
      description: desc.slice(0, 120),
      amount,
      type,
      category: guessCategory(desc),
    });
  }

  return results;
}

// ───────────────────────────────────────────────
//  ROUTES
// ───────────────────────────────────────────────

// POST /api/upload/csv
router.post('/csv', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  const results = [];
  const stream = Readable.from(req.file.buffer.toString());

  stream
    .pipe(csvParser())
    .on('data', (row) => {
      const date  = row.Date || row.date || row.DATE || '';
      const description = row.Description || row.description || row.Narration || row.narration || '';
      const amount = parseFloat(row.Amount || row.amount || row.Credit || row.Debit || 0);
      const type  = (row.Type || row.type || (row.Credit ? 'income' : 'expense')).toLowerCase();
      const category = row.Category || row.category || guessCategory(description);

      if (date && description && amount) {
        results.push({ date, description, amount: Math.abs(amount), type, category });
      }
    })
    .on('end', () => {
      const added = addTransactions(results);
      res.json({ success: true, message: `${added.length} transactions imported`, data: added });
    })
    .on('error', (err) => {
      res.status(500).json({ success: false, message: 'Error parsing CSV', error: err.message });
    });
});

// POST /api/upload/pdf
router.post('/pdf', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  if (req.file.mimetype !== 'application/pdf' && !req.file.originalname.endsWith('.pdf')) {
    return res.status(400).json({ success: false, message: 'Only PDF files are accepted' });
  }

  try {
    const data = await pdfParse(req.file.buffer);
    const rawText = data.text;

    if (!rawText || rawText.trim().length < 50) {
      return res.status(422).json({
        success: false,
        message: 'Could not extract text from PDF. It may be a scanned/image-based PDF. Please try a text-based bank statement PDF.',
      });
    }

    const transactions = extractTransactionsFromText(rawText);

    if (!transactions.length) {
      return res.status(422).json({
        success: false,
        message: 'No transactions found in this PDF. Make sure it is a text-based bank statement. You can also try the CSV export from your bank.',
        rawTextPreview: rawText.slice(0, 500),
      });
    }

    const added = addTransactions(transactions);
    res.json({
      success: true,
      message: `${added.length} transactions extracted from PDF`,
      data: added,
      pages: data.numpages,
    });
  } catch (err) {
    console.error('PDF parse error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to parse PDF', error: err.message });
  }
});

// GET /api/upload/preview-pdf — returns raw text without saving (for debugging)
router.post('/pdf/preview', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file' });
  try {
    const data = await pdfParse(req.file.buffer);
    const transactions = extractTransactionsFromText(data.text);
    res.json({ success: true, rawText: data.text.slice(0, 2000), detected: transactions.slice(0, 20), pages: data.numpages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
