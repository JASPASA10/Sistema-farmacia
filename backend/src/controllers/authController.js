const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Función para iniciar sesión
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'tu_secreto_jwt',
      { expiresIn: '24h' }
    );

    // Enviar respuesta sin incluir la contraseña
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

// Función para registrar usuario
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'user' // Por defecto, los usuarios nuevos son 'user'
    });

    await user.save();

    // Generar token JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'tu_secreto_jwt',
      { expiresIn: '24h' }
    );

    // Enviar respuesta sin incluir la contraseña
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.status(201).json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

// Función para verificar token
exports.verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No se proporcionó token' });
    }

    console.log('JWT_SECRET usado en verifyToken:', process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error detallado en verificación de token:', error);
    console.error('Stack trace:', error.stack);
    res.status(401).json({ message: 'Token inválido.' });
  }
}; 