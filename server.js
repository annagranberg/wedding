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
const SPREADSHEET_ID = '17nXZNrbD8Gf2JeoTXVqCTdUMXKG9VGcpD1ZaxD61u4Q';// sheet id
const SHEET_NAME = 'Sheet1'; // <-- Fliknamnet i Google Sheets

// === RSVP/OSA-endpoint ===
app.post('/rsvp/send', async (req, res) => {
  const { namn, antal, kommentar } = req.body;

  if (!namn || !antal) {
    return res.status(400).send({ message: 'Namn och antal krävs' });
  }

  const data = JSON.stringify(req.body);

  // Spara till osa.json
  fs.appendFile('osa.json', data + '\n', err => {
    if (err) {
      console.error('Fel vid skrivning till osa.json:', err);
    }
  });

  // Lägg till i Google Sheet
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:C`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[namn, antal, kommentar || '']],
      },
    });

    res.send({ message: 'OSA mottaget – tack!' });
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
