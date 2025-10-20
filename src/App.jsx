import { useState } from "react";
import { Bell, Settings, BarChart3 } from "lucide-react";
import './index.css'
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
// import AddProduct from "./pages/AddProduct";
import ShoppingList from "./pages/ShoppingList";

function App() {
  const [page, setPage] = useState("inventory");

  const renderPage = () => {
    switch (page) {
      case "inventory":
        return <Inventory />;
      // case "add":
      //   return <AddProduct />;
      case "shopping":
        return <ShoppingList />;
      case "dashboard":
        return <Dashboard />;
      default:
        return <Inventory />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-gray-900">SmartChill</h1>
              <nav className="flex gap-6">
                <button
                  onClick={() => setPage("inventory")}
                  className={`text-base font-medium ${
                    page === "inventory" ? "text-green-500" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Inventaire
                </button>
                <button
                  onClick={() => setPage("dashboard")}
                  className={`text-base font-medium ${
                    page === "dashboard" ? "text-green-500" : "text-gray-600 hover:text-gray-900"
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
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Settings size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <BarChart3 size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{renderPage()}</main>
    </div>
  );
}

export default App;