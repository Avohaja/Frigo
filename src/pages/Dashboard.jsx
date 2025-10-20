export default function Dashboard() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Mon Frigo</h2>

      {/* Alertes Urgentes */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Alertes Urgentes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { name: "Lait", expire: "Expire dans 1 jour", color: "text-red-500", img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b" },
            { name: "Épinards", expire: "Expire dans 2 jours", color: "text-yellow-500", img: "https://images.unsplash.com/photo-1604909053194-5b4a94c5089d" },
            { name: "Yaourt", expire: "Expire dans 3 jours", color: "text-yellow-400", img: "https://images.unsplash.com/photo-1601050690597-2d5e8596de68" },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden">
              <img src={item.img} alt={item.name} className="h-40 w-full object-cover" />
              <div className="p-4">
                <h4 className="font-semibold text-gray-800">{item.name}</h4>
                <p className={`text-sm ${item.color}`}>{item.expire}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Statistiques */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Statistiques Rapides</h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-green-50 p-6 rounded-2xl">
            <p className="text-gray-600">Total des produits</p>
            <p className="text-4xl font-bold text-green-700 mt-2">25</p>
          </div>
          <div className="bg-green-50 p-6 rounded-2xl">
            <p className="text-gray-600">Capacité du frigo</p>
            <p className="text-4xl font-bold text-green-700 mt-2">75%</p>
          </div>
        </div>
      </section>

      {/* Actions Rapides */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Actions Rapides</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold">
            Voir tous les produits
          </button>
          <button className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-3 rounded-xl font-semibold">
            Planifier les repas
          </button>
        </div>
      </section>
    </div>
  );
}


// import { useContext } from "react";
// import { FridgeContext } from "../context/Fridgecontext";
// import { analyseConsumption, generateShoppingList, checkExpirationAlerts } from "../utils/aiAlgorithms";

// export default function Dashboard() {
//   const { products, history } = useContext(FridgeContext);

//   const predictions = analyseConsumption(history, products);
//   const shoppingList = generateShoppingList(predictions);
//   const alerts = checkExpirationAlerts(products);

//   return (
//     <div className="p-4 space-y-4">
//       <h2 className="text-xl font-bold">Tableau de bord</h2>

//       <section>
//         <h3 className="font-semibold">🧾 Liste de courses</h3>
//         <ul>
//           {shoppingList.map((item, i) => (
//             <li key={i}>{item.name} - {item.message}</li>
//           ))}
//         </ul>
//       </section>

//       <section>
//         <h3 className="font-semibold">⚠️ Produits à consommer bientôt</h3>
//         <ul>
//           {alerts.map((a, i) => (
//             <li key={i}>{a.name} : {a.daysLeft} jours restants</li>
//           ))}
//         </ul>
//       </section>
//     </div>
//   );
// }
