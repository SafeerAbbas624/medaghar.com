import { prisma } from '@/lib/prisma'

interface AuditLogData {
  adminUserId: string
  action: string
  resource: string
  resourceId?: string
  details?: any
  ipAddress?: string
  userAgent?: string
  status: 'success' | 'failure'
}

export async function createAuditLog(data: AuditLogData) {
  try {
    await prisma.auditLog.create({
      data: {
        adminUserId: data.adminUserId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        details: data.details ? JSON.stringify(data.details) : null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        status: data.status,
      },
    })
  } catch (error) {
    console.error('Error creating audit log:', error)
  }
}

export async function getAuditLogs(
  filters?: {
    adminUserId?: string
    action?: string
    resource?: string
    startDate?: Date
    endDate?: Date
    status?: string
  },
  page: number = 1,
  limit: number = 50
) {
  const whereClause: any = {}

  if (filters?.adminUserId) {
    whereClause.adminUserId = filters.adminUserId
  }

  if (filters?.action) {
    whereClause.action = filters.action
  }

  if (filters?.resource) {
    whereClause.resource = filters.resource
  }

  if (filters?.status) {
    whereClause.status = filters.status
  }

  if (filters?.startDate || filters?.endDate) {
    whereClause.createdAt = {}
    if (filters.startDate) {
      whereClause.createdAt.gte = filters.startDate
    }
    if (filters.endDate) {
      whereClause.createdAt.lte = filters.endDate
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: whereClause,
      include: {
        adminUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where: whereClause }),
  ])

  return {
    logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

// Common audit actions
export const AUDIT_ACTIONS = {
  // Authentication
  LOGIN: 'admin_login',
  LOGOUT: 'admin_logout',
  LOGIN_FAILED: 'admin_login_failed',

  // User Management
  CREATE_USER: 'create_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  SUSPEND_USER: 'suspend_user',
  ACTIVATE_USER: 'activate_user',

  // Admin User Management
  CREATE_ADMIN: 'create_admin_user',
  UPDATE_ADMIN: 'update_admin_user',
  DELETE_ADMIN: 'delete_admin_user',
  CHANGE_ADMIN_ROLE: 'change_admin_role',

  // Database Management
  VIEW_TABLE: 'view_database_table',
  EDIT_RECORD: 'edit_database_record',
  DELETE_RECORD: 'delete_database_record',
  CREATE_RECORD: 'create_database_record',
  EXPORT_DATA: 'export_database_data',
  IMPORT_DATA: 'import_database_data',

  // Email Management
  SEND_EMAIL: 'send_email',
  DELETE_EMAIL: 'delete_email',

  // Settings
  UPDATE_SETTINGS: 'update_settings',
} as const

