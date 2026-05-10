import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'No token provided' });

  // For Supabase we might be receiving a Bearer token
  const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;

  try {
    // In a real app we'd verify with Supabase JWT secret
    const decoded = jwt.decode(actualToken); 
    // Here we're just decoding for demo purposes. In production, verify the signature!
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
