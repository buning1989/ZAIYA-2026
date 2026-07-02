import { motion } from "framer-motion";
import { Play, ArrowUpRight } from "lucide-react";
import TolanGlyph from "./TolanGlyph";
import RivePlayer from "./RivePlayer";

const APP_STORE_URL =
  "https://apps.apple.com/us/app/tolan-alien-best-friend/id6477549878";

const ease = [0.22, 1, 0.36, 1] as const;

const riveFiles = [
  "/27824-52582-64.riv",
  "/lil_guy.riv",
  "/color_eyes_interaction.riv",
  "/the_winking_guy.riv",
  "/assistant_character.riv",
  "/little_boy.riv",
  "/interactions_test.riv",
  "/orbix.riv",
  "/giddy_up.riv",
  "/round_to_dino.riv",
  "/liveperson_ai_agent_-_point.riv",
];

export default function Hero() {

  return (
    <section id="top" className="relative overflow-hidden">
      <div className="container flex flex-col items-center pb-24 pt-20 text-center md:pb-32 md:pt-28">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1 text-[12px] text-ink-soft"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-ink">
            <TolanGlyph className="h-3 w-3" tone="canvas" />
          </span>
          Meet your embodied AI companion
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.06, ease }}
          className="mt-7 max-w-3xl text-[44px] leading-[1.04] tracking-tightest text-ink sm:text-[60px] md:text-[76px]"
        >
          A friend who gets you
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.14, ease }}
          className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-soft md:text-base"
        >
          Tolan is an alien companion built on leading AI models — designed to
          listen, remember, and show up for the everyday moments that matter.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22, ease }}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <a
            href="#trailer"
            className="group inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
          >
            <Play className="h-4 w-4 fill-canvas" />
            Watch the Trailer
          </a>
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 rounded-md border border-line bg-canvas px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-line-soft"
          >
            Download on the App Store
            <ArrowUpRight className="h-4 w-4 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </motion.div>

        {/* Rive 动画容器 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease }}
          className="mt-16 flex w-full max-w-6xl flex-wrap justify-center gap-6"
        >
          {riveFiles.map((src) => (
            <div key={src} className="aspect-video w-[45%] overflow-hidden rounded-xl border border-line bg-canvas/50">
              <RivePlayer src={src} className="h-full w-full" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
