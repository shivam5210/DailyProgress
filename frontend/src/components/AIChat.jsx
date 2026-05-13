import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, User } from 'lucide-react';
import { api } from '../api/client';

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Commander, I am online. How shall we optimize your trajectory today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/engine/chat', { 
        message: input,
        history: messages 
      });
      
      const botMsg = { role: 'bot', content: '', fullContent: data.response };
      setMessages(prev => [...prev, botMsg]);
      
      // Simulate streaming/typewriter
      let current = '';
      const words = data.response.split(' ');
      for (let i = 0; i < words.length; i++) {
        current += words[i] + ' ';
        setMessages(prev => {
          const last = [...prev];
          last[last.length - 1].content = current;
          return last;
        });
        await new Promise(r => setTimeout(r, 40));
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: 'Neural link failed. Reconnecting...' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="glass"
            style={{ width: '380px', height: '520px', marginBottom: '1rem', display: 'flex', flexDirection: 'column', border: '1px solid var(--lime)' }}
          >
            <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--glass-stroke)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(188, 255, 71, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <Bot size={20} color="var(--lime)" />
                <span className="hud-label" style={{ color: 'var(--lime)', letterSpacing: '0.1em' }}>Core Intelligence</span>
              </div>
              <X size={20} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => setIsOpen(false)} />
            </div>

            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ alignSelf: m.role === 'bot' ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
                  <div style={{ display: 'flex', gap: '0.6rem', flexDirection: m.role === 'bot' ? 'row' : 'row-reverse' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: m.role === 'bot' ? 'rgba(188,255,71,0.1)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                      {m.role === 'bot' ? <Bot size={14} color="var(--lime)" /> : <User size={14} />}
                    </div>
                    <div className="glass" style={{ padding: '0.8rem 1rem', borderRadius: m.role === 'bot' ? '2px 16px 16px 16px' : '16px 2px 16px 16px', fontSize: '0.9rem', lineHeight: 1.5, background: m.role === 'bot' ? 'rgba(255,255,255,0.02)' : 'rgba(188,255,71,0.03)' }}>
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
              {loading && <div className="hud-label" style={{ fontSize: '0.6rem', opacity: 0.5 }}>AI is thinking...</div>}
            </div>

            <form onSubmit={handleSend} style={{ padding: '1.2rem', borderTop: '1px solid var(--glass-stroke)', display: 'flex', gap: '0.8rem' }}>
              <input 
                className="input" 
                style={{ padding: '0.8rem 1rem', fontSize: '0.85rem' }} 
                placeholder="Neural input..." 
                value={input} 
                onChange={e => setInput(e.target.value)}
              />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="btn btn-lime" style={{ padding: '0.8rem', borderRadius: '12px' }}>
                <Send size={18} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-lime"
        style={{ width: 64, height: 64, borderRadius: '50%', boxShadow: '0 0 30px var(--lime-glow)' }}
      >
        <MessageSquare size={28} />
      </motion.button>
    </div>
  );
}
