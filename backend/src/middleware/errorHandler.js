export function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ') });
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ success: false, error: err.message });
  }
  if (err.code === 11000) return res.status(409).json({ success: false, error: 'A matching record already exists.' });
  const status = err.status || 500;
  res.status(status).json({ success: false, error: status === 500 ? 'Unexpected server error.' : err.message });
}
