import { createServer } from 'http'
import { NextRequest, NextResponse } from 'next/server'
import { initSocketServer, getSocketIO } from '@/lib/socket'

// Global HTTP server for WebSocket
let httpServer: ReturnType<typeof createServer> | null = null

export async function GET(req: NextRequest) {
  if (!httpServer) {
    httpServer = createServer()
    initSocketServer(httpServer)

    const PORT = process.env.SOCKET_PORT || 3001
    httpServer.listen(PORT, () => {
      console.log(`Socket.io server running on port ${PORT}`)
    })
  }

  return NextResponse.json({
    status: 'ok',
    message: 'Socket.io server initialized',
    socketPath: '/api/socket',
  })
}

// Export the server for external use
export { httpServer }