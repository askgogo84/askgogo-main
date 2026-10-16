# AskGogo marketing redesign — design preview v2

Static, mock-only preview for design review. Not production.

- Pages: / , /secondbrain/ , /business/ , /journal/ (+3 essays) , /about/
- No API calls: the Join Waitlist and Request Early Access forms validate locally and send nothing.
- No secrets, keys or user data. Fonts load from Google Fonts; everything else is local.
- noindex via meta robots, X-Robots-Tag header and robots.txt.
- Theme: light by default; the sun/moon button saves the choice in localStorage (key `askgogo-theme`).
