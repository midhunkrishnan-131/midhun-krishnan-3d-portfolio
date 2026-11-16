import { getSection } from "@/data/navigation";
import { site } from "@/data/site";
import { Container } from "@/components/layout/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { ButtonLink } from "@/components/ui/Button";

/** Contact: only verified channels are links; missing ones are clearly marked as to be added. */
export function ContactSection() {
  const section = getSection("contact");
  const headingId = `${section.id}-heading`;
  const { email, github, linkedin } = site.contact;
  const row =
    "flex flex-col gap-1 border-b border-line py-6 sm:flex-row sm:items-baseline sm:justify-between";
  return (
    <section
      id={section.id}
      aria-labelledby={headingId}
      className="relative border-t border-line py-(--section-space)"
    >
      <Container size="wide">
        <div className="grid gap-12 lg:grid-cols-12">
          <header className="flex flex-col gap-6 lg:col-span-6">
            <Eyebrow number={section.number}>Get in touch</Eyebrow>
            <Heading level={2} variant="display" id={headingId}>
              Let&rsquo;s talk.
            </Heading>
            <p className="max-w-prose text-lead text-paper-dim">
              Have a question, an opportunity or an idea worth building? The
              best way to reach me is below.
            </p>
            <div className="flex flex-wrap gap-4">
              <ButtonLink href={github} external rel="me noopener noreferrer">
                GitHub profile
              </ButtonLink>
            </div>
          </header>
          <dl className="self-end border-t border-line lg:col-span-5 lg:col-start-8">
            <div className={row}>
              <dt className="text-micro text-paper-faint uppercase">Email</dt>
              <dd className={email ? "text-paper" : "text-paper-faint italic"}>
                {email ? (
                  <a href={`mailto:${email}`}>{email}</a>
                ) : (
                  "To be added"
                )}
              </dd>
            </div>
            <div className={row}>
              <dt className="text-micro text-paper-faint uppercase">GitHub</dt>
              <dd>
                <a
                  href={github}
                  target="_blank"
                  rel="me noopener noreferrer"
                  className="text-paper underline decoration-ember underline-offset-4 hover:text-ember-soft"
                >
                  github.com/midhunkrishnan-131
                </a>
              </dd>
            </div>
            <div className={row}>
              <dt className="text-micro text-paper-faint uppercase">
                LinkedIn
              </dt>
              <dd
                className={linkedin ? "text-paper" : "text-paper-faint italic"}
              >
                {linkedin ? (
                  <a href={linkedin} target="_blank" rel="noopener noreferrer">
                    LinkedIn profile
                  </a>
                ) : (
                  "To be added"
                )}
              </dd>
            </div>
          </dl>
        </div>
      </Container>
    </section>
  );
}
