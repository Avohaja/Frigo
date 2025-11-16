import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, Check } from 'lucide-react';
import { useRecipes } from '../../context/RecipeContext';
import { useProducts } from '../../context/ProductContext';
import { useSnackbar } from 'notistack';

function RecipeForm({ recipeId, onBack }) {
  const { getRecipe, addRecipe, updateRecipe } = useRecipes();
  const { products } = useProducts();
  const { enqueueSnackbar } = useSnackbar();

  const [form, setForm] = useState({
    title: "",
    type: "",
    time: "",
    difficulty: "",
    image: "",
    availableIngredients: [],
    missingIngredients: [],
    steps: [],
    isUsed: false
  });
  const [currentMissingIngredient, setCurrentMissingIngredient] = useState({ name: "", quantity: { value: "", unit: "unité" } });
  const [currentStep, setCurrentStep] = useState("");
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (recipeId) {
      const recipe = getRecipe(recipeId);
      if (recipe) {
        setForm({
          ...recipe,
          // Ensure ingredients have proper structure
          availableIngredients: recipe.availableIngredients?.map(ing =>
            typeof ing === 'string' ? { name: ing, quantity: { value: 1, unit: "unité" } } : ing
          ) || [],
          missingIngredients: recipe.missingIngredients?.map(ing =>
            typeof ing === 'string' ? { name: ing, quantity: { value: 1, unit: "unité" } } : ing
          ) || []
        });
      }
    }
  }, [recipeId, getRecipe]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Filter products based on search
  const getFilteredProducts = () => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !form.availableIngredients.some(ing => ing.name === product.name)
    );
  };

  // Add a product ingredient from inventory
  const addProductIngredient = (product) => {
    if (!form.availableIngredients.some(ing => ing.name === product.name)) {
      const newIngredient = {
        name: product.name,
        quantity: product.quantity // This is now an object {value, unit}
      };
      setForm({
        ...form,
        availableIngredients: [...form.availableIngredients, newIngredient]
      });
      enqueueSnackbar(`Ingrédient "${product.name}" ajouté`, { variant: 'success' });
    }
    setSearchTerm("");
    setShowProductSelector(false);
  };

  const removeIngredient = (index, type) => {
    if (type === 'available') {
      const ingredientName = form.availableIngredients[index].name;
      setForm({
        ...form,
        availableIngredients: form.availableIngredients.filter((_, i) => i !== index)
      });
      enqueueSnackbar(`Ingrédient "${ingredientName}" retiré`, { variant: 'info' });
    } else {
      const ingredientName = form.missingIngredients[index].name;
      setForm({
        ...form,
        missingIngredients: form.missingIngredients.filter((_, i) => i !== index)
      });
      enqueueSnackbar(`Ingrédient manquant "${ingredientName}" retiré`, { variant: 'info' });
    }
  };

  const handleMissingIngredientChange = (field, value) => {
    setCurrentMissingIngredient(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMissingQuantityChange = (field, value) => {
    setCurrentMissingIngredient(prev => ({
      ...prev,
      quantity: {
        ...prev.quantity,
        [field]: value
      }
    }));
  };

  const addMissingIngredient = () => {
    if (currentMissingIngredient.name.trim()) {
      const newIngredient = {
        name: currentMissingIngredient.name.trim(),
        quantity: {
          value: parseInt(currentMissingIngredient.quantity.value) || 1,
          unit: currentMissingIngredient.quantity.unit || "unité"
        }
      };
      setForm({
        ...form,
        missingIngredients: [...form.missingIngredients, newIngredient]
      });
      enqueueSnackbar(`Ingrédient manquant "${newIngredient.name}" ajouté`, { variant: 'success' });
      setCurrentMissingIngredient({ name: "", quantity: { value: "", unit: "unité" } });
    } else {
      enqueueSnackbar("Veuillez entrer un nom pour l'ingrédient manquant", { variant: 'error' });
    }
  };

  const removeStep = (index) => {
    setForm({
      ...form,
      steps: form.steps.filter((_, i) => i !== index)
    });
    enqueueSnackbar(`Étape ${index + 1} supprimée`, { variant: 'info' });
  };

  const addStep = () => {
    if (currentStep.trim()) {
      setForm({
        ...form,
        steps: [...form.steps, currentStep.trim()]
      });
      enqueueSnackbar("Étape ajoutée", { variant: 'success' });
      setCurrentStep("");
    } else {
      enqueueSnackbar("Veuillez entrer une étape", { variant: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.type || !form.time || !form.difficulty) {
      enqueueSnackbar("Veuillez remplir tous les champs obligatoires", { variant: 'error' });
      return;
    }

    try {
      if (recipeId) {
        await updateRecipe(recipeId, form);
        enqueueSnackbar(`Recette "${form.title}" modifiée avec succès!`, { variant: 'success' });
      } else {
        await addRecipe(form);
        enqueueSnackbar(`Recette "${form.title}" ajoutée avec succès!`, { variant: 'success' });
      }
      onBack();
    } catch (error) {
      enqueueSnackbar(`Erreur lors de la sauvegarde de la recette: ${error.message}`, { variant: 'error' });
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
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          {recipeId ? 'Modifier la recette' : 'Ajouter une recette'}
        </h2>

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
          {/* Sélection des ingrédients depuis l'inventaire */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Ingrédients disponibles depuis l'inventaire</label>
            <div className="mb-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un produit dans l'inventaire..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowProductSelector(true);
                  }}
                  onFocus={() => setShowProductSelector(true)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
                />

                {showProductSelector && getFilteredProducts().length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {getFilteredProducts().map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => addProductIngredient(product)}
                        className="w-full text-left px-4 py-3 hover:bg-green-50 flex items-center justify-between group"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">
                            {product.category} - {product.quantity.value} {product.quantity.unit}
                          </p>
                        </div>
                        <Plus size={18} className="text-green-600 opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {form.availableIngredients.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Check size={16} className="text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="font-medium text-green-700">{ingredient.name}</span>
                    <span className="text-sm text-green-600 ml-2">
                      ({ingredient.quantity.value} {ingredient.quantity.unit})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeIngredient(index, 'available')}
                    className="text-red-600 hover:text-red-800 flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            {form.availableIngredients.length === 0 && (
              <p className="text-sm text-gray-500 italic mt-2">
                Aucun ingrédient sélectionné. Recherchez un produit dans votre inventaire.
              </p>
            )}
          </div>
          {/* Ingrédients manquants */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Ingrédients manquants (optionnel)</label>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-3">
              <div className="md:col-span-5">
                <input
                  type="text"
                  value={currentMissingIngredient.name}
                  onChange={(e) => handleMissingIngredientChange('name', e.target.value)}
                  placeholder="Nom de l'ingrédient..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
                />
              </div>
              <div className="md:col-span-3">
                <input
                  type="number"
                  value={currentMissingIngredient.quantity.value}
                  onChange={(e) => handleMissingQuantityChange('value', e.target.value)}
                  placeholder="Quantité"
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
                />
              </div>
              <div className="md:col-span-3">
                <select
                  value={currentMissingIngredient.quantity.unit}
                  onChange={(e) => handleMissingQuantityChange('unit', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
                >
                  <option value="unité">unité</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="mL">mL</option>
                  <option value="L">L</option>
                  <option value="cuillère à soupe">cuillère à soupe</option>
                  <option value="cuillère à café">cuillère à café</option>
                  <option value="pincée">pincée</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <button
                  type="button"
                  onClick={addMissingIngredient}
                  className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 font-medium"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {form.missingIngredients.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium text-orange-700">{ingredient.name}</span>
                    <span className="text-sm text-orange-600 ml-2">
                      ({ingredient.quantity.value} {ingredient.quantity.unit})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeIngredient(index, 'missing')}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          {/* Étapes */}
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
                    className="text-red-600 hover:text-red-800 flex-shrink-0"
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
              {recipeId ? 'Enregistrer les modifications' : 'Ajouter la recette'}
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

export default RecipeForm;
