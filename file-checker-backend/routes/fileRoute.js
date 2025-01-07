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
    console.log('Available sheet names:', sheetNames); // Log available sheet names

    const sheetName = 'Strata Lehi Invoicing Asbuilts '; // Specify the sheet name
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      console.log('Sheet not found');
      return res.status(400).send('Sheet not found.');
    }

    const data = xlsx.utils.sheet_to_json(sheet, { header: 1, range: 2 }); // Start from the third row (index 2)
    console.log('Data structure:', data); // Log the structure of the data

    const duplicates = [];
    const newEntries = [];

    for (const row of data) {
      console.log('Processing row:', row); // Log each row being processed
      const TaskID = row[0]; // Column A
      const TaskType = row[1]; // Column B
      const WorkPackage = row[5]; // Column F
      const CompletedDate = new Date(row[9]); // Column J, convert to Date
      const TotalLength = parseInt(row[62], 10); // Column BL, convert to integer
      const QAApproved = row[16]; // Column Q

      console.log('Parsed values:', { TaskID, TaskType, WorkPackage, CompletedDate, TotalLength, QAApproved }); // Log parsed values

      try {
        const result = await pool.query(
          'INSERT INTO reports (task_id, task_type, work_package, completed_date, total_length, qa_approved) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [TaskID, TaskType, WorkPackage, CompletedDate, TotalLength, QAApproved]
        );
        newEntries.push(result.rows[0]);
      } catch (error) {
        if (error.code === '23505') { // Unique violation
          duplicates.push(TaskID);
        } else {
          console.error('Error inserting data:', error);
          return res.status(500).send('Error processing file.');
        }
      }
    }

    res.send({ duplicates, newEntries });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send('Error processing file.');
  }
});

module.exports = router;