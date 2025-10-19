import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Communications() {
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContacts();
    fetchMessages();
  }, []);

  async function fetchContacts() {
    try {
      const res = await axios.get('/api/communications/contacts');
      setContacts(res.data.contacts || []);
    } catch (err) {
      console.error('Failed to load contacts');
    }
  }

  async function fetchMessages() {
    try {
      const res = await axios.get('/api/communications/messages');
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to load messages');
    }
  }

  async function fetchMessagesWithContact(contactId) {
    try {
      const res = await axios.get(`/api/communications/messages/${contactId}`);
      setMessages(res.data.messages || []);
      setSelectedContact(contactId);
    } catch (err) {
      setError('Failed to load conversation');
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    try {
      await axios.post('/api/communications/messages', {
        recipientId: selectedContact,
        content: newMessage
      });
      
      setNewMessage('');
      fetchMessagesWithContact(selectedContact); // Refresh conversation
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
  }

  function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(timestamp) {
    const date = new Date(timestamp);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    return date.toLocaleDateString();
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="rounded border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="flex flex-col md:flex-row h-[500px]">
        {/* Contacts sidebar */}
        <div className="w-full md:w-1/3 border-r border-gray-200 dark:border-slate-800 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-slate-800">
            <h3 className="font-semibold">Contacts</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {contacts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No contacts available
              </div>
            ) : (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact._id}>
                    <button
                      className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-slate-800 ${
                        selectedContact === contact._id ? 'bg-gray-100 dark:bg-slate-800' : ''
                      }`}
                      onClick={() => fetchMessagesWithContact(contact._id)}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-800 dark:text-blue-200 font-medium mr-3">
                          {contact.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{contact.name}</div>
                          <div className="text-xs text-gray-500 dark:text-slate-400 truncate">
                            {contact.role} • {contact.companyName || contact.email}
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 flex flex-col">
          {selectedContact ? (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-slate-800">
                <h3 className="font-semibold">
                  {contacts.find(c => c._id === selectedContact)?.name || 'Conversation'}
                </h3>
              </div>
              
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800 p-3 text-red-800 dark:text-red-200 text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex-1 overflow-y-auto p-4">
                {Object.keys(groupedMessages).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No messages in this conversation yet
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedMessages).map(([date, messages]) => (
                      <div key={date}>
                        <div className="text-center my-4">
                          <span className="inline-block px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400">
                            {formatDate(date)}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {messages.map((message) => (
                            <div 
                              key={message._id} 
                              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                              <div 
                                className={`max-w-xs md:max-w-md rounded px-4 py-2 ${
                                  message.isOwn
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200'
                                }`}
                              >
                                <div className="text-sm">{message.content}</div>
                                <div 
                                  className={`text-xs mt-1 ${
                                    message.isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-slate-400'
                                  }`}
                                >
                                  {formatTime(message.timestamp)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-slate-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 flex-1 bg-white dark:bg-slate-800"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    disabled={!newMessage.trim()}
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-8 text-gray-500">
                <div className="text-4xl mb-4">✉️</div>
                <h3 className="font-medium text-lg mb-2">Select a contact to start messaging</h3>
                <p className="text-sm">Choose a contact from the sidebar to view your conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}