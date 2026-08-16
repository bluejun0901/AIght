import React from 'react';
import aightLogoUrl from '../assets/aight-logo.png';

interface AightLogoProps {
  className?: string;
  size?: number;
  textColor?: string;
  showText?: boolean;
}

export const AightLogo: React.FC<AightLogoProps> = ({
  className = '',
  size = 32,
  showText = true,
}) => {
  const logoAspectRatio = 953 / 351;

  return (
    <div
      className={`inline-flex shrink-0 overflow-hidden select-none ${className}`}
      style={{
        width: showText ? size * logoAspectRatio : size,
        height: size,
      }}
    >
      <img
        src={aightLogoUrl}
        alt={showText ? 'Aight' : ''}
        width={953}
        height={351}
        className="block max-w-none shrink-0 object-contain"
        style={{
          width: size * logoAspectRatio,
          height: size,
        }}
        draggable={false}
      />
    </div>
  );
};
