import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';

interface SaleItem {
  productId: { name: string; price: number; };
  quantity: number;
  price: number;
}

interface Sale {
  _id: string;
  items: SaleItem[];
  total: number;
  saleDate: string;
  user: { name: string; email: string; };
}

export const Reports: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await fetch('/api/sales', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al cargar los reportes de ventas');
        }

        const data: Sale[] = await response.json();
        setSales(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar reportes');
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="text-center py-8">Cargando reportes...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleGoBack}
          className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
          title="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes de Ventas</h1>
          <p className="text-gray-600">Ver estadísticas y reportes detallados de las ventas.</p>
        </div>
      </div>

      {sales.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-gray-500">
          No hay ventas registradas aún.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Venta</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.map((sale) => (
                <tr key={sale._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale._id.substring(0, 8)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(sale.saleDate), 'dd/MM/yyyy HH:mm')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.user?.name || 'N/A'} ({sale.user?.email || 'N/A'})</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <ul className="list-disc list-inside">
                      {sale.items.map((item, idx) => (
                        <li key={idx}>{item.productId?.name || 'Producto Desconocido'} (x{item.quantity}) - ${item.price.toFixed(2)}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">${sale.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}; 