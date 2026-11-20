import assert from 'node:assert/strict';
import test from 'node:test';

test('commands and inline results use the current Telegram API', async (t) => {
  process.env.TELEGRAM_TOKEN = '123456:test';
  process.env.TELEGRAM_DEFAULT_ADMIN = '7';
  process.env.PUBLIC_URL = 'https://example.org';
  t.mock.method(globalThis, 'fetch', () => { throw new Error('Unexpected network access'); });
  const { default: bot } = await import('./index');
  t.mock.method(bot.api, 'getMe', async () => ({ id: 1, is_bot: true, first_name: 'Test', username: 'testbot' }));
  const send = t.mock.method(bot.api, 'sendMessage', async () => ({}));
  const answer = t.mock.method(bot.api, 'answerInlineQuery', async () => true);
  const from = { id: 7, is_bot: false, first_name: 'Test' };
  const message = { message_id: 2, from, chat: { id: 10, type: 'private' as const, first_name: 'Test' }, date: 1, text: '/app' };
  await bot.handleUpdate({ update_id: 1, message });
  assert.equal(send.mock.callCount(), 2);
  const [reply] = send.mock.calls[0].arguments;
  assert.equal(reply.chat_id, 10);
  assert.deepEqual(reply.reply_markup, { inline_keyboard: [[{ text: 'Open Admin WebApp', web_app: { url: 'https://example.org/app' } }]] });
  await bot.handleUpdate({ update_id: 2, message: { ...message, from: { ...from, id: 8 } } });
  assert.match(send.mock.calls[2].arguments[0].text, /only available for administrators/);
  await bot.handleUpdate({ update_id: 3, inline_query: { id: 'q', from, query: '', offset: '' } });
  assert.deepEqual(answer.mock.calls[0].arguments[0], { inline_query_id: 'q', results: [], cache_time: 0 });
});
