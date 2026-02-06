import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError, AxiosProgressEvent, AxiosRequestConfig } from 'axios'
import toast from 'react-hot-toast'

class ApiService {
  private axios: AxiosInstance

  constructor() {
    this.axios = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.axios.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth-storage')
        if (token) {
          const authData = JSON.parse(token)
          config.headers = { ...(config.headers as any), Authorization: `Bearer ${authData.state.accessToken}` } as any
        }
        return config
      },
      (error: AxiosError) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.axios.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const token = localStorage.getItem('auth-storage')
            if (token) {
              const authData = JSON.parse(token)
              const response = await this.axios.post('/auth/refresh', {
                refreshToken: authData.state.refreshToken,
              })

              const newAccessToken = response.data.accessToken
              authData.state.accessToken = newAccessToken
              localStorage.setItem('auth-storage', JSON.stringify(authData))

              originalRequest.headers = { ...(originalRequest.headers as any), Authorization: `Bearer ${newAccessToken}` } as any

              return this.axios(originalRequest)
            }
          } catch (refreshError) {
            localStorage.removeItem('auth-storage')
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }

        // Handle other errors
        if (error.response) {
          const status = error.response.status
          const message = (error.response.data as any)?.message || 'Ocorreu um erro'

          switch (status) {
            case 400:
              toast.error(`Erro de validação: ${message}`)
              break
            case 401:
              toast.error('Não autorizado. Faça login novamente.')
              break
            case 403:
              toast.error('Acesso negado.')
              break
            case 404:
              toast.error('Recurso não encontrado.')
              break
            case 500:
              toast.error('Erro interno do servidor.')
              break
            default:
              toast.error(message)
          }
        } else if (error.request) {
          toast.error('Erro de conexão. Verifique sua internet.')
        } else {
          toast.error('Erro ao processar requisição.')
        }

        return Promise.reject(error)
      }
    )
  }

  // HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axios.get<T>(url, config)
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axios.post<T>(url, data, config)
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axios.put<T>(url, data, config)
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axios.patch<T>(url, data, config)
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axios.delete<T>(url, config)
  }

  // File upload
  async upload<T>(url: string, file: File, onProgress?: (progressEvent: AxiosProgressEvent) => void): Promise<AxiosResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    return this.axios.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    })
  }

  // Get the axios instance for advanced usage
  get instance(): AxiosInstance {
    return this.axios
  }
}

export const api = new ApiService()
export default api
