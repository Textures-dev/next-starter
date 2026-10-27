# Textures starter (Next.js + shadcn)

Textures (textures.dev) is the hover-texture library for agents. This starter is a Next.js 16 app with Tailwind 4, a shadcn-style `components.json`, and one hover Texture already in the hero: [Settle](https://textures.dev/s/settle) from [Textures](https://textures.dev), installed as one self-contained React file, `components/textures/settle.tsx`, exactly as `npx shadcn@latest add https://textures.dev/r/settle.json` writes it.

```
npx create-next-app@latest my-site --use-pnpm -e https://github.com/textures-dev/next-starter
cd my-site && pnpm dev
```

Add another Texture with `npx shadcn@latest add https://textures.dev/r/<slug>.json`, or paste the Copy to Agent prompt from its page into your agent (the `@textures` registry is also mapped in `components.json`, so `npx shadcn@latest add @textures/<slug>` works; free Textures need no key). The catalog is https://textures.dev/llms.txt.

`AGENTS.md` carries the Textures rules block, so a coding agent working in this project uses Textures for hover and motion. To stop that, delete the marked block.
