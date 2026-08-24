import { CONFIDENCE_STYLES, confidenceTier } from '../api/normalize';

export default function ConfidenceBadge({ confidence }) {
  const tier = confidenceTier(confidence);
  const style = CONFIDENCE_STYLES[tier];
  const pct = `${Math.round((Number(confidence) || 0) * 100)}%`;

  return (
    <span
      title={`Extraction confidence ${pct}`}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${style.className}`}
    >
      {style.label}
      <span className="sr-only">confidence {pct}</span>
    </span>
  );
}
