import React, { useId } from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * Gold Viewfinder Brand Mark Logo (300x300 viewBox)
 */
export function ViztrLogoMark({ className = 'w-8 h-8', size, ...props }: LogoProps) {
  const reactId = useId();
  const gradId = `goldGrad_mark_${reactId.replace(/:/g, '')}`;

  return (
    <svg
      viewBox="0 0 300 300"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      {...props}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e2c073" />
          <stop offset="100%" stopColor="#9a7d33" />
        </linearGradient>
      </defs>

      <g transform="translate(150,150)">
        {/* viewfinder corners */}
        <path
          d="M -110,-90 L -110,-120 L -80,-120"
          stroke={`url(#${gradId})`}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 110,-90 L 110,-120 L 80,-120"
          stroke={`url(#${gradId})`}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M -110,90 L -110,120 L -80,120"
          stroke={`url(#${gradId})`}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 110,90 L 110,120 L 80,120"
          stroke={`url(#${gradId})`}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        {/* V mark */}
        <path
          d="M -45,-55 L 0,55 L 45,-55"
          stroke={`url(#${gradId})`}
          strokeWidth="11"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/**
 * Footer Brand Logo with Typography and Sub-label (500x130 viewBox)
 */
export function ViztrFooterLogo({ className = 'w-full max-w-[280px] h-auto', ...props }: LogoProps) {
  const reactId = useId();
  const gradId = `goldGrad_footer_${reactId.replace(/:/g, '')}`;

  return (
    <svg
      viewBox="0 0 500 130"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e2c073" />
          <stop offset="100%" stopColor="#9a7d33" />
        </linearGradient>
      </defs>

      <g transform="translate(250,55)">
        <text
          x="0"
          y="0"
          textAnchor="middle"
          fill={`url(#${gradId})`}
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="56"
          fontWeight="700"
          letterSpacing="1"
        >
          VizTR
        </text>
        <line x1="-140" y1="26" x2="140" y2="26" stroke="#8a7433" strokeWidth="1" />
        <text
          x="0"
          y="48"
          textAnchor="middle"
          fill="#9a958c"
          fontFamily="-apple-system,Segoe UI,Roboto,sans-serif"
          fontSize="11"
          letterSpacing="4"
        >
          VISUAL · TECH · REALITY
        </text>
      </g>
    </svg>
  );
}

export default ViztrLogoMark;
