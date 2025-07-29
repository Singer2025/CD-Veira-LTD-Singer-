'use client'

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation'; // For page refresh

export default function ContactForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    const formPayload = new FormData();
    for (const key in formData) {
      formPayload.append(key, formData[key as keyof typeof formData]);
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formPayload,
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: result.message || 'Message sent successfully!' });
        // Clear form
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        // Show message, then refresh after a delay
        setTimeout(() => {
          router.refresh(); // Refreshes server components and re-fetches initial data
          // Alternatively, window.location.reload(); for a full hard refresh
        }, 3000); // Refresh after 3 seconds
      } else {
        setSubmitStatus({ type: 'error', message: result.message || 'Failed to send message. Please try again.' });
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitStatus({ type: 'error', message: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
      <h2 className="text-2xl font-bold text-red-800 mb-6">Send Us a Message</h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
            <Input id="name" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required className="border-gray-300 focus:border-red-500 focus:ring-red-500" />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
            <Input id="email" name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required className="border-gray-300 focus:border-red-500 focus:ring-red-500" />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</label>
          <Input id="phone" name="phone" placeholder="(123) 456-7890" value={formData.phone} onChange={handleChange} className="border-gray-300 focus:border-red-500 focus:ring-red-500" />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject</label>
          <Input id="subject" name="subject" placeholder="How can we help you?" value={formData.subject} onChange={handleChange} required className="border-gray-300 focus:border-red-500 focus:ring-red-500" />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium text-gray-700">Message</label>
          <Textarea id="message" name="message" placeholder="Please provide details about your inquiry..." value={formData.message} onChange={handleChange} required className="border-gray-300 focus:border-red-500 focus:ring-red-500" rows={5} />
        </div>
        
        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>

        {submitStatus && (
          <div className={`mt-4 p-3 rounded-md text-sm ${submitStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {submitStatus.message}
            {submitStatus.type === 'success' && <p>Refreshing page...</p>}
          </div>
        )}
      </form>
    </div>
  );
}