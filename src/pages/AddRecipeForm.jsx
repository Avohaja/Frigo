import React, { useState } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";

function AddRecipeForm({ onBack }) {
  const { addRecipe } = useRecipes();
  const [form, setForm] = useState({
    title: "",
    type: "",
    time: "",
    difficulty: "",
    image: "",
    availableIngredients: [],
    missingIngredients: [],
    steps: []
  });
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [currentMissingIngredient, setCurrentMissingIngredient] = useState("");
  const [currentStep, setCurrentStep] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const addIngredient = () => {
    if (currentIngredient.trim()) {
      setForm({
        ...form,
        availableIngredients: [...form.availableIngredients, currentIngredient.trim()]
      });
      setCurrentIngredient("");
    }
  };

  const removeIngredient = (index) => {
    setForm({
      ...form,
      availableIngredients: form.availableIngredients.filter((_, i) => i !== index)
    });
  };

  const addMissingIngredient = () => {
    if (currentMissingIngredient.trim()) {
      setForm({
        ...form,
        missingIngredients: [...form.missingIngredients, currentMissingIngredient.trim()]
      });
      setCurrentMissingIngredient("");
    }
  };

  const removeMissingIngredient = (index) => {
    setForm({
      ...form,
      missingIngredients: form.missingIngredients.filter((_, i) => i !== index)
    });
  };

  const addStep = () => {
    if (currentStep.trim()) {
      setForm({
        ...form,
        steps: [...form.steps, currentStep.trim()]
      });
      setCurrentStep("");
    }
  };

  const removeStep = (index) => {
    setForm({
      ...form,
      steps: form.steps.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.title && form.type && form.time && form.difficulty) {
      addRecipe(form);
      alert(`Recette ajoutée : ${form.title}`);
      onBack();
    } else {
      alert("Veuillez remplir tous les champs obligatoires");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-6"
      >
        <ArrowLeft size={20} />
        Retour aux recettes
      </button>
      <div className="bg-white shadow-md rounded-2xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Ajouter une recette</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Titre de la recette *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Ex: Tarte aux pommes"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Type de plat *</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              >
                <option value="">Sélectionnez un type</option>
                <option value="Entrée">Entrée</option>
                <option value="Plat principal">Plat principal</option>
                <option value="Dessert">Dessert</option>
                <option value="Accompagnement">Accompagnement</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Temps de préparation *</label>
              <input
                type="text"
                name="time"
                value={form.time}
                onChange={handleChange}
                placeholder="Ex: 30 min"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Difficulté *</label>
              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              >
                <option value="">Sélectionnez une difficulté</option>
                <option value="Facile">Facile</option>
                <option value="Moyen">Moyen</option>
                <option value="Difficile">Difficile</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium">URL de l'image</label>
            <input
              type="url"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Ingrédients disponibles</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={currentIngredient}
                onChange={(e) => setCurrentIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                placeholder="Ex: Carottes, Pommes de terre..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={addIngredient}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.availableIngredients.map((ingredient, index) => (
                <span key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  {ingredient}
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="hover:text-green-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Ingrédients manquants (optionnel)</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={currentMissingIngredient}
                onChange={(e) => setCurrentMissingIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMissingIngredient())}
                placeholder="Ex: Poireaux, Fromage..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={addMissingIngredient}
                className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 font-medium"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.missingIngredients.map((ingredient, index) => (
                <span key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                  {ingredient}
                  <button
                    type="button"
                    onClick={() => removeMissingIngredient(index)}
                    className="hover:text-orange-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Étapes de préparation</label>
            <div className="flex gap-2 mb-3">
              <textarea
                value={currentStep}
                onChange={(e) => setCurrentStep(e.target.value)}
                placeholder="Décrivez une étape..."
                rows="2"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={addStep}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium self-start"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {form.steps.map((step, index) => (
                <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <p className="flex-1 text-gray-700">{step}</p>
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl"
            >
              Ajouter la recette
            </button>
            <button
              type="button"
              onClick={onBack}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
