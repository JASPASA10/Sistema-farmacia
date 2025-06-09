import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Settings, Package, BarChart3, Users, TrendingUp, ShoppingCart, AlertTriangle, LucideIcon } from 'lucide-react';

interface Stat {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  color: string;
}

const iconMap: Record<string, LucideIcon> = {
  'Productos en Stock': Package,
  'Ventas del Mes': TrendingUp,
  'Pedidos Pendientes': ShoppingCart,
  'Productos Agotándose': AlertTriangle
};

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats/dashboard');
        const data = await response.json();
        setStats(data.stats);
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'Gestionar Inventario':
        navigate('/inventory');
        break;
      case 'Nueva Venta':
        navigate('/sales/new');
        break;
      case 'Reportes':
        navigate('/reports');
        break;
      case 'Gestión de Usuarios':
        navigate('/users');
        break;
    }
  };

  const quickActions = [
    { title: 'Gestionar Inventario', description: 'Agregar, editar y consultar productos', icon: Package },
    { title: 'Nueva Venta', description: 'Procesar una nueva transacción', icon: ShoppingCart },
    { title: 'Reportes', description: 'Ver estadísticas y reportes', icon: BarChart3 },
    { title: 'Gestión de Usuarios', description: 'Administrar permisos de usuario', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Sistema de Farmacia</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {user?.name}!
          </h2>
          <p className="text-gray-600">
            Aquí tienes un resumen de tu sistema de farmacia
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            // Placeholder de carga
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-12 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : (
            stats.map((stat, index) => {
              const Icon = iconMap[stat.title];

              return (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-${stat.color}-50 rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                    <span className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.title)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left group"
                >
                  <div className="w-10 h-10 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center mb-3 transition-colors">
                    <Icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{action.title}</h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Integration Info */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sistema de Conexión Listo
              </h3>
              <p className="text-gray-700 mb-4">
                Tu sistema de autenticación está configurado y listo para conectar con los módulos de farmacia. 
                Los usuarios autenticados pueden acceder a las diferentes funcionalidades según su rol.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  Autenticación ✓
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  Roles de Usuario ✓
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                  Persistencia ✓
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};