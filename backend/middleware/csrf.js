const crypto = require('crypto');

const cookieName = 'csrf-token';
const configuredSecret = process.env.CSRF_SECRET;

if (process.env.NODE_ENV === 'production' && !configuredSecret) {
  throw new Error('CSRF_SECRET must be configured in production');
}

const secret = Buffer.from(configuredSecret || crypto.randomBytes(32));
if (secret.length < 32) {
  throw new Error('CSRF_SECRET must be at least 32 bytes long');
}

const createToken = () => {
  const nonce = crypto.randomBytes(32).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(nonce).digest('base64url');
  return `${nonce}.${signature}`;
};

const isValidToken = (token) => {
  if (typeof token !== 'string') {
    return false;
  }

  const [nonce, signature, ...extraParts] = token.split('.');
  if (
    extraParts.length ||
    !/^[A-Za-z0-9_-]{43}$/.test(nonce || '') ||
    !/^[A-Za-z0-9_-]{43}$/.test(signature || '')
  ) {
    return false;
  }

  const expectedSignature = crypto.createHmac('sha256', secret).update(nonce).digest('base64url');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
};

const csrfProtection = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies?.[cookieName];
  const headerToken = req.get('CSRF-Token');

  if (
    isValidToken(cookieToken) &&
    isValidToken(headerToken) &&
    crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))
  ) {
    return next();
  }

  const error = new Error('Invalid or missing CSRF token');
  error.code = 'EBADCSRFTOKEN';
  return next(error);
};

const issueCsrfToken = (req, res) => {
  const existingToken = req.cookies?.[cookieName];
  const token = isValidToken(existingToken) ? existingToken : createToken();

  res.cookie(cookieName, token, {
    httpOnly: true,
    path: '/',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  res.set('Cache-Control', 'no-store');
  return res.status(200).json({ csrfToken: token });
};

module.exports = { csrfProtection, issueCsrfToken };
