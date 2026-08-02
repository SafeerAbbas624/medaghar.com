import { prisma } from '@/lib/prisma'
import { UAParser } from 'ua-parser-js'

interface PageViewData {
  page: string
  userId?: string
  sessionId: string
  ipAddress?: string
  userAgent?: string
  referrer?: string
  duration?: number
}

export async function trackPageView(data: PageViewData) {
  try {
    const parser = new UAParser(data.userAgent)
    const result = parser.getResult()

    // Get geolocation from IP (you can integrate with a service like ipapi.co or ip-api.com)
    let geoData = null
    if (data.ipAddress) {
      try {
        const response = await fetch(`http://ip-api.com/json/${data.ipAddress}`)
        if (response.ok) {
          geoData = await response.json()
        }
      } catch (error) {
        console.error('Geolocation error:', error)
      }
    }

    await prisma.pageView.create({
      data: {
        page: data.page,
        userId: data.userId,
        sessionId: data.sessionId,
        ipAddress: data.ipAddress,
        country: geoData?.country,
        city: geoData?.city,
        region: geoData?.regionName,
        latitude: geoData?.lat,
        longitude: geoData?.lon,
        userAgent: data.userAgent,
        device: result.device.type || 'desktop',
        browser: result.browser.name,
        os: result.os.name,
        referrer: data.referrer,
        duration: data.duration,
      },
    })
  } catch (error) {
    console.error('Error tracking page view:', error)
  }
}

export async function trackLoginAttempt(
  userId: string,
  email: string,
  status: 'success' | 'failed',
  ipAddress?: string,
  userAgent?: string,
  failureReason?: string
) {
  try {
    const parser = new UAParser(userAgent)
    const result = parser.getResult()

    // Get location from IP
    let location = null
    if (ipAddress) {
      try {
        const response = await fetch(`http://ip-api.com/json/${ipAddress}`)
        if (response.ok) {
          const geoData = await response.json()
          location = `${geoData.city}, ${geoData.country}`
        }
      } catch (error) {
        console.error('Geolocation error:', error)
      }
    }

    await prisma.loginHistory.create({
      data: {
        userId,
        email,
        ipAddress,
        device: result.device.type || 'desktop',
        browser: result.browser.name,
        os: result.os.name,
        location,
        status,
        failureReason,
      },
    })
  } catch (error) {
    console.error('Error tracking login attempt:', error)
  }
}

export async function getTrafficAnalytics(
  startDate: Date,
  endDate: Date,
  page?: string
) {
  const whereClause: any = {
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
  }

  if (page) {
    whereClause.page = page
  }

  const [totalViews, uniqueVisitors, pageViews, avgDuration, geoData] = await Promise.all([
    // Total page views
    prisma.pageView.count({ where: whereClause }),

    // Unique visitors (by sessionId)
    prisma.pageView.findMany({
      where: whereClause,
      select: { sessionId: true },
      distinct: ['sessionId'],
    }),

    // Page-by-page breakdown
    prisma.pageView.groupBy({
      by: ['page'],
      where: whereClause,
      _count: { page: true },
      _avg: { duration: true },
    }),

    // Average duration
    prisma.pageView.aggregate({
      where: whereClause,
      _avg: { duration: true },
    }),

    // Geographic data - filter out null values
    prisma.pageView.groupBy({
      by: ['country', 'city'],
      where: {
        ...whereClause,
        country: { not: null },
        city: { not: null },
      },
      _count: { country: true },
    }),
  ])

  return {
    totalViews,
    uniqueVisitors: uniqueVisitors.length,
    pageViews: pageViews.map((pv) => ({
      page: pv.page,
      views: pv._count.page,
      avgDuration: pv._avg.duration,
    })),
    avgDuration: avgDuration._avg.duration,
    geoData: geoData.map((geo) => ({
      country: geo.country,
      city: geo.city,
      count: geo._count.country,
    })),
  }
}

