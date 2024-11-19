'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }

    fetch('/api/auth/verify-email', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        if (res.ok) {
          setStatus('success')
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {status === 'loading' && (
          <>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Verifying your email
            </h2>
            <div className="mt-4">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Email verified!
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Your email has been successfully verified.
            </p>
            <div className="mt-4">
              <Button onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Verification failed
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              The verification link is invalid or has expired.
            </p>
            <div className="mt-4">
              <Button onClick={() => router.push('/login')}>
                Back to Login
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
