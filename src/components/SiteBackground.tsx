/**
 * Fixed, non-interactive page background: a soft indigo/violet aurora at the top,
 * a faint dot grid that fades out toward the edges, and a vignette.
 * Static on purpose (no animation) so it never competes with the content.
 */
export default function SiteBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#06060a]">
      {/* Aurora */}
      <div className="absolute left-1/2 top-[-22rem] h-[44rem] w-[70rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(99,102,241,0.22),transparent)] blur-2xl" />
      <div className="absolute left-[8%] top-[-12rem] h-[30rem] w-[36rem] rounded-full bg-[radial-gradient(closest-side,rgba(168,85,247,0.14),transparent)] blur-2xl" />
      <div className="absolute right-[4%] top-[-8rem] h-[26rem] w-[32rem] rounded-full bg-[radial-gradient(closest-side,rgba(56,189,248,0.10),transparent)] blur-2xl" />

      {/* Dot grid, faded out away from the top-center */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black_20%,transparent_75%)]" />

      {/* Vignette + fade into the base color at the bottom */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55))]" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#06060a] to-transparent" />
    </div>
  );
}
