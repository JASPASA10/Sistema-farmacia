const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt');
    req.user = decoded; // Adjuntar el payload del token al objeto de solicitud
    next();
  } catch (error) {
    console.error('Error en authMiddleware:', error);
    res.status(401).json({ message: 'Token inválido.' });
  }
}; 