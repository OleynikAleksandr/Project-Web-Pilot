import test from 'node:test';
import assert from 'node:assert/strict';
import { CHATGPT_CHAT_ENTRYPOINT, CHATGPT_WORK_ENTRYPOINT, chatGPTEntrypoint,
  chatGPTExperienceForUrl, chatGPTUrlMatchesExperience } from '../src/chatgpt-experience.mjs';

test('Chat and Work use explicit top-level entrypoints', () => {
  assert.equal(chatGPTEntrypoint('chat'), CHATGPT_CHAT_ENTRYPOINT);
  assert.equal(chatGPTEntrypoint('work'), CHATGPT_WORK_ENTRYPOINT);
  assert.throws(() => chatGPTEntrypoint('astra'), { code: 'CHATGPT_EXPERIENCE' });
});

test('experience classifier accepts only matching chatgpt.com routes', () => {
  for (const url of ['https://chatgpt.com/', 'https://chatgpt.com/c/aaaaaaaa',
    'https://chatgpt.com/g/example/c/aaaaaaaa']) assert.equal(chatGPTExperienceForUrl(url), 'chat');
  for (const url of ['https://chatgpt.com/work/', 'https://chatgpt.com/work/aaaaaaaa',
    'https://chatgpt.com/work/c/aaaaaaaa']) assert.equal(chatGPTExperienceForUrl(url), 'work');
  for (const url of ['https://chatgpt.com/auth/login', 'https://example.com/work/', 'http://chatgpt.com/work/'])
    assert.equal(chatGPTExperienceForUrl(url), null);
  assert.equal(chatGPTUrlMatchesExperience('https://chatgpt.com/work/', 'work'), true);
  assert.equal(chatGPTUrlMatchesExperience('https://chatgpt.com/', 'work'), false);
});
