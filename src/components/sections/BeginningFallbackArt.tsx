/**
 * Flat-mode Beginning slot: the original two-line "> hello, world" types in
 * with a blinking ember cursor, then a notebook page turns to reveal Midhun's
 * introduce() sample.
 */
export function BeginningFallbackArt() {
  return (
    <div
      data-allow-motion
      className="beginning-flat relative flex h-full w-full flex-col justify-center gap-5 px-4 py-6 sm:px-8"
      aria-hidden="true"
    >
      <pre className="beginning-flat__term font-mono text-[clamp(1rem,2.8vw,1.75rem)] leading-tight text-paper">
        <span className="beginning-flat__line beginning-flat__line--a">
          {"> hello,"}
        </span>
        {"\n"}
        <span className="beginning-flat__line beginning-flat__line--b">
          {"  world"}
        </span>
        <span className="beginning-flat__caret" />
      </pre>
      <div className="beginning-flat__book">
        <div className="beginning-flat__leaf">
          <p className="beginning-flat__note font-display text-[0.7rem] text-[#3a352e] italic sm:text-xs">
            My Programming Journey
          </p>
          <pre className="mt-2 font-mono text-[0.62rem] leading-relaxed text-[#1c1a16] sm:text-[0.72rem]">
            {`def introduce():
    name = "Midhun Krishnan"
    interest = "Python and Generative AI"
    print(f"Hello, I'm {name}")
    print(f"Learning {interest}")

introduce()`}
          </pre>
        </div>
      </div>
    </div>
  );
}
