const express = require('express');
const multer = require('multer');
const cors = require('cors');
const pool = require('./db');
const app = express();
const path = require('path');

// Middleware
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

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
        const { section_id, subsection_id, question_text, type } = req.body;
        // console.log("Incoming body:", req.body);


        const questionRes = await pool.query(
            `INSERT INTO questions (section_id, subsection_id, question_text, option_type) 
            VALUES ($1, $2, $3, $4) RETURNING id`,
            [section_id, subsection_id, question_text, type]
        );

        const question_id = questionRes.rows[0].id;

        // Map file fieldnames to filenames
        const filesMap = {};
        for (const file of req.files) {
            filesMap[file.fieldname] = file.filename;
        }

        // Extract and insert options
        const options = [];
        let i = 0;
        while (req.body[`options[${i}][text]`]) {
            options.push({
                text: req.body[`options[${i}][text]`],
                marks: parseInt(req.body[`options[${i}][marks]`]) || 0,
                image: filesMap[`options[${i}][image]`] || null
            });
            i++;
        }

        for (const opt of options) {
            await pool.query(
                `INSERT INTO options (question_id, text, marks, image) VALUES ($1, $2, $3, $4)`,
                [question_id, opt.text, opt.marks, opt.image]
            );
        }

        res.status(201).json({ message: "Question and options saved successfully." });
    } catch (error) {
        console.error("Error saving question:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Server Listening
app.listen(8000, () => console.log("Server running on http://localhost:8000"));
