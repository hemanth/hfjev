import React from 'react';

interface ConfidenceRingProps {
  confidence: number; // 0.0 - 1.0
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export const ConfidenceRing: React.FC<ConfidenceRingProps> = ({
  confidence,
  size = 28,
  strokeWidth = 3,
  showLabel = true,
}) => {
  const clamped = Math.max(0, Math.min(1, confidence));
  const percent = Math.round(clamped * 100);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - clamped * circumference;

  let strokeColor = '#10B981'; // Mint / Emerald
  let bgTrackColor = '#E5E7EB';
  let textColor = '#374151';

  if (clamped < 0.6) {
    strokeColor = '#F43F5E'; // Rose
  } else if (clamped < 0.8) {
    strokeColor = '#F59E0B'; // Amber / Butter
  }

  return (
    <div className="inline-flex items-center gap-1.5" title={`Confidence: ${percent}%`}>
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={bgTrackColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
      </div>
      {showLabel && (
        <span className="text-[11px] font-mono font-medium text-ink-600">
          {percent}%
        </span>
      )}
    </div>
  );
};
