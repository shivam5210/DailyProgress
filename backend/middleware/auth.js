import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers['authorization'];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'No authorization token provided',
        code: 'NO_TOKEN'
      });
    }

    // Handle Bearer token format
    const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;

    // Decode token (basic validation for demo)
    // In production, verify with Supabase JWT secret
    const decoded = jwt.decode(actualToken);
    
    if (!decoded) {
      return res.status(401).json({ 
        error: 'Invalid token format',
        code: 'INVALID_TOKEN'
      });
    }

    if (!decoded.sub) {
      return res.status(401).json({ 
        error: 'Token missing user ID (sub)',
        code: 'MISSING_SUB'
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ 
      error: 'Unauthorized',
      code: 'AUTH_ERROR',
      details: err.message
    });
  }
};