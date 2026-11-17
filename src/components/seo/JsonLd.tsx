import type { Graph } from "schema-dts";

/**
 * Server-rendered JSON-LD. `<` is escaped so a description cannot close the script.
 */
export function JsonLd({ data }: { data: Graph }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
