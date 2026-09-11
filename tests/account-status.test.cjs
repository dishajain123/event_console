const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

test('disabled account clears console session without refreshing a token', async () => {
  let onError;
  let cleared = 0;
  const state = { clearSession() { cleared++; } };
  const axios = { create: () => ({ interceptors: {
    request: { use() {} }, response: { use(success, error) { onError = error; } },
  } }) };
  const source = ts.transpileModule(fs.readFileSync('src/api/client.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports, require(name) {
    if (name === 'axios') return axios;
    if (name === '@/state/sessionStore') return { useSessionStore: { getState: () => state } };
    throw new Error(`Unexpected import: ${name}`);
  }, fetch() { throw new Error('Disabled accounts must not refresh'); } });
  await assert.rejects(onError({ response: { status: 401, data: {
    error_code: 'account_disabled', message: 'Contact an admin to reactivate.',
  } }, config: {} }), error => error.errorCode === 'account_disabled');
  assert.equal(cleared, 1);
});
