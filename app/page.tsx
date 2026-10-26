import { Settle } from "@/components/textures/settle";

/**
 * The hero carries one Texture (Settle, free): mount it inside an element with position: relative and a size,
 * and it covers that element. Hover to see the bars gather. Add more with `npx shadcn@latest add @textures/<slug>`.
 */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-center gap-8 px-6 py-16">
      <section id="hero" className="relative aspect-[732/516] w-full overflow-hidden rounded-md border border-border">
        <Settle />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-8">
          <h1 className="text-4xl font-semibold tracking-tight">Your product, with texture.</h1>
          <p className="mt-2 max-w-md text-muted-foreground">Move your pointer over the hero. The bars are a Texture from textures.dev, installed as one React file.</p>
        </div>
      </section>
      <p className="text-sm text-muted-foreground">
        More: <code>npx shadcn@latest add @textures/&lt;slug&gt;</code> · catalog at <a className="underline" href="https://textures.dev/llms.txt?via=rules">textures.dev/llms.txt</a>
      </p>
    </main>
  );
}
