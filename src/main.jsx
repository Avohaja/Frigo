import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { RecipeProvider } from './context/RecipeContext';
import { ShoppingProvider } from './context/ShoppingContext';
import { ProductProvider } from './context/ProductContext';
import { SnackbarProvider } from 'notistack';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SnackbarProvider
      maxSnack={3}
      autoHideDuration={3000}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      style={{ fontFamily: 'your-font-family' }} // Optional: Customize font
    >
      <RecipeProvider>
        <ShoppingProvider>
          <ProductProvider>
            <App />
          </ProductProvider>
        </ShoppingProvider>
      </RecipeProvider>
    </SnackbarProvider>
  </React.StrictMode>
);
