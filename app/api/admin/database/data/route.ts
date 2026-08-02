import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { prisma } from '@/lib/prisma'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit-log'
import { getClientIp } from '@/lib/rate-limiter'

const ITEMS_PER_PAGE = 50

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession()

    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')
    const page = parseInt(searchParams.get('page') || '1')
    const search = searchParams.get('search') || ''

    if (!table) {
      return NextResponse.json({ error: 'Table name required' }, { status: 400 })
    }

    // Get the model from Prisma
    const model = (prisma as any)[table.charAt(0).toLowerCase() + table.slice(1)]
    
    if (!model) {
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 })
    }

    // Build where clause for search
    const whereClause: any = {}
    
    // Get total count
    const total = await model.count({ where: whereClause })
    
    // Get paginated data (try to order by createdAt if it exists, otherwise by id)
    let records
    try {
      records = await model.findMany({
        where: whereClause,
        skip: (page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
        orderBy: { createdAt: 'desc' },
      })
    } catch (error) {
      // If createdAt doesn't exist, try ordering by id
      records = await model.findMany({
        where: whereClause,
        skip: (page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
      })
    }

    // Get column names from first record
    const columns = records.length > 0 ? Object.keys(records[0]) : []

    return NextResponse.json({
      records,
      columns,
      total,
      page,
      totalPages: Math.ceil(total / ITEMS_PER_PAGE),
    })
  } catch (error: any) {
    console.error('Database data API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession()

    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { table, id } = body

    if (!table || !id) {
      return NextResponse.json({ error: 'Table and ID required' }, { status: 400 })
    }

    // Get the model from Prisma
    const model = (prisma as any)[table.charAt(0).toLowerCase() + table.slice(1)]
    
    if (!model) {
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 })
    }

    // Delete the record
    await model.delete({
      where: { id },
    })

    // Log the action
    await createAuditLog({
      adminUserId: session.id,
      action: AUDIT_ACTIONS.DELETE_RECORD,
      resource: table,
      resourceId: id,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
      status: 'success',
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Database delete API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getAdminSession()

    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { table, id, data } = body

    if (!table || !id || !data) {
      return NextResponse.json({ error: 'Table, ID, and data required' }, { status: 400 })
    }

    // Get the model from Prisma
    const model = (prisma as any)[table.charAt(0).toLowerCase() + table.slice(1)]
    
    if (!model) {
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 })
    }

    // Update the record
    const updated = await model.update({
      where: { id },
      data,
    })

    // Log the action
    await createAuditLog({
      adminUserId: session.id,
      action: AUDIT_ACTIONS.EDIT_RECORD,
      resource: table,
      resourceId: id,
      details: { changes: data },
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
      status: 'success',
    })

    return NextResponse.json({ success: true, record: updated })
  } catch (error: any) {
    console.error('Database update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

