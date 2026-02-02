const express = require('express');
const cors = require('cors');
const multer = require('multer');
const officeParser = require('officeparser');

const app = express();
const PORT = process.env.PORT || 8080;

// Configure CORS to allow requests from Vercel app
app.use(cors({
  origin: [
    'https://vet-ai-chat.vercel.app',
    'http://localhost:3000',
    /\.vercel\.app$/
  ],
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Configure multer for file uploads (50MB limit)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const allowedExtensions = ['.pdf', '.ppt', '.pptx', '.doc', '.docx'];
    const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));

    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado. Use PDF, PowerPoint ou Word.'));
    }
  },
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'VetAI File Processor' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// File upload and processing endpoint
app.post('/process', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const file = req.file;
    console.log(`Processing file: ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    // Extract text using officeparser
    const content = await new Promise((resolve, reject) => {
      officeParser.parseOffice(file.buffer, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        error: 'Não foi possível extrair texto do arquivo. Verifique se o arquivo contém texto.'
      });
    }

    console.log(`Extracted ${content.length} characters from ${file.originalname}`);

    res.json({
      success: true,
      name: file.originalname,
      content: content,
      size: file.size,
      extractedLength: content.length,
    });

  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro ao processar arquivo'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande. Máximo: 50MB' });
    }
  }
  console.error('Server error:', error);
  res.status(500).json({ error: error.message || 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`File processor running on port ${PORT}`);
});
