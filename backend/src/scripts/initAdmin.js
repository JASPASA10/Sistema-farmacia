const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function checkAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/farmacia');
    console.log('Conectado a MongoDB');

    const adminUser = await User.findOne({ email: 'admin@farmacia.com' });

    if (adminUser) {
      console.log('Detalles del usuario administrador:');
      console.log('ID:', adminUser._id);
      console.log('Nombre:', adminUser.name);
      console.log('Email:', adminUser.email);
      console.log('Rol:', adminUser.role);
      console.log('Contraseña (HASH):', adminUser.password);
      const isPasswordCorrect = await bcrypt.compare('admin123', adminUser.password);
      console.log('Contraseña \'admin123\' coincide con el hash:', isPasswordCorrect);
    } else {
      console.log('El usuario administrador NO existe en la base de datos.');
    }

    await mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada');
  } catch (error) {
    console.error('Error al verificar admin:', error);
    process.exit(1);
  }
}

checkAdmin(); 