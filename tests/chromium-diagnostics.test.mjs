import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { DiagnosticJsonl, payloadMetadata, safeUrl } from '../src/chromium-diagnostics.mjs';

test('safeUrl keeps endpoint shape but strips query values, fragments and long identifiers', () => {
  const result = safeUrl('https://chatgpt.com/backend-api/conversation/123e4567-e89b-42d3-a456-426614174000?token=SUPER_SECRET&mode=compact#private');
  assert.deepEqual(result, { origin: 'https://chatgpt.com', path: '/backend-api/conversation/:id', queryKeys: ['mode', 'token'] });
  const serialized = JSON.stringify(result);
  assert.equal(serialized.includes('SUPER_SECRET'), false);
  assert.equal(serialized.includes('private'), false);
});

test('payload metadata preserves only structure, digest and safe event identifiers', () => {
  const payload = JSON.stringify({ type: 'conversation.compaction', message: 'PRIVATE USER TEXT', nested: { event_type: 'context_compaction' }, token: 'SECRET' });
  const meta = payloadMetadata(payload);
  assert.equal(meta.format, 'json');
  assert.equal(meta.sha256.length, 64);
  assert.ok(meta.bytes > 0);
  assert.deepEqual(meta.keys, ['message', 'nested', 'token', 'type']);
  assert.deepEqual(meta.signals, ['event_type=context_compaction', 'type=conversation.compaction']);
  const serialized = JSON.stringify(meta);
  assert.equal(serialized.includes('PRIVATE USER TEXT'), false);
  assert.equal(serialized.includes('SECRET'), false);

  const sse = payloadMetadata('event: message\ndata: {"type":"response.compact","text":"DO NOT LOG"}\n');
  assert.equal(sse.format, 'sse');
  assert.deepEqual(sse.signals, ['event=message', 'type=response.compact']);
  assert.equal(JSON.stringify(sse).includes('DO NOT LOG'), false);
});

test('DiagnosticJsonl writes valid JSONL and rotates bounded files', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'web-pilot-diagnostics-'));
  const file = path.join(dir, 'chromium-events.jsonl');
  const fixed = new Date('2026-09-12T10:00:00.000Z');
  const log = new DiagnosticJsonl(file, { maxBytes: 420, now: () => fixed, sessionId: 'test-session' });
  await log.init();
  for (let i = 0; i < 12; i++) log.record('test', 'event', { index: i, padding: 'x'.repeat(45) });
  await log.flush();
  const current = await fs.readFile(file, 'utf8');
  const rotated = await fs.readFile(file + '.1', 'utf8');
  for (const text of [current, rotated]) {
    assert.ok(text.length > 0);
    for (const line of text.trim().split('\n')) assert.doesNotThrow(() => JSON.parse(line));
  }
  assert.ok((await fs.stat(file)).size <= 600);
  await fs.rm(dir, { recursive: true, force: true });
});
