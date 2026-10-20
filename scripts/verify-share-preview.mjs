import fs from 'node:fs'
import assert from 'node:assert/strict'

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))

const canonicalUrl = 'https://askgogo.in/'
const title = 'AskGogo — Less prompting. More living.'
const imageUrl = `${canonicalUrl}askgogo-gogo-character-og-20260911.png`
const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1]
assert.ok(head, 'page must have a head for crawler-visible metadata')

// Read actual head tags, so body text or a duplicate stale tag cannot satisfy a check.
function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'))?.[2]
}
function meta(name) {
  const tags = [...head.matchAll(/<meta\b[^>]*>/gi)]
    .map(([tag]) => tag)
    .filter((tag) => (attribute(tag, 'property') ?? attribute(tag, 'name')) === name)
  assert.equal(tags.length, 1, `${name} must appear exactly once in the head`)
  return attribute(tags[0], 'content')
}

const canonical = [...head.matchAll(/<link\b[^>]*>/gi)]
  .map(([tag]) => tag)
  .filter((tag) => attribute(tag, 'rel') === 'canonical')
assert.equal(canonical.length, 1, 'page must have one canonical URL')
assert.equal(attribute(canonical[0], 'href'), canonicalUrl)
assert.equal(meta('og:url'), canonicalUrl, 'share URLs must use the public root without a fragment')
assert.equal(head.match(/<title>(.*?)<\/title>/i)?.[1], title)
assert.equal(meta('og:title'), title)
assert.equal(meta('twitter:title'), title)
assert.equal(meta('og:type'), 'website')
assert.equal(meta('og:site_name'), 'AskGogo')
assert.equal(meta('og:image'), imageUrl)
assert.equal(meta('twitter:image'), imageUrl)
assert.equal(meta('twitter:card'), 'summary_large_image')
assert.equal(meta('og:image:width'), '1200')
assert.equal(meta('og:image:height'), '630')
const description = meta('description')
assert.ok(description?.trim(), 'page description must not be empty')
assert.equal(meta('og:description'), description)
assert.equal(meta('twitter:description'), description)

const dashboardRedirect = (vercel.redirects || []).find((r) => r.source === '/dashboard')
assert.ok(dashboardRedirect, 'public /dashboard must redirect to root')
assert.equal(dashboardRedirect.destination, '/')
assert.equal(dashboardRedirect.permanent, false)

// Keep old shared image links working even though v3 uses a direct character asset.
const premiumRewrite = (vercel.rewrites || []).find((r) => r.source === '/askgogo-whatsapp-premium-20260911c.png')
assert.ok(premiumRewrite, 'cache-busted premium OG path must exist')
assert.equal(premiumRewrite.destination, '/og-image-v2.png')

console.log('✅ AskGogo WhatsApp share-preview regression passed')
