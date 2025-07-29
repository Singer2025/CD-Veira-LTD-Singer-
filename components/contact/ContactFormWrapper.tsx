'use client'

import dynamic from 'next/dynamic'
import ContactFormSkeleton from './ContactFormSkeleton'

const ContactForm = dynamic(() => import('./ContactForm'), {
  loading: () => <ContactFormSkeleton />,
  ssr: false,
})

export default function ContactFormWrapper() {
  return <ContactForm />
}