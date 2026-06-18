/**
 * Placeholder until `multer` (or similar) is added.
 * Replace with real multipart handling for avatars / documents.
 */
function uploadNone(req, res, next) {
  next();
}

module.exports = { uploadNone };
