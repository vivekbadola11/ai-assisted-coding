/**
 * Start the API (http://localhost:4000) and the web app (http://localhost:5173)
 * together. Ctrl+C stops both.
 */
import { spawn, type ChildProcess } from 'node:child_process';

const children: ChildProcess[] = [];

function run(name: string, args: string[]): void {
  const child = spawn('npm', args, { stdio: 'inherit', shell: process.platform === 'win32' });
  child.on('exit', (code) => {
    console.log(`[${name}] exited with code ${code}`);
    for (const other of children) if (other !== child) other.kill();
    process.exit(code ?? 0);
  });
  children.push(child);
}

run('api', ['run', 'dev', '-w', 'api']);
run('web', ['run', 'dev', '-w', 'web']);

process.on('SIGINT', () => {
  for (const child of children) child.kill('SIGINT');
});
