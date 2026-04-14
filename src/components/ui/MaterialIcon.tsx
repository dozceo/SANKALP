import React from "react";

export interface MaterialIconProps {
  name: string;
  filled?: boolean;
  className?: string;
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({
  name,
  filled = false,
  className = "",
}) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
    aria-hidden="true"
  >
    {name}
  </span>
);