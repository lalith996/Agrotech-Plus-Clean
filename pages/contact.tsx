
import { useState } from 'react';
import axios from 'axios';

const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.post('/api/contact', {
        name,
        email,
        subject,
        message,
      });

      setStatus({ type: 'success', message: response.data.message });
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
      setStatus({ type: 'error', message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Contact Us</h1>
      <p>Have a question or feedback? Fill out the form below to get in touch with our team.</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          type="text" 
          placeholder="Your Name" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          required 
        />
        <input 
          type="email" 
          placeholder="Your Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="text" 
          placeholder="Subject" 
          value={subject} 
          onChange={e => setSubject(e.target.value)} 
          required 
        />
        <textarea 
          placeholder="Your Message" 
          value={message} 
          onChange={e => setMessage(e.target.value)} 
          rows={6} 
          required 
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      {status.message && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '8px', background: status.type === 'success' ? '#d4edda' : '#f8d7da' }}>
          <p style={{ color: status.type === 'success' ? '#155724' : '#721c24', margin: 0 }}>
            {status.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default ContactPage;
