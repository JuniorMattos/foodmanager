import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, auth, AuthUser } from '@/lib/supabase'
import { User, AuthResponse, LoginRequest } from '@/types'
import toast from 'react-hot-toast'

interface SupabaseAuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  refreshAccessToken: () => Promise<void>
  loginWithSupabase: (email: string, password: string) => Promise<void>
}

export const useSupabaseAuthStore = create<SupabaseAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true })
        try {
          // Fallback para API backend se Supabase não tiver o usuário
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          })

          if (!response.ok) {
            throw new Error('Login failed')
          }

          const data: AuthResponse = await response.json()
          
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          toast.success(`Bem-vindo, ${data.user.name}!`)
        } catch (error) {
          set({ isLoading: false })
          toast.error('Erro ao fazer login')
          throw error
        }
      },

      loginWithSupabase: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          // Tentar login com Supabase
          const { user, session } = await auth.signIn(email, password)
          
          if (!user || !session) {
            throw new Error('Login failed')
          }

          // Converter usuário Supabase para formato da aplicação
          const appUser: User = {
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.name || user.email!,
            role: (user.user_metadata?.role || 'USER') as any,
            tenant_id: user.user_metadata?.tenant_id || '',
            is_active: true,
            created_at: user.created_at,
            updated_at: user.updated_at
          }

          set({
            user: appUser,
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            isAuthenticated: true,
            isLoading: false,
          })

          toast.success(`Bem-vindo, ${appUser.name}!`)
        } catch (error) {
          set({ isLoading: false })
          toast.error('Erro ao fazer login com Supabase')
          throw error
        }
      },

      logout: () => {
        // Logout do Supabase se estiver autenticado
        auth.signOut().catch(console.error)
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
        
        toast.success('Logout realizado com sucesso')
      },

      checkAuth: async () => {
        const { accessToken } = get()
        
        if (!accessToken) {
          set({ isAuthenticated: false, user: null })
          return
        }

        try {
          // Verificar token com backend
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          })

          if (response.ok) {
            const user = await response.json()
            set({ user, isAuthenticated: true })
          } else {
            // Token inválido, tentar refresh
            await get().refreshAccessToken()
          }
        } catch (error) {
          set({ isAuthenticated: false, user: null, accessToken: null, refreshToken: null })
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get()
        
        if (!refreshToken) {
          get().logout()
          return
        }

        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          })

          if (response.ok) {
            const data: AuthResponse = await response.json()
            set({
              user: data.user,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              isAuthenticated: true,
            })
          } else {
            get().logout()
          }
        } catch (error) {
          get().logout()
        }
      },
    }),
    {
      name: 'supabase-auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
