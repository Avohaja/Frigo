import { createContext, useState, useContext, useEffect } from 'react';
import { useSnackbar } from 'notistack';

const ProductContext = createContext();
const API_URL = 'http://localhost:5000/api';

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [products, setProducts] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate status based on expiration date and quantity
  const calculateStatus = (expiration, quantity) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expirationDate = new Date(expiration);
    expirationDate.setHours(0, 0, 0, 0);
    const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));

    // Handle both quantity formats
    let quantityValue;
    if (typeof quantity === 'object' && quantity !== null) {
      quantityValue = quantity.value;
    } else {
      quantityValue = parseInt(quantity) || 0;
    }

    if (daysUntilExpiration < 0) return 'expired';
    if (daysUntilExpiration <= 3) return 'expiring';
    if (quantityValue <= 2) return 'low';
    return 'fresh';
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching products from:', `${API_URL}/products`);

      const response = await fetch(`${API_URL}/products`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw products data from API:', data);

      // Update status for each product
      const productsWithUpdatedStatus = data.map(product => ({
        ...product,
        status: calculateStatus(product.expiration, product.quantity)
      }));

      setProducts(productsWithUpdatedStatus);
      setIsInitialized(true);
      enqueueSnackbar('Products loaded successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message);
      enqueueSnackbar('Failed to load products.', { variant: 'error' });
      setProducts([]);
      setIsInitialized(true);
    } finally {
      setLoading(false);
    }
  };

  // Load products on startup
  useEffect(() => {
    fetchProducts();
  }, []);

  // Add a new product
  const addProduct = async (product) => {
    try {
      const productWithStatus = {
        ...product,
        quantity: product.quantity,
        status: calculateStatus(product.expiration, product.quantity)
      };

      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productWithStatus)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newProduct = await response.json();
      setProducts([...products, newProduct]);
      enqueueSnackbar('Product added successfully!', { variant: 'success' });
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      enqueueSnackbar('Failed to add product.', { variant: 'error' });
      throw error;
    }
  };

  // Update an existing product
  const updateProduct = async (id, updatedProduct) => {
    try {
      const productWithStatus = {
        ...updatedProduct,
        quantity: updatedProduct.quantity,
        status: calculateStatus(updatedProduct.expiration, updatedProduct.quantity)
      };

      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productWithStatus)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updated = await response.json();
      setProducts(products.map(p => (p.id === id ? updated : p)));
      enqueueSnackbar('Product updated successfully!', { variant: 'success' });
      return updated;
    } catch (error) {
      console.error('Error updating product:', error);
      enqueueSnackbar('Failed to update product.', { variant: 'error' });
      throw error;
    }
  };

  // Update only the quantity of a product
  const updateQuantity = async (id, newQuantity) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}/quantity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updated = await response.json();
      setProducts(products.map(p => (p.id === id ? updated : p)));
      enqueueSnackbar('Quantity updated successfully!', { variant: 'success' });
      return updated;
    } catch (error) {
      console.error('Error updating quantity:', error);
      enqueueSnackbar('Failed to update quantity.', { variant: 'error' });
      throw error;
    }
  };

  // Delete a product
  const deleteProduct = async (id) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setProducts(products.filter(p => p.id !== id));
      enqueueSnackbar('Product deleted successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting product:', error);
      enqueueSnackbar('Failed to delete product.', { variant: 'error' });
      throw error;
    }
  };

  // Get a product by ID
  const getProduct = (id) => {
    return products.find(p => p.id === id);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        updateQuantity,
        deleteProduct,
        getProduct,
        fetchProducts,
        loading,
        error,
        isInitialized
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
