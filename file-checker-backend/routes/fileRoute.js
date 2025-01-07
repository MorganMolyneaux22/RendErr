const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const router = express.Router();
require('dotenv').config();

const upload = multer({ dest: 'uploads/' });
const isLocal = process.env.NODE_ENV === 'local';
const pool = isLocal ? require('../mockDb') : new (require('pg').Pool)({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

router.post('/', upload.single('file'), async (req, res) => {
  console.log('File upload request received');
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const workbook = xlsx.readFile(file.path);
    const sheetNames = workbook.SheetNames;
    console.log('Available sheet names:', sheetNames);

    const sheetName = 'Strata Lehi Invoicing Asbuilts '; 
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      console.log('Sheet not found');
      return res.status(400).send('Sheet not found.');
    }

    const range = xlsx.utils.decode_range(sheet['!ref']); // Get full range of the sheet
    console.log('Sheet range:', range); // Debug the sheet range

    const duplicates = [];
    const newEntries = [];

    // Loop through specified range (Column A, B, F, J, BL, Q)
    for (let rowNum = 2; rowNum <= range.e.r; rowNum++) {
      const TaskID = sheet[`A${rowNum}`]?.v || null;
      const TaskType = sheet[`B${rowNum}`]?.v || null;
      const WorkPackage = sheet[`F${rowNum}`]?.v || null;
      const CompletedDate = sheet[`J${rowNum}`]?.v ? new Date(sheet[`J${rowNum}`].w) : null;
      const TotalLength = sheet[`BL${rowNum}`]?.v ? Number(sheet[`BL${rowNum}`].v) : 0;
      const QAApproved = sheet[`Q${rowNum}`]?.v || null;

      if (!TaskID) continue; // Skip empty rows

      console.log('Checking TaskID:', TaskID); // Log TaskID being checked

      try {
        // Check for duplicates in the database
        const duplicateCheck = await pool.query('SELECT * FROM reports WHERE task_id = $1', [TaskID]);
        console.log('Duplicate check result for TaskID', TaskID, ':', duplicateCheck.rows); // Log duplicate check result
        if (duplicateCheck.rows.length > 0) {
          duplicates.push(TaskID);
        } else {
          const result = await pool.query(
            'INSERT INTO reports (task_id, task_type, work_package, completed_date, total_length, qa_approved) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [TaskID, TaskType, WorkPackage, CompletedDate, TotalLength, QAApproved]
          );
        //   console.log('Inserted new entry:', result.rows[0]); // Log inserted entry
          newEntries.push(result.rows[0]);
        }
      } catch (error) {
        console.error('Error inserting data:', error);
        return res.status(500).send('Error processing file.');
      }
    }

    res.send({ duplicates, newEntries });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send('Error processing file.');
  }
});

module.exports = router;