import { useState } from "react";
import { Bell, Settings as SettingsIcon, BarChart3 } from "lucide-react";
import './index.css'
import { ProductProvider } from './context/ProductContext';
import Inventory from "./pages/Inventory";
import Recipes from "./pages/Recipes";
import ShoppingList from "./pages/ShoppingList";
import Statistics from "./pages/Statistics";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import Dashboard from "./pages/Dashboard";
function App() {
  const [page, setPage] = useState("inventory");
  const [editingProductId, setEditingProductId] = useState(null);

  const handleEditProduct = (id) => {
    setEditingProductId(id);
    setPage("editProduct");
  };

  const renderPage = () => {
    switch (page) {
      case "Dashboard":
        return <Dashboard />;
      case "inventory":
        return <Inventory onAddProduct={() => setPage("addProduct")} onEditProduct={handleEditProduct} />;
      case "recipes":
        return <Recipes />;
      case "shopping":
        return <ShoppingList />;
      case "statistics":
        return <Statistics />;
      case "notifications":
        return <Notifications />;
      case "settings":
        return <Settings />;
      case "addProduct":
        return <AddProduct onBack={() => setPage("inventory")} />;
      case "editProduct":
        return <EditProduct productId={editingProductId} onBack={() => setPage("inventory")} />;
      default:
        return <Inventory />;
    }
  };

  return (
    <ProductProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <h1 className="text-2xl font-bold text-gray-900">SmartChill</h1>
                <nav className="flex gap-6">
                  <button
                    onClick={() => setPage("Dashboard")}
                    className={`text-base font-medium ${
                      page === "Dashboard" ? "text-green-500" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setPage("inventory")}
                    className={`text-base font-medium ${
                      page === "inventory" ? "text-green-500" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Inventaire
                  </button>
                  <button
                    onClick={() => setPage("recipes")}
                    className={`text-base font-medium ${
                      page === "recipes" ? "text-green-500" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Recettes
                  </button>
                  <button
                    onClick={() => setPage("shopping")}
                    className={`text-base font-medium ${
                      page === "shopping" ? "text-green-500" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Liste de courses
                  </button>
                </nav>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setPage("notifications")}
                  className={`p-2 rounded-lg ${
                    page === "notifications" ? "bg-green-100 text-green-600" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Bell size={20} />
                </button>
                <button 
                  onClick={() => setPage("settings")}
                  className={`p-2 rounded-lg ${
                    page === "settings" ? "bg-green-100 text-green-600" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <SettingsIcon size={20} />
                </button>
                <button 
                  onClick={() => setPage("statistics")}
                  className={`p-2 rounded-lg ${
                    page === "statistics" ? "bg-green-100 text-green-600" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <BarChart3 size={20} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>{renderPage()}</main>
      </div>
    </ProductProvider>
  );
}

export default App;