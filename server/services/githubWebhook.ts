import { createHmac, timingSafeEqual, randomUUID } from 'node:crypto';
import { mkdir, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import type { Request, Response } from 'express';

export function githubWebhook(options?: { secret: string; directory: string }) {
  return async (req: Request, res: Response) => {
    const secret = options?.secret || process.env.GITHUB_WEBHOOK_SECRET;
    const directory = options?.directory || process.env.DEPLOY_REQUEST_DIR;
    if (!secret || !directory) return void res.sendStatus(503);
    if (!Buffer.isBuffer(req.body)) return void res.sendStatus(400);
    const signature = req.get('X-Hub-Signature-256') || '';
    const expected = 'sha256=' + createHmac('sha256', secret).update(req.body).digest('hex');
    const provided = Buffer.from(signature);
    const wanted = Buffer.from(expected);
    if (provided.length !== wanted.length || !timingSafeEqual(provided, wanted)) return void res.sendStatus(403);
    let payload;
    try { payload = JSON.parse(req.body.toString('utf8')); } catch { return void res.sendStatus(400); }
    if (!payload || typeof payload !== 'object') return void res.sendStatus(400);
    if (payload.repository?.full_name !== 'firya/zavtratips') return void res.sendStatus(403);
    if (req.get('X-GitHub-Event') === 'ping') return void res.status(200).json({ ok: true });
    if (req.get('X-GitHub-Event') !== 'push' || payload.ref !== 'refs/heads/main' || payload.deleted) return void res.sendStatus(204);
    if (!/^[a-f0-9]{40}$/.test(payload.after || '')) return void res.sendStatus(400);
    try {
      await mkdir(directory, { recursive: true });
      const id = randomUUID();
      const temporary = path.join(directory, `${id}.tmp`);
      await writeFile(temporary, JSON.stringify({ sha: payload.after, receivedAt: new Date().toISOString() }), { mode: 0o600 });
      await rename(temporary, path.join(directory, `${id}.json`));
      return void res.status(202).json({ queued: true });
    } catch {
      console.error('Unable to queue GitHub deployment');
      return void res.sendStatus(503);
    }
  };
}
