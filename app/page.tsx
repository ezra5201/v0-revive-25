import { redirect } from 'next/navigation'

export default function HomePage() {
  // Use Next.js server-side redirect instead of client-side
  redirect('/contact-log')
}
