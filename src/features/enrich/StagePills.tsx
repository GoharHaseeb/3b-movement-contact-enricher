type Stage = "master" | "segment" | "match" | "results";

const STAGES: { id: Stage; n: string; label: string }[] = [
  { id: "master", n: "1", label: "Master" },
  { id: "segment", n: "2", label: "Segment" },
  { id: "match", n: "3", label: "Match" },
  { id: "results", n: "4", label: "Results" },
];

export default function StagePills({
  master,
  segment,
  results,
}: {
  master: boolean;
  segment: boolean;
  results: boolean;
}) {
  const current: Stage = results
    ? "results"
    : segment
      ? "match"
      : master
        ? "segment"
        : "master";

  return (
    <ol className="stages" aria-label="Enrich pipeline">
      {STAGES.map((stage, index) => {
        const done =
          (stage.id === "master" && master) ||
          (stage.id === "segment" && segment) ||
          (stage.id === "match" && results) ||
          (stage.id === "results" && results);
        const active = stage.id === current;
        return (
          <li key={stage.id} className={`stage ${done ? "is-done" : ""} ${active ? "is-active" : ""}`}>
            <span className="stage-n">{done && !active ? "✓" : stage.n}</span>
            {stage.label}
            {index < STAGES.length - 1 ? <span className="stage-rule" /> : null}
          </li>
        );
      })}
    </ol>
  );
}
