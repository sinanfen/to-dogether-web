import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User,
  TodoList,
  TodoItem,
  CreateTodoListRequest,
  UpdateTodoListRequest,
  CreateTodoItemRequest,
  UpdateTodoItemRequest,
  UpdateUserProfileRequest,
  DashboardStats,
  PartnerOverview,
  RecentActivitiesResponse,
  AcceptInviteRequest
} from '@/types/api'

// API URL'ini dinamik olarak belirle
const getApiBaseUrl = () => {
  // Eğer environment variable varsa onu kullan
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // Browser'da çalışıyorsa ve localhost'taysa development API'sini kullan
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'https://localhost:54696'
    }
  }
  
  // Production API'sini kullan
  return 'https://to-dogether-api.sinanfen.me'
}

const API_BASE_URL = getApiBaseUrl()

class ApiClient {
  private token: string | null = null

  constructor() {
    // Load token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken')
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        // Try to get error message from response body
        let errorMessage = `API Error: ${response.status} - ${response.statusText}`
        try {
          const errorData = await response.json()
          if (errorData.message) {
            errorMessage = errorData.message
          } else if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch {
          // If we can't parse the error response, use the default message
        }
        throw new Error(errorMessage)
      }

      // Check if response has content (204 No Content has no body)
      const contentType = response.headers.get('content-type')
      if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
        return {} as T
      }

      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Sunucuya bağlanılamadı. Backend çalışıyor mu kontrol edin.')
      }
      throw error
    }
  }

  // Auth Methods
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    this.setToken(response.accessToken)
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', response.refreshToken)
    }
    
    return response
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    this.setToken(response.accessToken)
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', response.refreshToken)
    }
    
    return response
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/users/me')
  }

  async updateUserProfile(data: UpdateUserProfileRequest): Promise<User> {
    return this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async logout(): Promise<void> {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null
    
    if (refreshToken) {
      try {
        await this.request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        })
      } catch {
        // Logout API call failed, but we'll still clear the token
      }
    }
    
    this.clearToken()
  }

  // Dashboard Methods
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard/stats')
  }

  async getRecentActivities(limit: number = 10): Promise<RecentActivitiesResponse> {
    return this.request<RecentActivitiesResponse>(`/activities/recent?limit=${limit}`)
  }

  // Partner Methods
  async getPartnerOverview(): Promise<PartnerOverview | { message: string; inviteToken: string }> {
    return this.request<PartnerOverview | { message: string; inviteToken: string }>('/partner/overview')
  }

  async acceptPartnerInvite(data: AcceptInviteRequest): Promise<User> {
    return this.request<User>('/partner/accept-invite', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async generateInviteCode(): Promise<{ inviteToken: string }> {
    return this.request<{ inviteToken: string }>('/partner/generate-invite', {
      method: 'POST',
    })
  }

  async getCoupleInviteToken(): Promise<{ inviteToken: string }> {
    return this.request<{ inviteToken: string }>('/couple/invite-token')
  }

  // Todo List Methods
  async getTodoLists(): Promise<TodoList[]> {
    return this.request<TodoList[]>('/todolists')
  }

  async getPartnerTodoLists(): Promise<TodoList[]> {
    return this.request<TodoList[]>('/todolists/partner')
  }

  async findTodoList(id: number): Promise<TodoList | null> {
    // Backend'de tek todo list getiren endpoint olmadığı için
    // önce tüm listeleri getirip ID'ye göre buluyoruz
    const [myLists, partnerLists] = await Promise.all([
      this.getTodoLists(),
      this.getPartnerTodoLists()
    ])
    
    const allLists = [...myLists, ...partnerLists]
    return allLists.find(list => list.id === id) || null
  }

  async createTodoList(data: CreateTodoListRequest): Promise<TodoList> {
    return this.request<TodoList>('/todolists', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTodoList(data: UpdateTodoListRequest): Promise<TodoList> {
    return this.request<TodoList>(`/todolists/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTodoList(id: number): Promise<void> {
    return this.request<void>(`/todolists/${id}`, {
      method: 'DELETE',
    })
  }

  // Todo Item Methods
  async getTodoItems(listId: number): Promise<TodoItem[]> {
    return this.request<TodoItem[]>(`/todolists/${listId}/items`)
  }

  async createTodoItem(listId: number, data: CreateTodoItemRequest): Promise<TodoItem> {
    return this.request<TodoItem>(`/todolists/${listId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTodoItem(listId: number, data: UpdateTodoItemRequest): Promise<TodoItem> {
    return this.request<TodoItem>(`/todolists/${listId}/items/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTodoItem(listId: number, itemId: number): Promise<void> {
    return this.request<void>(`/todolists/${listId}/items/${itemId}`, {
      method: 'DELETE',
    })
  }

  async toggleTodoItem(listId: number, itemId: number): Promise<TodoItem> {
    // Backend'de toggle endpoint'i olmadığı için
    // önce item'ları getirip o item'ı bulup status'unu değiştiriyoruz
    const items = await this.getTodoItems(listId)
    const item = items.find(i => i.id === itemId)
    
    if (!item) {
      throw new Error('Todo item not found')
    }
    
    const newStatus = item.status === 0 ? 1 : 0 // 0: Pending, 1: Done
    
    return this.request<TodoItem>(`/todolists/${listId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...item,
        status: newStatus
      }),
    })
  }
}

export const api = new ApiClient() 