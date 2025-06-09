const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
require('dotenv').config({ path: '../.env' });

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmacia_db');
    console.log('Conectado a MongoDB');

    const email = 'admin@example.com'; // Puedes cambiar esto
    const password = 'admin123'; // ¡CAMBIA ESTA CONTRASEÑA EN PRODUCCIÓN!

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('El usuario administrador ya existe.');
      mongoose.connection.close();
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = new User({
      name: 'Administrador',
      email,
      password: hashedPassword,
      role: 'admin',
    });

    await adminUser.save();
    console.log('Usuario administrador creado exitosamente:', adminUser);
  } catch (error) {
    console.error('Error al crear el usuario administrador:', error);
  } finally {
    mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada.');
  }
};

createAdminUser(); 