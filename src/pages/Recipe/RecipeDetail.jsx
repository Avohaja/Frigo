import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRecipes } from "../../context/RecipeContext";
import { ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";

export default function RecipeDetail({ recipeId, onBack }) {
  const { getRecipe } = useRecipes();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      const recipeData = getRecipe(recipeId);
      setRecipe(recipeData);
    };
    fetchRecipe();
  }, [recipeId, getRecipe]);

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium mb-6"
          >
            <ArrowLeft size={20} />
            Retour aux recettes
          </button>
          <h2 className="text-4xl font-bold text-gray-800 animate-pulse">
            Chargement...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium mb-6"
          >
            <ArrowLeft size={20} />
            Retour aux recettes
          </button>

          <h2 className="text-5xl font-extrabold text-gray-900 mb-3">
            {recipe.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-8">
            <span className="flex items-center gap-1">
              <Clock size={16} />
              {recipe.time}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 shadow-sm">
              {recipe.difficulty}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 shadow-sm">
              {recipe.type}
            </span>
          </div>
        </motion.div>

        {/* Recipe Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          {/* Image */}
          <div
            className="h-72 sm:h-96 bg-cover bg-center relative"
            style={{
              backgroundImage: `url(${
                recipe.image ||
                "https://via.placeholder.com/800x400?text=No+Image"
              })`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
          </div>

          <div className="p-8 sm:p-10">
            {/* Steps Section (Top & Centered) */}
            <section className="mb-12 text-center">
              <h3 className="text-3xl font-semibold text-gray-900 mb-6 border-b-4 border-green-500 inline-block px-4 pb-2">
                Étapes
              </h3>
              <ol className="mt-8 max-w-2xl mx-auto space-y-5 text-left">
                {recipe.steps?.map((step, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-4 items-start"
                  >
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold shadow-sm shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{step}</p>
                  </motion.li>
                ))}
              </ol>
            </section>

            {/* Ingredients Section (below steps) */}
            <section className="mt-12">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 border-l-4 border-green-500 pl-3">
                Ingrédients
              </h3>

              <div className="mb-8">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={20} />
                  Disponibles ({recipe.availableIngredients?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {recipe.availableIngredients?.map((ingredient, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
                    >
                      {ingredient.name}
                    </motion.span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <XCircle className="text-red-500" size={20} />
                  Manquants ({recipe.missingIngredients?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {recipe.missingIngredients?.map((ingredient, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm hover:bg-red-200 transition-colors"
                    >
                      {ingredient.name}{" "}
                      {ingredient.quantity && `(${ingredient.quantity})`}
                    </motion.span>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
