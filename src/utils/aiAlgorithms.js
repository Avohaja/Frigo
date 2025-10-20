// src/utils/aiAlgorithms.js

/**
 * Fichier : aiAlgorithms.js
 * Rôle : regroupe toutes les fonctions d’analyse et d’intelligence
 * pour le réfrigérateur intelligent.
 * 
 * Fonctions principales :
 *  - analyseConsumption() : analyse la consommation des produits
 *  - generateShoppingList() : crée une liste de courses intelligente
 *  - suggestRecipes() : propose des recettes selon le contenu
 *  - diversifyRecipes() : évite la répétition des plats
 *  - predictHabits() : détecte les habitudes d’achat/consommation
 *  - checkExpirationAlerts() : alerte sur les produits proches de la date limite
 */

import dayjs from "dayjs";

/* ------------------ 1. Analyse de la consommation ------------------ */
/**
 * Calcule la consommation moyenne et prédit quand un produit sera épuisé.
 * @param {Array} history - Historique des consommations {name, quantityUsed, date}
 * @param {Array} products - Liste actuelle des produits {name, quantity}
 * @returns {Array} prédictions [{ name, daysLeft }]
 */
export function analyseConsumption(history, products) {
  const consumption = {};

  // Regroupe les consommations par produit
  history.forEach((entry) => {
    const name = entry.name.toLowerCase();
    if (!consumption[name]) consumption[name] = [];
    consumption[name].push(entry.quantityUsed);
  });

  // Calcule la moyenne et les jours restants
  return Object.keys(consumption).map((name) => {
    const totalUsed = consumption[name].reduce((a, b) => a + b, 0);
    const avgUse = totalUsed / consumption[name].length; // moyenne de conso
    const product = products.find((p) => p.name.toLowerCase() === name);

    if (!product) return { name, daysLeft: 0 };

    const daysLeft = Math.max(0, Math.round(product.quantity / avgUse));
    return { name, daysLeft };
  });
}

/* ------------------ 2. Liste de courses intelligente ------------------ */
/**
 * Génère une liste d’achats basée sur les prédictions de consommation.
 * @param {Array} predictions - Résultat de analyseConsumption()
 * @param {Number} threshold - Nombre de jours avant rupture
 * @returns {Array} liste de courses
 */
export function generateShoppingList(predictions, threshold = 3) {
  return predictions
    .filter((p) => p.daysLeft <= threshold)
    .map((p) => ({
      name: p.name,
      message: `Bientôt en rupture (${p.daysLeft} jours restants)`
    }));
}

/* ------------------ 3. Suggestions de recettes ------------------ */
/**
 * Suggère des recettes selon les produits disponibles.
 * @param {Array} recipes - Recettes disponibles [{ name, ingredients: [] }]
 * @param {Array} products - Produits disponibles [{ name }]
 * @returns {Array} recettes triées par pertinence
 */
export function suggestRecipes(recipes, products) {
  const available = products.map((p) => p.name.toLowerCase());

  const matches = recipes.map((r) => {
    const matched = r.ingredients.filter((i) =>
      available.includes(i.toLowerCase())
    );
    const score = matched.length / r.ingredients.length;
    return { ...r, matchScore: score };
  });

  return matches
    .filter((r) => r.matchScore >= 0.5)
    .sort((a, b) => b.matchScore - a.matchScore);
}

/* ------------------ 4. Diversification des plats ------------------ */
/**
 * Évite de proposer trop souvent les mêmes recettes.
 * @param {Array} suggestions - Liste de recettes suggérées
 * @param {Array} recentRecipes - Liste des recettes déjà proposées récemment
 * @returns {Array} recettes diversifiées
 */
export function diversifyRecipes(suggestions, recentRecipes) {
  return suggestions.filter(
    (r) => !recentRecipes.includes(r.name)
  );
}

/* ------------------ 5. Prédiction des habitudes ------------------ */
/**
 * Identifie les produits consommés de manière récurrente (habitudes).
 * @param {Array} history - Historique de consommation
 * @returns {Array} produits récurrents
 */
export function predictHabits(history) {
  const freq = {};

  history.forEach((entry) => {
    const key = `${entry.name}`;
    freq[key] = (freq[key] || 0) + 1;
  });

  // On considère qu’un produit est “habitué” s’il apparaît souvent
  return Object.entries(freq)
    .filter(([_, count]) => count >= 3)
    .map(([name]) => name);
}

/* ------------------ 6. Alerte de péremption ------------------ */
/**
 * Vérifie les produits proches de la date de péremption.
 * @param {Array} products - Produits {name, datePeremption}
 * @param {Number} warningDays - Nombre de jours avant alerte
 * @returns {Array} alertes [{ name, daysLeft }]
 */
export function checkExpirationAlerts(products, warningDays = 3) {
  return products
    .map((p) => {
      const daysLeft = dayjs(p.datePeremption).diff(dayjs(), "day");
      return { name: p.name, daysLeft };
    })
    .filter((p) => p.daysLeft <= warningDays);
}
