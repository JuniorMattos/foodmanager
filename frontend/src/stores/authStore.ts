import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/services/api'
import { User, AuthResponse, LoginRequest } from '@/types'
import toast from 'react-hot-toast'

interface AuthState {
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
}

export const useAuthStore = create<AuthState>()(
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
          const response = await api.post<AuthResponse>('/auth/login', credentials)
          const { user, accessToken, refreshToken } = response.data

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          toast.success('Login realizado com sucesso!')
        } catch (error: any) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
        toast.success('Logout realizado com sucesso!')
      },

      checkAuth: async () => {
        const { accessToken } = get()
        if (!accessToken) {
          set({ isAuthenticated: false })
          return
        }

        try {
          const response = await api.get<User>('/auth/me')
          set({
            user: response.data,
            isAuthenticated: true,
          })
        } catch (error) {
          // Token might be expired, try to refresh
          await get().refreshAccessToken()
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get()
        if (!refreshToken) {
          set({ isAuthenticated: false })
          return
        }

        try {
          const response = await api.post<AuthResponse>('/auth/refresh', {
            refreshToken,
          })

          const { user, accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data

          set({
            user,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            isAuthenticated: true,
          })
        } catch (error) {
          // Refresh token failed, logout
          get().logout()
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
