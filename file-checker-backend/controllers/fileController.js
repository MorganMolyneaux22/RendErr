const pool = require('../models/reportModel');
const XLSX = require('xlsx');
const fs = require('fs');

const uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const duplicates = [];
        const newEntries = [];

        for (const row of data) {
            const reportId = row['Report ID']; 
            const reportData = row['Data'];    

            const result = await pool.query(
                'SELECT * FROM reports WHERE report_id = $1',
                [reportId]
            );

            if (result.rowCount > 0) {
                duplicates.push(reportId);
            } else {
                const result = await pool.query(
                    'INSERT INTO reports (report_id, data) VALUES ($1, $2) RETURNING *',
                    [reportId, reportData]
                );
                console.log('Inserted data:', result.rows[0]);
                newEntries.push(reportId);
            }
        }

        fs.unlinkSync(req.file.path); // Clean up the uploaded file
        res.json({ duplicates, newEntries });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { uploadFile };
