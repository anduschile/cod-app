import { redirect } from 'next/navigation'

export default function Home() {
  // Redirigir la raíz directamente al Dashboard de Analytics
  redirect('/dashboard')
}
