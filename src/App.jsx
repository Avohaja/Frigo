import { useState } from "react";
import { Bell, Settings, BarChart3, Menu, X, Home, Package, BookOpen, ShoppingCart, MessageCircle } from "lucide-react";
import { ProductProvider } from './context/ProductContext';
import Inventory from "./pages/Product/Inventory";
import Recipes from "./pages/Recipe/Recipes";
import ShoppingList from "./pages/ShoppingList";
import Statistics from "./pages/Statistics";
import Notifications from "./pages/Notifications";
import SettingsPage from "./pages/Settings";
import AddProduct from "./pages/Product/AddProduct";
import EditProduct from "./pages/Product/EditProduct";
import Dashboard from "./pages/Dashboard";
import { ShoppingProvider } from "./context/ShoppingContext";

function App() {
  const [page, setPage] = useState("Dashboard");
  const [editingProductId, setEditingProductId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateTo = (pageName) => {
    setPage(pageName);
    setMobileMenuOpen(false);
  };

  const handleEditProduct = (id) => {
    setEditingProductId(id);
    navigateTo("editProduct");
  };

  const renderPage = () => {
    switch (page) {
      case "Dashboard":
        return (
          <Dashboard
          onViewAllProducts={() => navigateTo("inventory")}
          onViewAllRecipes={() => navigateTo("recipes")}
          onViewShoppingList={() => navigateTo("shopping")}
          onViewStatistics={() => navigateTo("statistics")}
          />
        );
      case "inventory":
        return <Inventory onAddProduct={() => navigateTo("addProduct")} onEditProduct={handleEditProduct} />;
      case "recipes":
        return <Recipes />;
      case "shopping":
        return <ShoppingList />;
      case "statistics":
        return <Statistics />;
      case "notifications":
        return <Notifications />;
      case "settings":
        return <SettingsPage />;
      case "addProduct":
        return <AddProduct onBack={() => navigateTo("inventory")} />;
      case "editProduct":
        return <EditProduct productId={editingProductId} onBack={() => navigateTo("inventory")} />;
      default:
        return <Dashboard />;
    }
  };

  const navItems = [
    { id: "Dashboard", label: "Dashboard", icon: Home },
    { id: "inventory", label: "Inventaire", icon: Package },
    { id: "recipes", label: "Recettes", icon: BookOpen },
    { id: "shopping", label: "Liste de courses", icon: ShoppingCart },
  ];

  return (
    <ShoppingProvider>
    <ProductProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl sm:text-2xl font-bold text-green-600 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">SC</span>
                  </div>
                  <span className="hidden sm:inline">SmartChill</span>
                </h1>
              </div>
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        page === item.id
                          ? "bg-green-50 text-green-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => navigateTo("notifications")}
                    className={`relative p-2 rounded-lg transition-colors ${
                      page === "notifications"
                        ? "bg-green-100 text-green-600"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  <button
                    onClick={() => navigateTo("statistics")}
                    className={`p-2 rounded-lg transition-colors ${
                      page === "statistics"
                        ? "bg-green-100 text-green-600"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <BarChart3 size={20} />
                  </button>
                  <button
                    onClick={() => navigateTo("settings")}
                    className={`p-2 rounded-lg transition-colors ${
                      page === "settings"
                        ? "bg-green-100 text-green-600"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Settings size={20} />
                  </button>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-colors ${
                        page === item.id
                          ? "bg-green-50 text-green-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                <div className="pt-3 mt-3 border-t border-gray-200 space-y-1">
                  <button
                    onClick={() => navigateTo("notifications")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-colors ${
                      page === "notifications"
                        ? "bg-green-50 text-green-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Bell size={20} />
                    <span>Notifications</span>
                    <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  <button
                    onClick={() => navigateTo("statistics")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-colors ${
                      page === "statistics"
                        ? "bg-green-50 text-green-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <BarChart3 size={20} />
                    <span>Statistiques</span>
                  </button>
                  <button
                    onClick={() => navigateTo("settings")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-colors ${
                      page === "settings"
                        ? "bg-green-50 text-green-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Settings size={20} />
                    <span>Paramètres</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </header>
        <main className="min-h-[calc(100vh-4rem)]">
          {renderPage()}
        </main>
      </div>
    </ProductProvider>
      </ShoppingProvider>
  );
}

export default App;
