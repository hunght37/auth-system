'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
})

const resetSchema = yup.object().shape({
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
})

type RequestFormData = yup.InferType<typeof schema>
type ResetFormData = yup.InferType<typeof resetSchema>

export default function ResetPasswordPage() {
  const [status, setStatus] = useState<'request' | 'reset' | 'success'>('request')
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const {
    register: registerRequest,
    handleSubmit: handleRequestSubmit,
    formState: { errors: requestErrors, isSubmitting: isRequestSubmitting },
  } = useForm<RequestFormData>({
    resolver: yupResolver(schema),
  })

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors, isSubmitting: isResetSubmitting },
  } = useForm<ResetFormData>({
    resolver: yupResolver(resetSchema),
  })

  const onRequestSubmit = async (data: RequestFormData) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setStatus('success')
      } else {
        const error = await response.json()
        setError(error.message)
      }
    } catch (error) {
      setError('Failed to send reset email')
    }
  }

  const onResetSubmit = async (data: ResetFormData) => {
    if (!token) {
      setError('Invalid reset token')
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      })

      if (response.ok) {
        setStatus('success')
      } else {
        const error = await response.json()
        setError(error.message)
      }
    } catch (error) {
      setError('Failed to reset password')
    }
  }

  // Show reset form if token is present in URL
  useState(() => {
    if (token) {
      setStatus('reset')
    }
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {status === 'request' && (
          <>
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                Reset your password
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
            </div>

            <form onSubmit={handleRequestSubmit(onRequestSubmit)} className="mt-8 space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-200">{error}</p>
                </div>
              )}

              <div>
                <Input
                  {...registerRequest('email')}
                  type="email"
                  placeholder="Email address"
                  error={!!requestErrors.email}
                  helperText={requestErrors.email?.message}
                />
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isRequestSubmitting}
                >
                  {isRequestSubmitting
                    ? 'Sending reset link...'
                    : 'Send reset link'}
                </Button>
              </div>
            </form>
          </>
        )}

        {status === 'reset' && (
          <>
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                Create new password
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                Please enter your new password below.
              </p>
            </div>

            <form onSubmit={handleResetSubmit(onResetSubmit)} className="mt-8 space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-200">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Input
                    {...registerReset('password')}
                    type="password"
                    placeholder="New password"
                    error={!!resetErrors.password}
                    helperText={resetErrors.password?.message}
                  />
                </div>
                <div>
                  <Input
                    {...registerReset('confirmPassword')}
                    type="password"
                    placeholder="Confirm new password"
                    error={!!resetErrors.confirmPassword}
                    helperText={resetErrors.confirmPassword?.message}
                  />
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isResetSubmitting}
                >
                  {isResetSubmitting ? 'Updating password...' : 'Update password'}
                </Button>
              </div>
            </form>
          </>
        )}

        {status === 'success' && (
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {token ? 'Password updated!' : 'Check your email'}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {token
                ? 'Your password has been successfully updated.'
                : 'We have sent you an email with instructions to reset your password.'}
            </p>
            <div className="mt-4">
              <Button onClick={() => router.push('/login')}>
                Back to Login
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
