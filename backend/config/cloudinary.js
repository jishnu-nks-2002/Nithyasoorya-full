const fs = require('fs/promises');
const path = require('path');

const UPLOAD_ROOT = path.join(__dirname, '..', 'public', 'uploads');

// Local replacement for cloudinary.uploader.destroy(publicId)
async function destroy(publicId) {
  if (!publicId || typeof publicId !== 'string') return { result: 'not found' };
  const target = path.resolve(UPLOAD_ROOT, publicId);
  // never delete anything outside the uploads folder
  if (!target.startsWith(UPLOAD_ROOT + path.sep)) return { result: 'not found' };
  try {
    await fs.unlink(target);
    return { result: 'ok' };
  } catch (e) {
    if (e.code === 'ENOENT') return { result: 'not found' }; // e.g. old Cloudinary ids
    throw e;
  }
}

module.exports = { uploader: { destroy }, UPLOAD_ROOT };
