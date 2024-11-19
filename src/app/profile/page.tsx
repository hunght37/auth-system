'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  image: yup.string().url('Must be a valid URL').nullable(),
})

type ProfileFormData = yup.InferType<typeof schema>

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: session?.user?.name || '',
      image: session?.user?.image || '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        await updateSession({ user: updatedUser })
        setSuccess(true)
        setError(null)
      } else {
        const error = await response.json()
        setError(error.message)
        setSuccess(false)
      }
    } catch (error) {
      setError('Failed to update profile')
      setSuccess(false)
    }
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Profile Settings
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                <p>Update your profile information.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-6">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-md">
                    <p className="text-sm text-red-600 dark:text-red-200">
                      {error}
                    </p>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 dark:bg-green-900/50 p-4 rounded-md">
                    <p className="text-sm text-green-600 dark:text-green-200">
                      Profile updated successfully!
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Name
                    </label>
                    <Input
                      {...register('name')}
                      type="text"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="image"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Profile Image URL
                    </label>
                    <Input
                      {...register('image')}
                      type="url"
                      error={!!errors.image}
                      helperText={errors.image?.message}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Email
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm">
                        {session.user.email}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          fetch('/api/auth/verify-email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: session.user.email }),
                          })
                        }}
                        className="ml-2"
                        disabled={!!session.user.emailVerified}
                      >
                        {session.user.emailVerified
                          ? 'Email verified'
                          : 'Verify email'}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save changes'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
