import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import express from 'express';
import { githubWebhook } from './githubWebhook';

test('only signed main pushes for this repository queue a deployment', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'zavtra-hook-'));
  const secret = 'test-webhook-secret';
  const app = express();
  app.post('/hook', express.raw({ type: 'application/json' }), githubWebhook({ secret, directory }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const port = (server.address() as { port: number }).port;
  const push = async (event: string, changes = {}, valid = true) => {
    const body = JSON.stringify({ repository: { full_name: 'firya/zavtratips' }, ref: 'refs/heads/main', after: 'a'.repeat(40), ...changes });
    const signature = 'sha256=' + createHmac('sha256', secret).update(body).digest('hex');
    return fetch(`http://127.0.0.1:${port}/hook`, { method: 'POST', body, headers: {
      'Content-Type': 'application/json', 'X-GitHub-Event': event, 'X-Hub-Signature-256': valid ? signature : 'invalid',
    } });
  };
  try {
    assert.equal((await push('push', {}, false)).status, 403);
    assert.equal((await push('push', { repository: { full_name: 'other/repo' } })).status, 403);
    assert.equal((await push('push', { ref: 'refs/heads/feature' })).status, 204);
    assert.equal((await push('push', { deleted: true })).status, 204);
    assert.equal((await push('ping')).status, 200);
    assert.deepEqual(await readdir(directory), []);
    assert.equal((await push('push')).status, 202);
    const files = await readdir(directory);
    assert.equal(files.length, 1);
    assert.ok(files[0].endsWith('.json'));
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
    await rm(directory, { recursive: true });
  }
});
