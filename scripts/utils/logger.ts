import pino from 'pino'
import path from 'path'
import fs from 'fs'

const logsDir = path.join(process.cwd(), 'scripts', 'logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

export function createLogger(source: string) {
  const date = new Date().toISOString().split('T')[0]
  const logFile = path.join(logsDir, `import-${source}-${date}.log`)

  const streams = [
    { stream: pino.destination(logFile) },
    {
      stream: pino.transport({
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:HH:MM:ss' },
      }),
    },
  ]

  return pino(
    {
      level: 'info',
      base: { source },
    },
    pino.multistream(streams)
  )
}
