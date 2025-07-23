const express = require('express');
const multer = require('multer');
const cors = require('cors');
const pool = require('./db');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Fetch form Details === 
app.get(`/api/getdetails`, (req, res) => {
    const fetchQuery = `SELECT qus.id AS id, sec.name AS section_name, sbSec.name AS subsection_name, question_text, option_type, opt.text AS option_text, opt.marks AS option_marks, opt.image_path AS option_path, question_id
    FROM questions AS qus
    LEFT OUTER JOIN sections AS sec ON sec.id = qus.section_id
    LEFT OUTER JOIN subsections AS sbSec ON sbSec.id = qus.subsection_id
    LEFT OUTER JOIN options AS opt ON opt.id = qus.id`;
    pool.query(fetchQuery, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result.rows);
    });
});

app.get(`/api/getOptionsData/:questionId`, (req, res) => {
    const questionId = req.params.questionId;
    pool.query("SELECT * FROM options WHERE question_id = $1", [questionId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result.rows);
    });
});

// Fetch Sections
app.get("/api/section", (req, res) => {
    pool.query("SELECT * FROM sections", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result.rows);
    });
});

// Fetch Sub-sections by section_id
app.get("/api/subsection", (req, res) => {
    const { section_id } = req.query;
    pool.query("SELECT * FROM subsections WHERE section_id = $1", [section_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result.rows);
    });
});


// Submit Question with Options
app.post('/api/question', upload.any(), async (req, res) => {
    try {
        const { section_id, subsection_id, question_text, type, options } = req.body;
        // console.log("Incoming body:", req.body);

        const questionRes = await pool.query(
            `INSERT INTO questions (section_id, subsection_id, question_text, option_type) 
            VALUES ($1, $2, $3, $4) RETURNING id`,
            [section_id, subsection_id, question_text, type]
        );

        const question_id = questionRes.rows[0].id;

        // Map file fieldnames to filenames
        const filesMap = {};
        req.files.forEach(file => {
            filesMap[file.fieldname] = file.filename;
        });

        // Extract and insert options
        const LocOptions = [];
        let i = 0;
        while (req.body[`options[${i}][text]`] !== undefined) {
            LocOptions.push({
                text: req.body[`options[${i}][text]`],
                marks: parseInt(req.body[`options[${i}][marks]`] || '0'),
                image: filesMap[`options[${i}][image]`] || null
            });
            i++;
        }

        let j = 0;
        for (const opt of options) {
            await pool.query(
                `INSERT INTO options (question_id, text, marks, image_path) VALUES ($1, $2, $3, $4)`,
                [question_id, opt.text, opt.marks, req.files[j].filename]
            );
        }

        res.status(201).json({ message: "Question and options saved successfully." });
    } catch (error) {
        console.error("Error saving question:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Server Listening
// app.listen(8000, () => console.log("Server running on http://localhost:8000"));
const PORT = process.env.PORT || 8000;
console.log('Environment PORT:', process.env.PORT);
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
