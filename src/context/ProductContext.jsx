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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calcule le statut en fonction de la date de péremption et de la quantité
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

  // Récupère les produits depuis l'API
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
      
      // Check what format quantity is in
      data.forEach(product => {
        console.log(`Product ${product.id} quantity:`, product.quantity, typeof product.quantity);
      });
      
      // Met à jour le statut pour chaque produit
      const productsWithUpdatedStatus = data.map(product => ({
        ...product,
        status: calculateStatus(product.expiration, product.quantity)
      }));

      setProducts(productsWithUpdatedStatus);
      setIsInitialized(true);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message);
      // No mock data - just set empty array and show error
      setProducts([]);
      setIsInitialized(true);
    } finally {
      setLoading(false);
    }
  };

  // Charge les produits au démarrage
  useEffect(() => {
    fetchProducts();
  }, []);

  // Ajoute un nouveau produit
  const addProduct = async (product) => {
    try {
      const productWithStatus = {
        ...product,
        quantity: product.quantity, // Keep as object {value, unit}
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
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error; // Re-throw to handle in component
    }
  };

  // Met à jour un produit existant
  const updateProduct = async (id, updatedProduct) => {
    try {
      const productWithStatus = {
        ...updatedProduct,
        quantity: updatedProduct.quantity, // Keep as object
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
      return updated;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  // Met à jour uniquement la quantité d'un produit
  const updateQuantity = async (id, newQuantity) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}/quantity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: newQuantity
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updated = await response.json();
      setProducts(products.map(p => (p.id === id ? updated : p)));
      return updated;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
      throw error;
    }
  };

  // Supprime un produit
  const deleteProduct = async (id) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, { 
        method: 'DELETE' 
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  // Récupère un produit par son ID
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