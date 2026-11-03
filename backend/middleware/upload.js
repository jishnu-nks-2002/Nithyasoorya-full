const multer = require('multer');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { UPLOAD_ROOT } = require('../config/cloudinary');

// Public address of this API, used to build image URLs saved in the database
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || 'https://api.72.60.102.101.nip.io').replace(/\/+$/, '');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime',
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 100 * 1024 * 1024 } });

// Work out the real file type from the bytes, not from the client's claim
function detectExt(buf) {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return '.jpg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) return '.png';
  const head = buf.subarray(0, 12).toString('latin1');
  if (head.startsWith('GIF8')) return '.gif';
  if (head.startsWith('RIFF') && head.slice(8, 12) === 'WEBP') return '.webp';
  if (head.slice(4, 8) === 'ftyp') return head.slice(8, 10) === 'qt' ? '.mov' : '.mp4';
  if (buf[0] === 0x1A && buf[1] === 0x45 && buf[2] === 0xDF && buf[3] === 0xA3) return '.webm';
  return null;
}

// Local replacement for the Cloudinary upload: same call, same result shape
const uploadToCloudinary = async (buffer, options = {}) => {
  const ext = detectExt(buffer);
  if (!ext) throw new Error('Unsupported or corrupted file');

  const folder = String(options.folder || '')
    .split('/')
    .map((s) => s.replace(/[^a-zA-Z0-9_-]/g, ''))
    .filter(Boolean)
    .join('/');

  const dir = path.join(UPLOAD_ROOT, folder);
  await fs.mkdir(dir, { recursive: true });

  const filename = crypto.randomBytes(16).toString('hex') + ext;
  await fs.writeFile(path.join(dir, filename), buffer);

  const publicId = folder ? `${folder}/${filename}` : filename;
  const url = `${PUBLIC_BASE_URL}/uploads/${publicId}`;
  return {
    secure_url: url,
    url,
    public_id: publicId,
    resource_type: options.resource_type || 'image',
    bytes: buffer.length,
  };
};

module.exports = { upload, uploadToCloudinary };
