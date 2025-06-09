import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
}

interface SaleItem {
  productId: string;
  quantity: number;
  price: number;
}

export const SalesNew: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Error al cargar productos');
        }
        const data: Product[] = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar productos');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const calculateTotal = () => {
      const newTotal = saleItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
      setTotal(newTotal);
    };
    calculateTotal();
  }, [saleItems]);

  const handleAddProduct = () => {
    if (!selectedProduct || quantity <= 0) {
      setError('Selecciona un producto y una cantidad válida.');
      return;
    }
    const productToAdd = products.find(p => p._id === selectedProduct);
    if (productToAdd) {
      if (quantity > productToAdd.stock) {
        setError('Cantidad supera el stock disponible.');
        return;
      }
      setSaleItems(prevItems => {
        const existingItem = prevItems.find(item => item.productId === productToAdd._id);
        if (existingItem) {
          return prevItems.map(item =>
            item.productId === productToAdd._id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prevItems, { productId: productToAdd._id, quantity, price: productToAdd.price }];
      });
      // Restar del stock visual (no persistente hasta la venta final)
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p._id === productToAdd._id ? { ...p, stock: p.stock - quantity } : p
        )
      );
      setSelectedProduct('');
      setQuantity(1);
      setError(null);
    } else {
      setError('Producto no encontrado.');
    }
  };

  const handleRemoveItem = (productId: string) => {
    const itemToRemove = saleItems.find(item => item.productId === productId);
    if (itemToRemove) {
      setSaleItems(prevItems => prevItems.filter(item => item.productId !== productId));
      // Devolver al stock visual
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p._id === productId ? { ...p, stock: p.stock + itemToRemove.quantity } : p
        )
      );
    }
  };

  const handleSubmitSale = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Asegúrate de enviar el token
        },
        body: JSON.stringify({ items: saleItems, total })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar la venta');
      }

      setSuccessMessage('Venta procesada exitosamente!');
      setSaleItems([]);
      setTotal(0);
      // Opcional: Volver a cargar productos para reflejar el stock actualizado desde el backend
      // fetchProducts(); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al procesar la venta');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="text-center py-8">Cargando productos...</div>;
  }

  if (error && !products.length) {
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
          <h1 className="text-3xl font-bold text-gray-900">Nueva Venta</h1>
          <p className="text-gray-600">Procesar una nueva transacción</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Añadir Producto a la Venta</h2>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
        {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{successMessage}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
            <select
              id="product"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Selecciona un producto</option>
              {products.map(product => (
                <option key={product._id} value={product._id}>
                  {product.name} (Stock: {product.stock})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <button
          onClick={handleAddProduct}
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Añadir a la Venta
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalle de la Venta</h2>
        {saleItems.length === 0 ? (
          <p className="text-gray-500">No hay productos en la venta.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {saleItems.map(item => {
              const productInfo = products.find(p => p._id === item.productId);
              return (
                <li key={item.productId} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="text-lg font-medium text-gray-900">{productInfo?.name}</p>
                    <p className="text-sm text-gray-500">Cantidad: {item.quantity} x ${item.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.productId)}
                    className="ml-4 text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-xl font-bold text-gray-900">Total:</p>
          <p className="text-xl font-bold text-blue-600">${total.toFixed(2)}</p>
        </div>
        <button
          onClick={handleSubmitSale}
          disabled={saleItems.length === 0 || loading}
          className="mt-6 w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Procesando...' : 'Procesar Venta'}
        </button>
      </div>
    </div>
  );
}; 