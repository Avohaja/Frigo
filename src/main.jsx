import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { RecipeProvider } from './context/RecipeContext';
import { ShoppingProvider } from './context/ShoppingContext';
import { ProductProvider } from './context/ProductContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RecipeProvider>
      <ShoppingProvider>
        <ProductProvider>
          <App />
        </ProductProvider>
      </ShoppingProvider>
    </RecipeProvider>
  </React.StrictMode>
);
