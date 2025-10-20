import { useState } from "react";

export default function ShoppingList() {
  const [items, setItems] = useState([
    { name: "Lait", quantity: 2, category: "Produits laitiers", status: "À acheter" },
    { name: "Pommes", quantity: 6, category: "Fruits", status: "À acheter" },
    { name: "Riz", quantity: 1, category: "Épicerie", status: "Acheté" },
  ]);

  const toggleStatus = (index) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, status: item.status === "Acheté" ? "À acheter" : "Acheté" }
          : item
      )
    );
  };

  const addItem = () => {
    const name = prompt("Nom du produit :");
    const quantity = prompt("Quantité :");
    const category = prompt("Catégorie :");
    if (name && quantity && category) {
      setItems([...items, { name, quantity, category, status: "À acheter" }]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Liste de courses</h2>
        <button
          onClick={addItem}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          + Ajouter un article
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200">
        <table className="w-full text-left">
          <thead className="bg-green-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-700">Produit</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Quantité</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Catégorie</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Statut</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">{item.category}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      item.status === "Acheté"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleStatus(i)}
                    className="text-green-600 hover:text-green-800 font-medium"
                  >
                    {item.status === "Acheté" ? "Marquer comme à acheter" : "Marquer comme acheté"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Résumé */}
      <div className="mt-8 flex justify-between text-gray-700">
        <p>
          🛒 Total des articles : <span className="font-semibold">{items.length}</span>
        </p>
        <p>
          ✅ Achetés :{" "}
          <span className="font-semibold">
            {items.filter((item) => item.status === "Acheté").length}
          </span>
        </p>
      </div>
    </div>
  );
}
