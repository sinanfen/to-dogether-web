// Comprehensive API Types for To-Dogether App
export interface User {
  id: number
  username: string
  colorCode?: string
  avatar?: string
  createdAt: string
  updatedAt: string
  partnerId?: number
  partner?: Partner
  settings?: UserSettings
}

export interface Partner {
  id: number
  username: string
  colorCode?: string
  avatar?: string
  createdAt: string
  updatedAt: string
  isConnected: boolean
  connectionDate?: string
}

export interface UserSettings {
  notifications: boolean
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
}

export interface TodoList {
  id: number
  title: string
  description?: string
  ownerId: number
  createdAt: string
  updatedAt: string
  items?: TodoItem[]
  // Frontend computed fields
  colorCode?: string
  isShared?: boolean
  sharedWith?: number[]
  itemsCount?: number
  completedItemsCount?: number
  completionPercentage?: number
  priority?: 'low' | 'medium' | 'high'
  category?: string
  dueDate?: string
  lastActivity?: string
  createdBy?: User
}

export interface TodoItem {
  id: number
  title: string
  description?: string
  status: number // 0=pending, 1=completed
  severity: number // 0=low, 1=medium, 2=high
  order: number
  createdAt: string
  updatedAt: string
  // Frontend computed fields
  isCompleted?: boolean
  priority?: 'low' | 'medium' | 'high'
  assignedTo?: number
  assignedUser?: User
  dueDate?: string
  completedAt?: string
  completedBy?: number
  completedUser?: User
  tags?: string[]
  attachments?: Attachment[]
  comments?: Comment[]
  todoListId?: number
}

export interface Attachment {
  id: number
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  uploadedBy: number
  uploadedAt: string
}

export interface Comment {
  id: number
  content: string
  userId: number
  user: User
  createdAt: string
  updatedAt: string
}

export interface Activity {
  id: number
  type: 'list_created' | 'list_updated' | 'item_added' | 'item_completed' | 'item_assigned' | 'partner_connected'
  description: string
  userId: number
  user: User
  targetType: 'list' | 'item' | 'partner'
  targetId: number
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface DashboardStats {
  totalTasks: number
  completedToday: number
  pendingTasks: number
  highPriorityTasks: number
  myTasks: number
  partnerTasks: number
  partnerUsername: string
  // Frontend computed fields (optional)
  totalLists?: number
  completedLists?: number
  totalItems?: number
  completedItems?: number
  completionRate?: number
  activeStreakDays?: number
  thisWeekCompleted?: number
  thisMonthCompleted?: number
}

export interface PartnerOverview {
  id: number
  username: string
  colorCode: string
  createdAt: string
  todoLists: TodoList[]
  // Frontend computed fields (optional)
  partner?: Partner
  sharedLists?: TodoList[]
  recentActivities?: Activity[]
  stats?: DashboardStats
  collaborationStats?: {
    sharedListsCount: number
    collaborativeItemsCount: number
    lastCollaboration: string
  }
}

// Request/Response Types
export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  colorCode?: string
  inviteToken?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user?: User // Optional, backend may not send this
  userId?: number // Backend sends this
  username?: string // Backend sends this
  inviteToken?: string
}

export interface InviteRequest {
  partnerId: number
}

export interface AcceptInviteRequest {
  inviteToken: string
}

export interface CreateTodoListRequest {
  title: string
  description?: string
  colorCode: string
  priority: 'low' | 'medium' | 'high'
  category?: string
  dueDate?: string
  isShared?: boolean
  initialItems?: string[]
}

export interface UpdateTodoListRequest extends Partial<CreateTodoListRequest> {
  id: number
}

export interface CreateTodoItemRequest {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  assignedTo?: number
  dueDate?: string
  tags?: string[]
}

export interface UpdateTodoItemRequest extends Partial<CreateTodoItemRequest> {
  id: number
  isCompleted?: boolean
}

export interface UpdateUserProfileRequest {
  username?: string
  colorCode?: string
  avatar?: string
  settings?: Partial<UserSettings>
}

// Enums
export enum TodoItemStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress', 
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TodoListCategory {
  PERSONAL = 'personal',
  WORK = 'work',
  SHOPPING = 'shopping',
  HOUSEHOLD = 'household',
  TRAVEL = 'travel',
  HEALTH = 'health',
  OTHER = 'other'
}

export enum NotificationType {
  ITEM_ASSIGNED = 'item_assigned',
  ITEM_COMPLETED = 'item_completed',
  LIST_SHARED = 'list_shared',
  PARTNER_CONNECTED = 'partner_connected',
  REMINDER = 'reminder'
}

// API Response wrappers
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  success: boolean
} 