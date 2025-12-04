import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

app.post('/transcribe', upload.single('audio'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    // Add extension to the uploaded file so whisper can recognize it (optional but good practice)
    const fileExt = path.extname(originalName) || '.mp3';
    const processingPath = filePath + fileExt;

    fs.renameSync(filePath, processingPath);

    console.log(`Received file: ${originalName}, saved to ${processingPath}`);
    console.log('Starting transcription...');

    // Execute the shell script
    const scriptPath = path.join(__dirname, 'transcribe.sh');
    const command = `${scriptPath} "${processingPath}"`;

    exec(command, (error, stdout, stderr) => {
        // Clean up the uploaded file
        try {
            fs.unlinkSync(processingPath);
        } catch (e) {
            console.error('Error deleting temp file:', e);
        }

        if (error) {
            console.error(`exec error: ${error}`);
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({
                error: 'Transcription failed',
                details: stderr || error.message
            });
        }

        console.log(`stdout: ${stdout}`);

        // Parse the output. 
        // The script prints "Transcribing <file> ..." then the output from whisper.
        // Whisper output format depends on the tool, but usually it prints the text.
        // We'll assume stdout contains the transcription.
        // We might need to filter out the "Transcribing..." line.

        // Simple parsing: remove the first line if it starts with "Transcribing"
        const lines = stdout.split('\n');
        const transcription = lines
            .filter(line => !line.startsWith('Transcribing') && !line.startsWith('Detecting language'))
            .join('\n')
            .trim();

        // Generate a simple summary (first 3 sentences)
        const summary = transcription.split('.').slice(0, 3).join('.') + '.';

        res.json({
            transcription: transcription,
            summary: summary || "No summary available."
        });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
