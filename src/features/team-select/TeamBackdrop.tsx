"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Team } from "@/data/types";
import { flagUrl } from "@/lib/flags";

/** Country-themed backdrop: giant blurred flag, national glow + watermark name. */
export function TeamBackdrop({ team }: { team: Team }) {
  return (
    <>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={team.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 blur-2xl saturate-150"
            style={{ backgroundImage: `url(${flagUrl(team.iso2, 1280)})` }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(90% 70% at 50% 110%, ${team.primaryColor}40 0%, transparent 60%), linear-gradient(180deg, #060a14e6 0%, #060a1480 40%, #060a14f2 100%)`,
            }}
          />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        <motion.span
          key={team.id}
          aria-hidden
          className="pointer-events-none absolute left-0 top-[6%] w-full select-none whitespace-nowrap text-center text-[13vw] font-black uppercase italic leading-none tracking-tighter text-white/[0.05]"
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -60, opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {team.name}
        </motion.span>
      </AnimatePresence>
    </>
  );
}
