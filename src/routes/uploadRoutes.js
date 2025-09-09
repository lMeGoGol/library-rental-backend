const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_');
    const name = `${Date.now()}_${base}${ext}`;
    cb(null, name);
  }
});

const imageFilter = function (_req, file, cb) {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image uploads are allowed'));
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter: imageFilter, limits: { fileSize: 2 * 1024 * 1024 } });

router.post('/image', authMiddleware(['admin','librarian']), upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: { message: 'No file uploaded' } });
  const publicPath = `/uploads/${file.filename}`;
  // Build absolute URL for frontend consumption
  const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http');
  const host = (req.headers['x-forwarded-host'] || req.get('host'));
  const base = host ? `${proto}://${host}` : '';
  const absoluteUrl = base ? `${base}${publicPath}` : publicPath;
  res.json({ url: absoluteUrl, path: publicPath, filename: file.filename });
});

module.exports = router;
