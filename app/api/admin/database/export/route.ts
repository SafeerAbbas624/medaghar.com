import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit-log'
import { getClientIp } from '@/lib/rate-limiter'
import { Parser } from 'json2csv'

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession()

    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')
    const format = searchParams.get('format') || 'csv'

    if (!table) {
      return NextResponse.json({ error: 'Table name required' }, { status: 400 })
    }

    // Get the model from Prisma
    const model = (prisma as any)[table.charAt(0).toLowerCase() + table.slice(1)]
    
    if (!model) {
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 })
    }

    // Fetch all records
    const records = await model.findMany()

    if (records.length === 0) {
      return NextResponse.json({ error: 'No data to export' }, { status: 400 })
    }

    // Convert to CSV
    const parser = new Parser()
    const csv = parser.parse(records)

    // Log the action
    await createAuditLog({
      adminUserId: session.id,
      action: 'export_data',
      resource: table,
      details: { recordCount: records.length, format },
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
      status: 'success',
    })

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${table}_export_${Date.now()}.csv"`,
      },
    })
  } catch (error: any) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

