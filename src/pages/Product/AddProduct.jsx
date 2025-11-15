import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useProducts } from "../../context/ProductContext";

export default function AddProduct({ onBack }) {
  const { addProduct } = useProducts();
  const [form, setForm] = useState({
    name: "",
    category: "",
    quantityValue: "",
    quantityUnit: "",
    expiration: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.name && form.category && form.quantityValue && form.quantityUnit && form.expiration) {
      addProduct({
        name: form.name,
        category: form.category,
        quantity: { 
          value: parseInt(form.quantityValue), 
          unit: form.quantityUnit 
        },
        expiration: form.expiration
      });
      setForm({ name: "", category: "", quantityValue: "", quantityUnit: "", expiration: "" });
      alert(`Produit ajouté : ${form.name}`);
      onBack();
    } else {
      alert("Veuillez remplir tous les champs");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-6"
      >
        <ArrowLeft size={20} />
        Retour à l'inventaire
      </button>
      <div className="bg-white shadow-md rounded-2xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Ajouter un produit</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom du produit */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Nom du produit</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ex: Lait, Pomme..."
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
            />
          </div>
          {/* Catégorie */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Catégorie</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
            >
              <option value="">Sélectionnez une catégorie</option>
              <option value="Fruits & Légumes">Fruits & Légumes</option>
              <option value="Viandes">Viandes</option>
              <option value="Produits laitiers">Produits laitiers</option>
              <option value="Boissons">Boissons</option>
              <option value="Autres">Autres</option>
            </select>
          </div>
          {/* Quantité (valeur) */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Quantité (valeur)</label>
            <input
              type="number"
              name="quantityValue"
              value={form.quantityValue}
              onChange={handleChange}
              placeholder="Ex: 1"
              min="1"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
            />
          </div>
          {/* Quantité (unité) */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Unité</label>
            <select
              name="quantityUnit"
              value={form.quantityUnit}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
            >
              <option value="">Sélectionnez une unité</option>
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="L">L</option>
              <option value="unité">unité</option>
            </select>
          </div>
          {/* Date de péremption */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Date de péremption</label>
            <input
              type="date"
              name="expiration"
              value={form.expiration}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
            />
          </div>
          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl"
            >
              Ajouter le produit
            </button>
            <button
              type="button"
              onClick={() => alert("Simulation de scan du code-barres 📸")}
              className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-3 rounded-xl"
            >
              Simuler le scan d'un code-barres
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}