import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, TrendingUp, AlertTriangle, Package, Calendar, ShoppingCart, Lightbulb, ChevronRight, Bot, User } from 'lucide-react';

export default function Dashboard() {
  const [showAssistant, setShowAssistant] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant intelligent. Je peux vous aider à gérer votre réfrigérateur, suggérer des recettes, et répondre à vos questions. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Données de démonstration
  const stats = {
    totalProducts: 24,
    expiringSoon: 5,
    expired: 2,
    lowStock: 3
  };

  const urgentProducts = [
    { name: 'Lait', expiration: '05/11/2024', status: 'expired' },
    { name: 'Yaourts', expiration: '06/11/2024', status: 'expiring' },
    { name: 'Fromage', expiration: '07/11/2024', status: 'expiring' },
  ];

  const suggestions = [
    { icon: '🥗', text: 'Soupe de légumes avec vos carottes et pommes de terre' },
    { icon: '🍳', text: 'Omelette aux champignons (3 ingrédients disponibles)' },
    { icon: '🥘', text: 'Quiche Lorraine (tous les ingrédients disponibles)' },
  ];

  const quickQuestions = [
    "Combien d'œufs me reste-t-il ?",
    "Qu'est-ce qui expire bientôt ?",
    "Suggère-moi une recette",
    "Liste de courses à faire"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simuler une réponse de l'IA
    setTimeout(() => {
      const response = generateAIResponse(inputMessage);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (question) => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('œuf') || lowerQuestion.includes('oeuf')) {
      return 'Il vous reste 6 œufs dans votre réfrigérateur. Ils sont frais jusqu\'au 15/11/2024. 🥚';
    }
    
    if (lowerQuestion.includes('expire') || lowerQuestion.includes('périm')) {
      return '⚠️ Attention ! Vous avez :\n\n- 1 lait périmé depuis hier\n- 2 yaourts qui expirent demain\n- 1 fromage qui expire dans 3 jours\n\nJe vous suggère de les utiliser rapidement ou de les mettre dans votre liste de courses.';
    }
    
    if (lowerQuestion.includes('recette') || lowerQuestion.includes('cuisiner') || lowerQuestion.includes('manger')) {
      return '👨‍🍳 Voici mes suggestions de recettes basées sur vos ingrédients :\n\n1. **Soupe de légumes** - Vous avez tous les ingrédients ! (30 min)\n2. **Omelette aux champignons** - Facile et rapide (10 min)\n3. **Quiche Lorraine** - Parfaite pour utiliser vos œufs (45 min)\n\nQuelle recette vous intéresse ?';
    }
    
    if (lowerQuestion.includes('courses') || lowerQuestion.includes('acheter') || lowerQuestion.includes('manque')) {
      return '🛒 Voici votre liste de courses suggérée :\n\n**Urgent :**\n- Lait (périmé)\n- Yaourts (bientôt périmés)\n\n**Stock faible :**\n- Beurre (1 restant)\n- Pain (finir aujourd\'hui)\n\n**Pour vos recettes :**\n- Poireaux\n- Bouillon de légumes\n\nVoulez-vous que j\'ajoute d\'autres articles ?';
    }
    
    if (lowerQuestion.includes('combien') || lowerQuestion.includes('reste')) {
      return 'Dans votre réfrigérateur, vous avez actuellement :\n\n📦 24 produits au total\n✅ 17 produits frais\n⚠️ 5 produits bientôt périmés\n❌ 2 produits périmés\n\nQuel produit spécifique voulez-vous vérifier ?';
    }

    if (lowerQuestion.includes('bonjour') || lowerQuestion.includes('salut') || lowerQuestion.includes('hello')) {
      return 'Bonjour ! 👋 Comment puis-je vous aider à mieux gérer votre réfrigérateur aujourd\'hui ?';
    }

    if (lowerQuestion.includes('merci')) {
      return 'Je vous en prie ! N\'hésitez pas si vous avez d\'autres questions. 😊';
    }
    
    return 'Je comprends votre question. Voici ce que je peux faire pour vous :\n\n✓ Vérifier la quantité d\'un produit\n✓ Alerter sur les produits périmés\n✓ Suggérer des recettes\n✓ Créer une liste de courses\n\nPouvez-vous reformuler votre question ?';
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
          <p className="text-gray-600">Bienvenue dans votre réfrigérateur intelligent</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
              <TrendingUp className="text-blue-600" size={20} />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Produits</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Calendar className="text-yellow-600" size={24} />
              </div>
              <AlertTriangle className="text-yellow-600" size={20} />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Bientôt périmés</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.expiringSoon}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <X className="text-red-600" size={20} />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Périmés</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.expired}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <ShoppingCart className="text-orange-600" size={24} />
              </div>
              <TrendingUp className="text-orange-600" size={20} />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Stock faible</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.lowStock}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Produits urgents */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={24} />
                Produits urgents
              </h2>
              <button className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1">
                Voir tout
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {urgentProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${product.status === 'expired' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">Exp: {product.expiration}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    product.status === 'expired' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {product.status === 'expired' ? 'Périmé' : 'Bientôt'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions de recettes */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Lightbulb className="text-yellow-500" size={24} />
                Suggestions de recettes
              </h2>
              <button className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1">
                Voir plus
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{suggestion.icon}</span>
                    <p className="text-gray-800 font-medium">{suggestion.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl hover:shadow-lg transition-all">
              <Package className="text-green-700 mb-2" size={24} />
              <p className="text-sm font-medium text-gray-900">Ajouter produit</p>
            </button>
            <button 
              onClick={() => setShowAssistant(true)}
              className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl hover:shadow-lg transition-all"
            >
              <MessageCircle className="text-blue-700 mb-2" size={24} />
              <p className="text-sm font-medium text-gray-900">Assistant IA</p>
            </button>
            <button className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl hover:shadow-lg transition-all">
              <ShoppingCart className="text-purple-700 mb-2" size={24} />
              <p className="text-sm font-medium text-gray-900">Liste courses</p>
            </button>
            <button className="p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl hover:shadow-lg transition-all">
              <Lightbulb className="text-orange-700 mb-2" size={24} />
              <p className="text-sm font-medium text-gray-900">Recettes</p>
            </button>
          </div>
        </div>
      </main>

      {/* Assistant IA - Chat Window */}
      {showAssistant && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Bot className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold">Assistant IA</h3>
                <p className="text-green-100 text-xs">En ligne</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAssistant(false)}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Questions */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <p className="text-xs text-gray-600 mb-2">Questions rapides :</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-full hover:bg-green-50 hover:border-green-300 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' ? 'bg-green-500' : 'bg-blue-500'
                }`}>
                  {message.role === 'user' ? (
                    <User className="text-white" size={18} />
                  ) : (
                    <Bot className="text-white" size={18} />
                  )}
                </div>
                <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-3 rounded-2xl ${
                    message.role === 'user' 
                      ? 'bg-green-500 text-white rounded-tr-none' 
                      : 'bg-gray-100 text-gray-900 rounded-tl-none'
                  }`}>
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <Bot className="text-white" size={18} />
                </div>
                <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none">
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
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Posez votre question..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Assistant Button */}
      {!showAssistant && (
        <button
          onClick={() => setShowAssistant(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40"
        >
          <MessageCircle className="text-white" size={28} />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
        </button>
      )}
    </div>
  );
}