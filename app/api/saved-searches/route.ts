import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const FREQUENCIES = ['never', 'daily', 'weekly', 'monthly'] as const

/** Cap so a saved search can't be used to store arbitrary payloads. */
const MAX_CRITERIA_BYTES = 4000
const MAX_NAME_LENGTH = 100
const MAX_SAVED_SEARCHES = 50

// GET - list the current user's saved searches
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const savedSearches = await prisma.savedSearch.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    // criteria is stored as a JSON string; hand callers a parsed object.
    return NextResponse.json({
      savedSearches: savedSearches.map((s) => ({
        ...s,
        criteria: safeParse(s.criteria),
      })),
    })
  } catch (error) {
    console.error('Error fetching saved searches:', error)
    return NextResponse.json({ error: 'Failed to fetch saved searches' }, { status: 500 })
  }
}

// POST - create a saved search
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, criteria, frequency } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'A name for this search is required' }, { status: 400 })
    }
    if (name.length > MAX_NAME_LENGTH) {
      return NextResponse.json({ error: `Name must be ${MAX_NAME_LENGTH} characters or fewer` }, { status: 400 })
    }
    if (!criteria || typeof criteria !== 'object') {
      return NextResponse.json({ error: 'Search criteria are required' }, { status: 400 })
    }

    const freq = FREQUENCIES.includes(frequency) ? frequency : 'never'

    const serialized = JSON.stringify(criteria)
    if (serialized.length > MAX_CRITERIA_BYTES) {
      return NextResponse.json({ error: 'Search criteria are too large' }, { status: 400 })
    }

    const existing = await prisma.savedSearch.count({ where: { userId: session.user.id } })
    if (existing >= MAX_SAVED_SEARCHES) {
      return NextResponse.json(
        { error: `You can save up to ${MAX_SAVED_SEARCHES} searches. Delete one to add another.` },
        { status: 403 }
      )
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        criteria: serialized,
        frequency: freq,
      },
    })

    return NextResponse.json(
      { savedSearch: { ...savedSearch, criteria: safeParse(savedSearch.criteria) } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating saved search:', error)
    return NextResponse.json({ error: 'Failed to save search' }, { status: 500 })
  }
}

// DELETE - remove a saved search (?id=...)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Saved search id is required' }, { status: 400 })
    }

    // Scope the delete to the owner so one user cannot delete another's search.
    const result = await prisma.savedSearch.deleteMany({
      where: { id, userId: session.user.id },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Saved search not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Saved search deleted' })
  } catch (error) {
    console.error('Error deleting saved search:', error)
    return NextResponse.json({ error: 'Failed to delete saved search' }, { status: 500 })
  }
}

function safeParse(json: string): unknown {
  try {
    return JSON.parse(json)
  } catch {
    return {}
  }
}
