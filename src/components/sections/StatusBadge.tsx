import type { ProjectStatus } from "@/types/project";
import { Tag } from "@/components/ui/Tag";

export const statusLabel: Record<ProjectStatus, string> = {
  completed: "Completed",
  "in-progress": "In progress",
  prototype: "Prototype",
  planned: "Planned",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Tag
      tone={
        status === "planned"
          ? "muted"
          : status === "completed"
            ? "neutral"
            : "accent"
      }
    >
      <span className="sr-only">Status: </span>
      {statusLabel[status]}
    </Tag>
  );
}
