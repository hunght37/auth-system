import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  // Redirect authenticated users to dashboard, unauthenticated users to login
  if (session) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
