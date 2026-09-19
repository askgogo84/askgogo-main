import fs from 'node:fs';
import assert from 'node:assert/strict';

const source=fs.readFileSync('site-final/waitlist.js','utf8');

assert.ok(
  source.includes("if (a.matches('button[type=\"submit\"]')) return false;") ||
  source.includes("if (a.matches('button[type=\"submit\"]')) return false"),
  'global waitlist click interceptor must not claim submit buttons'
);
assert.ok(source.includes("(a.tagName === 'A' && /^(join gogo|meet gogo|talk to gogo)$/i.test(label))"));
assert.ok(source.includes("form.addEventListener('submit'"));
assert.ok(source.includes("fetch(API"));

console.log('waitlist submit interceptor regression passed');
