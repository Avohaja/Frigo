import { createContext, useState, useEffect } from "react";
import { loadData, saveData } from "../utils/storage";

export const FridgeContext = createContext();

export function FridgeProvider({ children }) {
  const [products, setProducts] = useState(loadData("products") || []);
  const [history, setHistory] = useState(loadData("history") || []);

  useEffect(() => {
    saveData("products", products);
    saveData("history", history);
  }, [products, history]);

  const addProduct = (product) => {
    setProducts((prev) => [...prev, product]);
  };

  const removeProduct = (id, quantityUsed) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, quantity: p.quantity - quantityUsed } : p
      )
    );
    setHistory((prev) => [...prev, { id, quantityUsed, date: new Date() }]);
  };

  return (
    <FridgeContext.Provider value={{ products, addProduct, removeProduct, history }}>
      {children}
    </FridgeContext.Provider>
  );
}
