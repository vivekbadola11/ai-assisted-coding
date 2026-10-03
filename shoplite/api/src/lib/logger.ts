type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<Level | 'silent', number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};

function threshold(): number {
  const configured = (process.env.LOG_LEVEL ?? 'info') as Level | 'silent';
  return LEVELS[configured] ?? LEVELS.info;
}

function write(level: Level, msg: string, fields: Record<string, unknown> = {}): void {
  if (LEVELS[level] < threshold()) return;
  const line = JSON.stringify({ time: new Date().toISOString(), level, msg, ...fields });
  const stream = level === 'error' || level === 'warn' ? process.stderr : process.stdout;
  stream.write(line + '\n');
}

export const logger = {
  debug: (msg: string, fields?: Record<string, unknown>) => write('debug', msg, fields),
  info: (msg: string, fields?: Record<string, unknown>) => write('info', msg, fields),
  warn: (msg: string, fields?: Record<string, unknown>) => write('warn', msg, fields),
  error: (msg: string, fields?: Record<string, unknown>) => write('error', msg, fields),
};

export type Logger = typeof logger;
