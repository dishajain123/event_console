const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function compile(path, overrides = {}, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require: (name) => overrides[name] ?? require(name),
    ...globals,
  });
  return exports.default;
}

function renderList(result) {
  let filters;
  const widget = ({ children, title, description }) => React.createElement('div', null, title, description, children);
  const overrides = {
    'next/link': { default: ({ href, children }) => React.createElement('a', { href }, children) },
    '@/hooks/useEvents': { useEventsPage: (value) => { filters = value; return { refetch() {}, ...result }; } },
    '@/hooks/useEventCategories': { useMainCategories: () => ({ data: [] }), useSubCategories: () => ({ data: [] }) },
    '@/types/events': { EVENT_STATUS_LABELS: { published: 'Published' } },
  };
  for (const [path, names] of Object.entries({
    'layout/header': ['Header'], 'ui/glass-panel': ['GlassPanel'], 'ui/input': ['Input'],
    'ui/select': ['Select'], 'ui/button': ['Button'], 'ui/badge': ['Badge'],
    'ui/pagination': ['Pagination'], 'shared/skeleton': ['TableSkeleton'],
    'shared/states': ['EmptyState', 'ErrorState'], 'events/create-event-dialog': ['CreateEventDialog'],
    'events/event-image-placeholder': ['EventImagePlaceholder'],
  })) overrides[`@/components/${path}`] = Object.fromEntries(names.map(name => [name, widget]));
  const Page = compile('src/app/ops/events/page.tsx', overrides);
  const html = renderToStaticMarkup(React.createElement(Page));
  return { html, filters };
}

test('Events index renders collection and management link without eventId params', () => {
  const { html, filters } = renderList({ data: { items: [{ id: 'event-123', name: 'Live backend event', status: 'published', start_date: '2026-10-01', end_date: '2026-10-02' }], total: 26 } });
  assert.match(html, /Live backend event/);
  assert.match(html, /href="\/ops\/events\/event-123"/);
  assert.match(html, /New event/);
  assert.doesNotMatch(html, /Couldn.*load this event/);
  assert.equal(filters.page, 1);
  assert.equal(filters.pageSize, 25);
});

test('Events index reports list errors and supports an empty collection', () => {
  assert.match(renderList({ isError: true, error: { message: 'Backend unavailable' } }).html, /Backend unavailable/);
  assert.match(renderList({ data: { items: [], total: 0 } }).html, /No events yet/);
});

test('LAN API proxy resolves backend on server, not the viewing device', async () => {
  const config = compile('next.config.ts', {}, { process: { env: { API_BASE_URL: 'http://backend:8001/api/v1/' } } });
  const rules = await config.rewrites();
  assert.equal(rules[0].source, '/api/backend/:path*');
  assert.equal(rules[0].destination, 'http://backend:8001/api/v1/:path*');
  assert.match(fs.readFileSync('src/api/client.ts', 'utf8'), /baseURL: "\/api\/backend"/);
});
