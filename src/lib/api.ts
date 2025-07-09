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
  Activity,
  AcceptInviteRequest
} from '@/types/api'

const API_BASE_URL = 'https://localhost:54696'

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
      console.log('API Request:', { url, config })
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', { status: response.status, statusText: response.statusText, body: errorText })
        throw new Error(`API Error: ${response.status} - ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error('Fetch Error:', error)
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
      } catch (error) {
        console.error('Logout API call failed:', error)
      }
    }
    
    this.clearToken()
  }

  // Dashboard Methods
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard/stats')
  }

  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    return this.request<Activity[]>(`/dashboard/activities?limit=${limit}`)
  }

  // Partner Methods
  async getPartnerOverview(): Promise<PartnerOverview> {
    return this.request<PartnerOverview>('/partner/overview')
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

  // Todo List Methods
  async getTodoLists(): Promise<TodoList[]> {
    return this.request<TodoList[]>('/todolists')
  }

  async getPartnerTodoLists(): Promise<TodoList[]> {
    return this.request<TodoList[]>('/todolists/partner')
  }

  async getTodoList(id: number): Promise<TodoList> {
    return this.request<TodoList>(`/todolists/${id}`)
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
    return this.request<TodoItem>(`/todolists/${listId}/items/${itemId}/toggle`, {
      method: 'PATCH',
    })
  }
}

export const api = new ApiClient() 