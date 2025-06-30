const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Serve static files (CSS, JS, HTML, images)
app.use(express.static('public'));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// OSA-endpoint — sparar data i osa.json
app.post('/rsvp/send', (req, res) => {
  const data = JSON.stringify(req.body);
  fs.appendFile('osa.json', data + '\n', err => {
    if (err) {
      console.error(err);
      return res.status(500).send({ message: 'Något gick fel vid sparandet, kontakta Anna' });
    }
    res.send({ message: 'OSA mottaget!' });
  });
});

// Endpoint för bilduppladdning
app.post('/upload', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).send({ message: 'Ingen fil mottagen' });
  res.send({ message: 'Bild uppladdad!', file: req.file.filename });
});


// routes
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server runs on port ${PORT}`);
});
