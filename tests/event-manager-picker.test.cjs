const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function renderPicker(data) {
  const exports = {};
  const listEventManagers = () => {};
  const overrides = {
    '@tanstack/react-query': { useQuery: config => {
      assert.equal(config.queryFn, listEventManagers);
      return { data, isSuccess: true };
    } },
    '@/api/identity': { listEventManagers },
    'next/link': { default: ({ href, children }) => React.createElement('a', { href }, children) },
    '@/components/ui/input': { Input: props => React.createElement('input', props) },
    '@/components/ui/select': { Select: props => React.createElement('select', props) },
    '@/components/ui/button': { Button: props => React.createElement('button', props) },
  };
  const code = ts.transpileModule(fs.readFileSync('src/components/events/event-manager-picker.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(code, { exports, require: name => overrides[name] ?? require(name) });
  return renderToStaticMarkup(React.createElement(exports.EventManagerPicker, { value: '', onChange() {} }));
}

test('picker identifies existing accounts by ID and contact, even with matching names', () => {
  const html = renderPicker([
    { id: 'manager-a', name: 'Sam', mobile_number: '9999999991' },
    { id: 'manager-b', name: 'Sam', email: 'sam@example.com' },
  ]);
  assert.match(html, /value="manager-a"/);
  assert.match(html, /value="manager-b"/);
  assert.match(html, /9999999991/);
  assert.match(html, /sam@example.com/);
});

test('empty picker directs admins to account creation', () => {
  const html = renderPicker([]);
  assert.match(html, /Create an Event Manager account first/);
  assert.match(html, /href="\/ops\/admin-accounts"/);
});
