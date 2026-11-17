/**
 * Flat-mode ICICI workstation: typing hands, a blinking cursor, cycling
 * support rows and status pips. CSS only, so it plays without WebGL.
 */
export function ExperienceFallbackArt() {
  return (
    <div
      data-allow-motion
      className="experience-flat relative h-full w-full text-paper-faint"
      aria-hidden="true"
    >
      <div className="experience-flat__desk" />
      <div className="experience-flat__monitor">
        <div className="experience-flat__bezel">
          <span className="experience-flat__pip experience-flat__pip--a" />
          <span className="experience-flat__pip experience-flat__pip--b" />
          <span className="experience-flat__pip experience-flat__pip--c" />
        </div>
        <div className="experience-flat__screen">
          <div className="experience-flat__row experience-flat__row--0" />
          <div className="experience-flat__row experience-flat__row--1" />
          <div className="experience-flat__row experience-flat__row--2" />
          <div className="experience-flat__row experience-flat__row--3" />
          <div className="experience-flat__bar">
            <span className="experience-flat__bar-fill" />
          </div>
          <span className="experience-flat__cursor" />
        </div>
      </div>
      <div className="experience-flat__figure">
        <div className="experience-flat__head" />
        <div className="experience-flat__torso" />
        <div className="experience-flat__arm experience-flat__arm--l" />
        <div className="experience-flat__arm experience-flat__arm--r" />
      </div>
      <div className="experience-flat__keyboard" />
      <div className="experience-flat__mouse" />
    </div>
  );
}
