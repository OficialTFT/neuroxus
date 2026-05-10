export default defineEventHandler(async () => {
  const status = await getConnectionStatus()

  if (!status.connected) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      data: {
        status: 'error',
        db: status.db,
        error: status.error,
        latency: status.latency,
        timestamp: new Date().toISOString(),
      },
    })
  }

  return {
    status: 'ok',
    db: status.db,
    latency: status.latency,
    timestamp: new Date().toISOString(),
  }
})
