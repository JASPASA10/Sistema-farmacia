require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const connectDB = require('../config/db');

const seedDatabase = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();

    // Limpiar la base de datos
    await User.deleteMany({});
    await Product.deleteMany({});
    await Sale.deleteMany({});

    // Crear usuarios de ejemplo
    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = await User.create([
      {
        name: 'Admin',
        email: 'admin@farmacia.com',
        password: hashedPassword,
        role: 'admin'
      },
      {
        name: 'Vendedor',
        email: 'vendedor@farmacia.com',
        password: hashedPassword,
        role: 'vendedor'
      }
    ]);

    // Crear productos de ejemplo
    const products = await Product.create([
      {
        name: 'Paracetamol 500mg',
        description: 'Analgésico y antipirético',
        price: 5.99,
        stock: 100,
        category: 'Analgésicos',
        supplier: 'Farmacéutica A',
        minStock: 20
      },
      {
        name: 'Ibuprofeno 400mg',
        description: 'Antiinflamatorio no esteroideo',
        price: 7.99,
        stock: 75,
        category: 'Antiinflamatorios',
        supplier: 'Farmacéutica B',
        minStock: 15
      },
      {
        name: 'Amoxicilina 500mg',
        description: 'Antibiótico',
        price: 12.99,
        stock: 50,
        category: 'Antibióticos',
        supplier: 'Farmacéutica C',
        minStock: 10
      },
      {
        name: 'Omeprazol 20mg',
        description: 'Protector gástrico',
        price: 9.99,
        stock: 30,
        category: 'Gastrointestinal',
        supplier: 'Farmacéutica A',
        minStock: 10
      },
      {
        name: 'Loratadina 10mg',
        description: 'Antihistamínico',
        price: 8.99,
        stock: 5,
        category: 'Antialérgicos',
        supplier: 'Farmacéutica B',
        minStock: 15
      }
    ]);

    // Crear ventas de ejemplo
    const currentDate = new Date();
    const lastMonth = new Date(currentDate);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Ventas del mes actual
    await Sale.create([
      {
        products: [
          { product: products[0]._id, quantity: 2, price: products[0].price },
          { product: products[1]._id, quantity: 1, price: products[1].price }
        ],
        total: (products[0].price * 2) + products[1].price,
        customer: { name: 'Juan Pérez', document: '12345678' },
        seller: users[1]._id,
        paymentMethod: 'efectivo',
        status: 'completada',
        createdAt: currentDate
      },
      {
        products: [
          { product: products[2]._id, quantity: 1, price: products[2].price },
          { product: products[3]._id, quantity: 2, price: products[3].price }
        ],
        total: products[2].price + (products[3].price * 2),
        customer: { name: 'María García', document: '87654321' },
        seller: users[1]._id,
        paymentMethod: 'tarjeta',
        status: 'completada',
        createdAt: currentDate
      }
    ]);

    // Ventas del mes anterior
    await Sale.create([
      {
        products: [
          { product: products[0]._id, quantity: 3, price: products[0].price },
          { product: products[4]._id, quantity: 1, price: products[4].price }
        ],
        total: (products[0].price * 3) + products[4].price,
        customer: { name: 'Carlos López', document: '45678912' },
        seller: users[1]._id,
        paymentMethod: 'efectivo',
        status: 'completada',
        createdAt: lastMonth
      }
    ]);

    // Pedidos pendientes
    await Sale.create([
      {
        products: [
          { product: products[1]._id, quantity: 2, price: products[1].price },
          { product: products[3]._id, quantity: 1, price: products[3].price }
        ],
        total: (products[1].price * 2) + products[3].price,
        customer: { name: 'Ana Martínez', document: '78912345' },
        seller: users[1]._id,
        paymentMethod: 'transferencia',
        status: 'pendiente',
        createdAt: currentDate
      }
    ]);

    console.log('Base de datos inicializada con éxito');
    process.exit(0);
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  }
};

seedDatabase(); 