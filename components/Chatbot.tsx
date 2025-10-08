import { useState, useEffect } from 'react';

const Chatbot = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);

  const sendMessage = async () => {
    if (!message) return;

    setChatHistory(prev => [...prev, { role: 'user', content: message }]);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    setChatHistory(prev => [...prev, { role: 'bot', content: data.text }]);
    setMessage('');
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-lg flex flex-col">
      <div className="p-4 border-b">Chat with us!</div>
      <div className="flex-1 p-4 overflow-y-auto">
        {chatHistory.map((chat, index) => (
          <div key={index} className={`mb-2 ${chat.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-lg ${chat.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {chat.content}
            </span>
          </div>
        ))}
      </div>
      <div className="p-4 border-t flex">
        <input
          type="text"
          className="flex-1 border rounded-lg p-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button className="ml-2 bg-blue-500 text-white p-2 rounded-lg" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;
