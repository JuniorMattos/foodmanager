import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useSupabaseAuthStore } from '@/stores/supabaseAuthStore'
import { LoginRequest } from '@/types'
import toast from 'react-hot-toast'

export default function SupabaseLoginPage() {
  const [useSupabaseAuth, setUseSupabaseAuth] = useState(false)
  const login = useSupabaseAuthStore((state) => state.login)
  const loginWithSupabase = useSupabaseAuthStore((state) => state.loginWithSupabase)
  const isLoading = useSupabaseAuthStore((state) => state.isLoading)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginRequest>()

  const onSubmit = async (data: LoginRequest) => {
    try {
      if (useSupabaseAuth) {
        await loginWithSupabase(data.email, data.password)
      } else {
        await login(data)
      }
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            FoodManager Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {useSupabaseAuth ? 'Login com Supabase' : 'Login com Backend API'}
          </p>
        </div>

        {/* Toggle entre Supabase e Backend */}
        <div className="flex justify-center">
          <button
            onClick={() => setUseSupabaseAuth(!useSupabaseAuth)}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            {useSupabaseAuth 
              ? 'Usar Backend API' 
              : 'Usar Supabase Auth'
            }
          </button>
        </div>

        <form id="login-form" className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: 'Email inválido',
                  },
                })}
                type="email"
                autoComplete="email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                {...register('password', {
                  required: 'Senha é obrigatória',
                })}
                type="password"
                autoComplete="current-password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Credenciais de teste */}
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="text-sm font-medium text-gray-700 mb-2">Credenciais de teste:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <button
                type="button"
                onClick={() => {
                  setValue('email', 'admin@burgerexpress.com')
                  setValue('password', 'admin123')
                }}
                className="text-blue-600 hover:text-blue-500"
              >
                Admin: admin@burgerexpress.com / admin123
              </button>
              <br />
              <button
                type="button"
                onClick={() => {
                  setValue('email', 'manager@burgerexpress.com')
                  setValue('password', 'manager123')
                }}
                className="text-blue-600 hover:text-blue-500"
              >
                Manager: manager@burgerexpress.com / manager123
              </button>
              <br />
              <button
                type="button"
                onClick={() => {
                  setValue('email', 'vendor@burgerexpress.com')
                  setValue('password', 'vendor123')
                }}
                className="text-blue-600 hover:text-blue-500"
              >
                Vendor: vendor@burgerexpress.com / vendor123
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              ← Voltar para o cardápio
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
