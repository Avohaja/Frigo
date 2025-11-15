import { createContext, useState, useContext, useEffect } from 'react';

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
  const [products, setProducts] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const calculateStatus = (expiration, quantity) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate day comparison
    
    const expirationDate = new Date(expiration);
    expirationDate.setHours(0, 0, 0, 0);
    
    const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));

    // Priority: expired > expiring soon > low stock > fresh
    if (daysUntilExpiration < 0) return 'expired';
    if (daysUntilExpiration <= 3) return 'expiring';
    if (quantity <= 2) return 'low';
    return 'fresh';
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      
      // Recalculate status for each product
      const productsWithUpdatedStatus = data.map(product => ({
        ...product,
        status: calculateStatus(product.expiration, product.quantity)
      }));
      
      setProducts(productsWithUpdatedStatus);
      setIsInitialized(true);
    } catch (error) {
      console.error('Error fetching products:', error);
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Update statuses in the backend after recalculation
  useEffect(() => {
    const updateBackendStatuses = async () => {
      if (!isInitialized) return;
      
      for (const product of products) {
        try {
          await fetch(`${API_URL}/products/${product.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
          });
        } catch (error) {
          console.error(`Error updating product ${product.id} status:`, error);
        }
      }
    };
    
    if (isInitialized && products.length > 0) {
      updateBackendStatuses();
    }
  }, [isInitialized]);

  const addProduct = async (product) => {
    try {
      const productWithStatus = {
        ...product,
        status: calculateStatus(product.expiration, product.quantity)
      };
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productWithStatus)
      });
      const newProduct = await response.json();
      setProducts([...products, newProduct]);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const updateProduct = async (id, updatedProduct) => {
    try {
      const productWithStatus = {
        ...updatedProduct,
        status: calculateStatus(updatedProduct.expiration, updatedProduct.quantity)
      };
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productWithStatus)
      });
      const updated = await response.json();
      setProducts(products.map(p => p.id === id ? updated : p));
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const updateQ = async (id, newQuantity) => {
  try {
    const currentProduct = products.find(p => p.id === id);
    if (!currentProduct) {
      throw new Error("Produit non trouvé");
    }

    const newStatus = calculateStatus(currentProduct.expiration, newQuantity);

    // Use the new PATCH endpoint
    const response = await fetch(`${API_URL}/products/${id}/quantity`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        quantity: newQuantity,
        status: newStatus
      })
    });

    const updated = await response.json();
    setProducts(products.map(p => p.id === id ? updated : p));

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la quantité:', error);
  }
};

  const deleteProduct = async (id) => {
    try {
      await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const getProduct = (id) => {
    return products.find(p => p.id === id);
  };

  return (
    <ProductContext.Provider value={{
      products,
      addProduct,
      updateQ,
      updateProduct,
      deleteProduct,
      getProduct
    }}>
      {children}
    </ProductContext.Provider>
  );
};