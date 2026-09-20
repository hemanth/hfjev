import React from 'react';
import { PastelColor } from '../types';

interface PastelBadgeProps {
  color?: PastelColor;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const colorStyles: Record<PastelColor, string> = {
  lavender: 'bg-[#EEF0FD] text-[#4D3DB5] border-[#DCDCF8]',
  mint: 'bg-[#EAF7F0] text-[#1C7352] border-[#D0EFE0]',
  peach: 'bg-[#FFF1E8] text-[#A04818] border-[#FDE2D2]',
  sky: 'bg-[#EBF5FF] text-[#1E65A8] border-[#D5E9FC]',
  rose: 'bg-[#FDEFF3] text-[#A3294C] border-[#FBDCE4]',
  butter: 'bg-[#FEF9E7] text-[#8C6314] border-[#FDF1C8]',
  lilac: 'bg-[#F5EFFE] text-[#7638B0] border-[#EADBFB]',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs font-medium',
  lg: 'px-3 py-1.5 text-sm font-medium',
};

export const PastelBadge: React.FC<PastelBadgeProps> = ({
  color = 'lavender',
  children,
  className = '',
  size = 'md',
  icon
}) => {
  const colorClass = colorStyles[color] || colorStyles.lavender;
  const sizeClass = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${colorClass} ${sizeClass} transition-colors ${className}`}
    >
      {icon && <span className="inline-flex shrink-0 items-center">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
