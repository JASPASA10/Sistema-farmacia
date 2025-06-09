const User = require('../models/User');

// Obtener todos los usuarios
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // No enviar contraseñas
    res.status(200).json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener usuarios' });
  }
};

// Actualizar un usuario
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role; // Asumiendo que el rol se puede actualizar

    await user.save();

    res.status(200).json({ message: 'Usuario actualizado exitosamente', user: user.toJSON() });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor al actualizar usuario' });
  }
};

// Eliminar un usuario
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor al eliminar usuario' });
  }
}; 