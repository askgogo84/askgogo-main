import fs from 'node:fs';
import assert from 'node:assert/strict';

const source=fs.readFileSync('site-final/waitlist.js','utf8');

assert.ok(source.includes("form.addEventListener('click'"), 'form must intercept submit clicks');
assert.ok(source.includes("e.stopPropagation()"), 'submit click must not bubble to page-level handlers');
assert.ok(source.includes("form.addEventListener('submit'"), 'form submit handler must remain');
assert.ok(source.includes("fetch(API"), 'submit must still call waitlist API');

console.log('waitlist submit capture regression passed');
