const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const [scheme, token] = (req.get('authorization') || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentication token is required' });
  }
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not configured');
    return res.status(500).json({ error: 'Server authentication is not configured' });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
}

// Blocks a logged-in user from acting on a *different* user's data.
// Checks, in order: req.params.userId, then req.body.user_id /
// req.body.userId. Use this on any route whose URL or body carries a
// userId directly (GET /subjects/:userId, POST /subjects with
// { user_id }, etc). Routes that only take a resource id (a subjectId,
// timetableId) can't use this — they need an ownership lookup instead,
// since the id alone doesn't say who owns it.
function requireSelf(req, res, next) {
  const targetId = req.params.userId ?? req.body.user_id ?? req.body.userId;

  if (targetId !== undefined && String(req.user.id) !== String(targetId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
}

module.exports = { verifyToken, requireSelf };
