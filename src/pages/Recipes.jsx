import { useContext } from "react";
import { FridgeContext } from "../context/Fridgecontext";
import { analyseConsumption, generateShoppingList, checkExpirationAlerts } from "../utils/aiAlgorithms";

export default function Recipes() {
  const { products, history } = useContext(FridgeContext);

  const predictions = analyseConsumption(history, products);
  const shoppingList = generateShoppingList(predictions);
  const alerts = checkExpirationAlerts(products);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Tableau de bord</h2>

      <section>
        <h3 className="font-semibold">🧾 Liste de courses</h3>
        <ul>
          {shoppingList.map((item, i) => (
            <li key={i}>{item.name} - {item.message}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-semibold">⚠️ Produits à consommer bientôt</h3>
        <ul>
          {alerts.map((a, i) => (
            <li key={i}>{a.name} : {a.daysLeft} jours restants</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
