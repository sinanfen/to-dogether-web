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
  inviteToken?: string
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
  isShared: boolean
  colorCode: string
  createdAt: string
  updatedAt: string
  items?: TodoItem[]
  // Frontend computed fields
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
  userId: number
  username: string
  userColorCode: string
  activityType: number // Backend enum: 0=Created, 1=Updated, 2=Deleted, 3=Completed, 4=Reopened, 5=ItemAdded, 6=ItemUpdated, 7=ItemDeleted, 8=ItemCompleted, 9=ItemReopened
  entityType: number // Backend enum: 0=TodoList, 1=TodoItem
  entityId: number
  entityTitle: string
  message: string
  createdAt: string
}

// Enum mappings for backend compatibility (exact match with C# backend)
export enum ActivityType {
  Created = 0,
  Updated = 1,
  Deleted = 2,
  Completed = 3,
  Reopened = 4,
  ItemAdded = 5,
  ItemUpdated = 6,
  ItemDeleted = 7,
  ItemCompleted = 8,
  ItemReopened = 9
}

export enum EntityType {
  TodoList = 0,
  TodoItem = 1
}

export interface RecentActivitiesResponse {
  activities: Activity[]
  totalCount: number
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
  isShared: boolean
  colorCode?: string
}

export interface UpdateTodoListRequest extends Partial<CreateTodoListRequest> {
  id: number
}

export interface CreateTodoItemRequest {
  title: string
  description?: string
  severity: number // 0=low, 1=medium, 2=high (backend uses severity not priority)
}

export interface UpdateTodoItemRequest {
  id: number
  title?: string
  description?: string
  status?: number // 0=pending, 1=done
  severity?: number // 0=low, 1=medium, 2=high
  order?: number
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