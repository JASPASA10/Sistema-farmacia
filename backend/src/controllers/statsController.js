const Product = require('../models/Product');
const Sale = require('../models/Sale');

const getDashboardStats = async (req, res) => {
  try {
    // Obtener fecha de inicio del mes actual
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Obtener fecha de inicio del mes anterior para comparación
    const startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    // Ejecutar todas las consultas en paralelo
    const [
      productStats,
      salesStats,
      pendingOrders,
      lowStockProducts
    ] = await Promise.all([
      // 1. Estadísticas de productos
      Product.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            lastMonth: [
              { $match: { createdAt: { $lt: startOfMonth } } },
              { $count: "count" }
            ]
          }
        }
      ]),
      // 2. Estadísticas de ventas
      Sale.aggregate([
        {
          $facet: {
            currentMonth: [
              {
                $match: {
                  createdAt: { $gte: startOfMonth },
                  status: 'completada'
                }
              },
              {
                $group: {
                  _id: null,
                  total: { $sum: '$total' }
                }
              }
            ],
            lastMonth: [
              {
                $match: {
                  createdAt: { $gte: startOfLastMonth, $lt: startOfMonth },
                  status: 'completada'
                }
              },
              {
                $group: {
                  _id: null,
                  total: { $sum: '$total' }
                }
              }
            ]
          }
        }
      ]),
      // 3. Pedidos pendientes
      Sale.aggregate([
        {
          $facet: {
            current: [
              { $match: { status: 'pendiente' } },
              { $count: "count" }
            ],
            lastMonth: [
              {
                $match: {
                  status: 'pendiente',
                  createdAt: { $lt: startOfMonth }
                }
              },
              { $count: "count" }
            ]
          }
        }
      ]),
      // 4. Productos con bajo stock
      Product.aggregate([
        {
          $facet: {
            current: [
              { $match: { $expr: { $lte: ['$stock', '$minStock'] } } },
              { $count: "count" }
            ],
            lastMonth: [
              {
                $match: {
                  $expr: { $lte: ['$stock', '$minStock'] },
                  lastUpdated: { $lt: startOfMonth }
                }
              },
              { $count: "count" }
            ]
          }
        }
      ])
    ]);

    // Procesar resultados
    const totalProducts = productStats[0].total[0]?.count || 0;
    const lastMonthProducts = productStats[0].lastMonth[0]?.count || 0;
    const stockChange = lastMonthProducts > 0 
      ? ((totalProducts - lastMonthProducts) / lastMonthProducts * 100).toFixed(1)
      : 0;

    const currentMonthTotal = salesStats[0].currentMonth[0]?.total || 0;
    const lastMonthTotal = salesStats[0].lastMonth[0]?.total || 0;
    const salesChange = lastMonthTotal > 0 
      ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1)
      : 0;

    const pendingOrdersCount = pendingOrders[0].current[0]?.count || 0;
    const lastMonthPending = pendingOrders[0].lastMonth[0]?.count || 0;
    const pendingChange = lastMonthPending > 0 
      ? ((pendingOrdersCount - lastMonthPending) / lastMonthPending * 100).toFixed(1)
      : 0;

    const lowStockCount = lowStockProducts[0].current[0]?.count || 0;
    const lastMonthLowStock = lowStockProducts[0].lastMonth[0]?.count || 0;
    const lowStockChange = lastMonthLowStock > 0 
      ? lowStockCount - lastMonthLowStock
      : 0;

    res.json({
      stats: [
        {
          title: 'Productos en Stock',
          value: totalProducts.toLocaleString(),
          change: `${stockChange > 0 ? '+' : ''}${stockChange}%`,
          trend: stockChange >= 0 ? 'up' : 'down',
          color: 'blue'
        },
        {
          title: 'Ventas del Mes',
          value: `€${currentMonthTotal.toLocaleString()}`,
          change: `${salesChange > 0 ? '+' : ''}${salesChange}%`,
          trend: salesChange >= 0 ? 'up' : 'down',
          color: 'green'
        },
        {
          title: 'Pedidos Pendientes',
          value: pendingOrdersCount.toString(),
          change: `${pendingChange > 0 ? '+' : ''}${pendingChange}%`,
          trend: pendingChange >= 0 ? 'up' : 'down',
          color: 'orange'
        },
        {
          title: 'Productos Agotándose',
          value: lowStockCount.toString(),
          change: `${lowStockChange > 0 ? '+' : ''}${lowStockChange}`,
          trend: lowStockChange >= 0 ? 'up' : 'down',
          color: 'red'
        }
      ]
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};

module.exports = {
  getDashboardStats
}; 