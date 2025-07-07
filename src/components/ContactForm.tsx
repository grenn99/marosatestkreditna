import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ContactFormProps {
  className?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    subject: 'New Contact Form Submission'
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      // Replace with your Google Apps Script web app URL
      const scriptUrl = 'YOUR_GOOGLE_APPS_SCRIPT_URL';
      
      const response = await fetch(scriptUrl, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'no-cors' // Important for cross-origin requests to Google Apps Script
      });
      
      // Since we're using no-cors, we can't actually read the response
      // So we'll just assume success if no error is thrown
      setStatus('success');
      setFormData({
        name: '',
        email: '',
        message: '',
        subject: 'New Contact Form Submission'
      });
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
      setErrorMessage(t('contact.errorSubmitting', 'There was an error submitting the form. Please try again.'));
    }
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
      <h2 className="text-2xl font-semibold mb-4">{t('contact.title', 'Contact Us')}</h2>
      
      {status === 'success' ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {t('contact.successMessage', 'Your message has been sent successfully! We will get back to you soon.')}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
              {t('contact.name', 'Name')}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
              placeholder={t('contact.namePlaceholder', 'Your name')}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              {t('contact.email', 'Email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
              placeholder={t('contact.emailPlaceholder', 'Your email address')}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
              {t('contact.message', 'Message')}
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
              placeholder={t('contact.messagePlaceholder', 'Your message')}
            />
          </div>
          
          {status === 'error' && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errorMessage}
            </div>
          )}
          
          <button
            type="submit"
            disabled={status === 'submitting'}
            className={`w-full bg-brown-600 text-white py-2 px-4 rounded-md hover:bg-brown-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-500 ${
              status === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {status === 'submitting' 
              ? t('contact.sending', 'Sending...') 
              : t('contact.send', 'Send Message')}
          </button>
        </form>
      )}
    </div>
  );
};

export default ContactForm;
