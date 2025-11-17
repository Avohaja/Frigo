import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { daysUntilExpiration } from '../utils/dateUtils';

function SmartAssistant() {
  const { products } = useProducts();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant intelligent SmartChill. Je peux vous aider à gérer votre réfrigérateur, suggérer des recettes, et répondre à vos questions. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    "Qu'est-ce qui expire bientôt ?",
    "Quels produits sont périmés ?",
    "Que puis-je cuisiner ?"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Analyse des produits
  const analyzeProducts = () => {
    const now = new Date();
    const expired = products.filter(p => daysUntilExpiration(p.expiration) < 0);
    const expiringSoon = products.filter(p => {
      const days = daysUntilExpiration(p.expiration);
      return days >= 0 && days <= 3;
    });
    const lowStock = products.filter(p => p.quantity <= 2);
    const fresh = products.filter(p => daysUntilExpiration(p.expiration) > 3 && p.quantity > 2);
    return { expired, expiringSoon, lowStock, fresh, total: products.length };
  };

  // Recherche de produit par nom (insensible à la casse)
  const findProduct = (searchTerm) => {
    return products.find(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Compte le nombre de produits correspondant à un nom donné
  const countProductsByName = (searchTerm) => {
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).length;
  };

  // Génération de réponse intelligente
  const generateAIResponse = (question) => {
    const lowerQuestion = question.toLowerCase();
    const analysis = analyzeProducts();

    // Salutations
    if (lowerQuestion.match(/bonjour|salut|hello|hi|hey/)) {
      return `Bonjour ! 👋 Comment puis-je vous aider à gérer votre réfrigérateur aujourd\'hui ? Vous avez actuellement ${analysis.total} produit(s) dans votre frigo.`;
    }

    // Qu'est-ce qui expire bientôt ?
    if (lowerQuestion.match(/expire bientôt|expire dans peu de temps|proche de la date/)) {
      if (analysis.expiringSoon.length === 0) {
        return "✅ Aucun produit n'expire dans les 3 prochains jours.";
      } else {
        let response = "⚠️ **Produits expirant bientôt :**\n\n";
        analysis.expiringSoon.forEach(p => {
          const days = daysUntilExpiration(p.expiration);
          response += `• ${p.name} (expire dans ${days} jour(s))\n`;
        });
        return response;
      }
    }

    // Combien me reste-t-il de ... ?
    if (lowerQuestion.match(/combien.*reste|nombre de|quantité de/)) {
      const productNameMatch = lowerQuestion.match(/de (\w+)\s*\??/);
      if (productNameMatch && productNameMatch[1]) {
        const productName = productNameMatch[1];
        const count = countProductsByName(productName);
        const product = findProduct(productName);
        if (product) {
          return `🔍 Vous avez **${count}** ${product.name} dans votre frigo.`;
        } else {
          return "Je n'ai pas trouvé ce produit. Vérifiez l'orthographe ou essayez un autre nom.";
        }
      } else {
        return "Veuillez préciser le nom du produit (ex: 'Combien me reste-t-il de pommes ?').";
      }
    }

    // Quels produits sont périmés ?
    if (lowerQuestion.match(/périmé|produit périmé|date dépassée/)) {
      if (analysis.expired.length === 0) {
        return "✅ Aucun produit n'est périmé.";
      } else {
        let response = "❌ **Produits périmés :**\n\n";
        analysis.expired.forEach(p => {
          const days = Math.abs(daysUntilExpiration(p.expiration));
          response += `• ${p.name} (périmé depuis ${days} jour(s))\n`;
        });
        return response;
      }
    }

    // Que puis-je cuisiner ?
    if (lowerQuestion.match(/recette|cuisiner|manger|repas|plat/)) {
      const categories = [...new Set(products.map(p => p.category))];
      return `👨‍🍳 **Suggestions de recettes :**\n\n` +
             `Avec vos produits actuels (${categories.join(', ')}), vous pouvez préparer :\n\n` +
             `1. Salade composée (avec vos légumes frais)\n` +
             `2. Omelette aux légumes\n` +
             `3. Soupe de légumes\n` +
             `4. Plat de pâtes avec légumes\n\n` +
             `💡 Consultez la section "Recettes" pour plus d'idées !`;
    }

    // Questions sur la quantité totale
    if (lowerQuestion.match(/combien de produits|nombre total|total/)) {
      return `📊 **Votre inventaire :**\n\n` +
             `• Total : ${analysis.total} produit(s)\n` +
             `• Frais : ${analysis.fresh.length}\n` +
             `• À consommer rapidement : ${analysis.expiringSoon.length}\n` +
             `• Périmés : ${analysis.expired.length}\n` +
             `• Stock faible : ${analysis.lowStock.length}`;
    }

    // Questions sur un produit spécifique (état, quantité, etc.)
    if (lowerQuestion.match(/ai-je|reste|il y a/)) {
      const words = lowerQuestion.split(' ');
      for (let word of words) {
        const product = findProduct(word);
        if (product) {
          const days = daysUntilExpiration(product.expiration);
          const status = days < 0 ? '❌ périmé' : days <= 3 ? '⚠️ à consommer rapidement' : '✅ frais';
          return `🔍 **${product.name}** :\n\n` +
                 `• Quantité : ${product.quantity}\n` +
                 `• Catégorie : ${product.category}\n` +
                 `• Date d'expiration : ${new Date(product.expiration).toLocaleDateString('fr-FR')}\n` +
                 `• État : ${status} (${days >= 0 ? days + ' jour(s) restant(s)' : Math.abs(days) + ' jour(s) périmé(s)'})`;
        }
      }
      return 'Je n\'ai pas trouvé ce produit dans votre frigo. Pouvez-vous préciser le nom ?';
    }

    // Questions sur les courses
    if (lowerQuestion.match(/course|acheter|liste|manque/)) {
      let response = '🛒 **Liste de courses suggérée :**\n\n';

      if (analysis.expired.length > 0) {
        response += '**À remplacer (périmés) :**\n';
        analysis.expired.forEach(p => {
          response += `  • ${p.name}\n`;
        });
        response += '\n';
      }

      if (analysis.lowStock.length > 0) {
        response += '**Stock faible :**\n';
        analysis.lowStock.forEach(p => {
          response += `  • ${p.name} (${p.quantity} restant(s))\n`;
        });
        response += '\n';
      }

      if (analysis.expired.length === 0 && analysis.lowStock.length === 0) {
        response += '✅ Votre stock est bon pour le moment !\n';
      }

      return response;
    }

    // Questions sur les catégories
    if (lowerQuestion.match(/catégorie|type/)) {
      const categoryCount = products.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {});

      let response = '📦 **Répartition par catégories :**\n\n';
      Object.entries(categoryCount).forEach(([cat, count]) => {
        response += `• ${cat} : ${count} produit(s)\n`;
      });

      return response;
    }

    // Remerciements
    if (lowerQuestion.match(/merci|thanks|thx/)) {
      return 'Je vous en prie ! 😊 N\'hésitez pas si vous avez d\'autres questions sur votre réfrigérateur.';
    }

    // Aide
    if (lowerQuestion.match(/aide|help|peux-tu|peut-tu/)) {
      return '🤖 **Je peux vous aider avec :**\n\n' +
             '• Vérifier l\'état de vos produits\n' +
             '• Vous alerter sur les produits périmés\n' +
             '• Suggérer des recettes\n' +
             '• Créer une liste de courses\n' +
             '• Répondre à vos questions sur votre inventaire\n\n' +
             'Essayez de me demander : "Qu\'est-ce qui expire bientôt ?" ou "Combien de produits ai-je ?"';
    }

    // Par défaut
    return '🤔 Je n\'ai pas bien compris votre question. Voici ce que je peux faire :\n\n' +
           '• Analyser vos produits ("Qu\'est-ce qui expire ?")\n' +
           '• Vérifier les quantités ("Combien de produits ?")\n' +
           '• Suggérer des recettes ("Que puis-je cuisiner ?")\n' +
           '• Créer une liste de courses\n\n' +
           'Reformulez votre question ou utilisez les suggestions rapides !';
  };

  // const handleSendMessage = () => {
  //   if (!inputMessage.trim()) return;
  //   const userMessage = {
  //     role: 'user',
  //     content: inputMessage,
  //     timestamp: new Date()
  //   };
  //   setMessages([...messages, userMessage]);
  //   setInputMessage('');
  //   setIsTyping(true);
  //   setTimeout(() => {
  //     const response = generateAIResponse(inputMessage);
  //     setMessages(prev => [...prev, {
  //       role: 'assistant',
  //       content: response,
  //       timestamp: new Date()
  //     }]);
  //     setIsTyping(false);
  //   }, 1000);
  // };

const handleSendMessage = async () => {
  if (!inputMessage.trim()) return;
  
  try {
    const response = await fetch('http://localhost:5000/run-export');
    const result = await response.text();
    console.log(result);
  } catch (error) {
    console.error("Erreur lors de l'exécution du script:", error);
  }

  const newMessage = {
    role: "user",
    content: inputMessage,
    timestamp: new Date(),
  };

  setMessages([...messages, newMessage]);
  setInputMessage("");
  setIsTyping(true);

  try {
    const response = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: "user", content: inputMessage },
        ],
      }),
    });

    const data = await response.json();
    setMessages(prev => [
      ...prev,
      { role: "assistant", content: data.reply, timestamp: new Date() },
    ]);
  } catch (error) {
    console.error("Error sending message:", error);
  } finally {
    setIsTyping(false);
  }
};


  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40"
      >
        <MessageCircle className="text-white" size={28} />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <Bot className="text-green-600" size={24} />
          </div>
          <div>
            <h3 className="text-white font-bold">Assistant SmartChill</h3>
            <p className="text-green-100 text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
              En ligne • {products.length} produit(s)
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Quick Questions */}
      <div className="p-4 bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
        <p className="text-xs text-gray-600 mb-2 font-medium">Questions rapides :</p>
        <div className="grid grid-cols-2 gap-2">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuestion(question)}
              className="text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all shadow-sm hover:shadow"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'user' ? 'bg-green-500' : 'bg-gradient-to-br from-blue-500 to-blue-600'
            }`}>
              {message.role === 'user' ? (
                <User className="text-white" size={18} />
              ) : (
                <Bot className="text-white" size={18} />
              )}
            </div>
            <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block p-3 rounded-2xl max-w-[85%] ${
                message.role === 'user'
                  ? 'bg-green-500 text-white rounded-tr-none'
                  : 'bg-white text-gray-900 rounded-tl-none shadow-sm border border-gray-100'
              }`}>
                <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1 px-1">
                {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Bot className="text-white" size={18} />
            </div>
            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Posez votre question..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default SmartAssistant;
