import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit-log'
import { getClientIp } from '@/lib/rate-limiter'
import Papa from 'papaparse'

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession()

    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const table = formData.get('table') as string
    const mode = formData.get('mode') as string || 'append' // append or replace

    if (!file || !table) {
      return NextResponse.json(
        { error: 'File and table name required' },
        { status: 400 }
      )
    }

    // Get the model from Prisma
    const model = (prisma as any)[table.charAt(0).toLowerCase() + table.slice(1)]
    
    if (!model) {
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 })
    }

    // Read CSV file
    const text = await file.text()
    
    // Parse CSV
    const parseResult = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    })

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: 'CSV parsing error', details: parseResult.errors },
        { status: 400 }
      )
    }

    const records = parseResult.data

    if (records.length === 0) {
      return NextResponse.json({ error: 'No records found in CSV' }, { status: 400 })
    }

    // If replace mode, delete existing records
    if (mode === 'replace') {
      await model.deleteMany()
    }

    // Import records
    let successCount = 0
    let errorCount = 0
    const errors: any[] = []

    for (const record of records) {
      try {
        // Remove id field if present (let database generate it)
        const { id, createdAt, updatedAt, ...data } = record as any
        
        await model.create({ data })
        successCount++
      } catch (error: any) {
        errorCount++
        errors.push({
          record,
          error: error.message,
        })
      }
    }

    // Log the action
    await createAuditLog({
      adminUserId: session.id,
      action: 'import_data',
      resource: table,
      details: {
        mode,
        totalRecords: records.length,
        successCount,
        errorCount,
      },
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
      status: errorCount > 0 ? 'failure' : 'success',
    })

    return NextResponse.json({
      success: true,
      totalRecords: records.length,
      successCount,
      errorCount,
      errors: errors.slice(0, 10), // Return first 10 errors
    })
  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

