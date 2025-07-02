const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;

// === Middleware ===
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === Multer: Bilduppladdning ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// === Google Sheets Setup ===
let credentials;
if (process.env.GOOGLE_CREDENTIALS) {
  credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
} else {
  credentials = JSON.parse(fs.readFileSync('credentials.json'));
}

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = '1Q4jz6KWrQ3mYS_XTq4wdTROKFM2vnQr63somTaR6VdA';// sheet id
const SHEET_NAME = 'Gästlista'; // <-- Fliknamnet i Google Sheets

// === RSVP/OSA-endpoint ===
app.post('/rsvp/send', async (req, res) => {
  const { namn, rsvp, specialkost } = req.body;

  if (!namn || !rsvp) {
    return res.status(400).send({ message: 'Namn och OSA krävs' });
  }

  try {
    // Hämta alla rader i arket
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:C`, // Kolumnerna Namn, RSVP, Specialkost
    });

    const rows = response.data.values || [];
    const nameIndex = rows.findIndex(row => row[0] && row[0].toLowerCase() === namn.toLowerCase());

    if (nameIndex !== -1) {
      // Uppdatera befintlig rad
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A${nameIndex + 1}:C${nameIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[namn, rsvp, specialkost || '']],
        },
      });
    } else {
      // Lägg till ny rad
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:C`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[namn, rsvp, specialkost || '']],
        },
      });
    }

    res.send({ message: 'OSA sparad – tack!' });
  } catch (error) {
    console.error('Fel vid Google Sheets:', error);
    res.status(500).send({ message: 'Kunde inte spara i Google Sheets' });
  }
});


// === Bilduppladdning ===
app.post('/upload', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).send({ message: 'Ingen fil mottagen' });
  res.send({ message: 'Bild uppladdad!', file: req.file.filename });
});

// === Routes ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/rsvp', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'rsvp.html'));
});

app.get('/ourStory', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ourStory.html'));
});

app.get('/bridalparty', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'bridalparty.html'));
});

app.get('/onskelista', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'onskelista.html'));
});

// === Starta server ===
app.listen(PORT, () => {
  console.log(`Servern körs på port ${PORT}`);
});
