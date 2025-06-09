import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Search, Edit2, Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { ProductForm } from './ProductForm';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  minStock: number;
  supplier: string;
}

interface ProductFormData {
  _id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  minStock: number;
  supplier: string;
}

// Cache para productos
let productsCache: Product[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    const now = Date.now();
    if (productsCache.length > 0 && now - lastFetchTime < CACHE_DURATION) {
      setProducts(productsCache);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/products');
      const data = await response.json();
      productsCache = data;
      lastFetchTime = now;
      setProducts(data);
    } catch (error) {
      console.error('Error al obtener productos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  const filteredProducts = useMemo(() => 
    products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [products, searchTerm]
  );

  const handleEdit = useCallback((product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(async (productId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await fetch(`http://localhost:5001/api/products/${productId}`, {
          method: 'DELETE',
        });
        // Invalidar caché
        productsCache = [];
        fetchProducts();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
      }
    }
  }, [fetchProducts]);

  const handleSubmit = useCallback(async (productData: ProductFormData) => {
    try {
      const url = productData._id
        ? `http://localhost:5001/api/products/${productData._id}`
        : 'http://localhost:5001/api/products';
      
      const method = productData._id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el producto');
      }

      // Invalidar caché
      productsCache = [];
      fetchProducts();
      setShowModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Error al guardar el producto. Por favor, intente nuevamente.');
    }
  }, [fetchProducts]);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Inventario</h1>
              <p className="text-gray-600">Administra los productos de tu farmacia</p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedProduct(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Producto
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  // Loading skeleton
                  Array(5).fill(0).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No se encontraron productos
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <Package className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900">${product.price.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className={`font-medium ${
                            product.stock <= product.minStock ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {product.stock}
                          </span>
                          {product.stock <= product.minStock && (
                            <AlertTriangle className="w-4 h-4 text-red-600 ml-2" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{product.supplier}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for Add/Edit Product */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <ProductForm
              product={selectedProduct || undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowModal(false);
                setSelectedProduct(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}; 