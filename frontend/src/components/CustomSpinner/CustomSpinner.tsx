import { type FC } from "react";

type SpinnerSize = "sm" | "md" | "lg" | "xl";

interface CustomSpinnerProps {
  size?: SpinnerSize | string;
  color?: string;
  thickness?: string;
}

const sizeMap: Record<SpinnerSize, string> = {
  sm: "1rem", // 16px
  md: "1.5rem", // 24px
  lg: "2rem", // 32px
  xl: "3rem", // 48px
};

const CustomSpinner: FC<CustomSpinnerProps> = ({ size = "md", color = "var(--primary-color)", thickness = "2px" }) => {
  const finalSize = sizeMap[size as SpinnerSize] ?? size;

  const spinnerStyle: React.CSSProperties = {
    display: "inline-block",
    borderWidth: thickness,
    borderColor: "currentColor",
    borderStyle: "solid",
    borderRadius: "50%",
    borderTopColor: "transparent",
    width: finalSize,
    height: finalSize,
    color: color,
    animation: "spin 1s linear infinite",
  };

  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(180deg) scale(1.2); }
      100% { transform: rotate(360deg) scale(1); }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={spinnerStyle} role="status" aria-label="loading">
        <span style={{ display: "none" }}>Loading...</span> {/* Accessibility */}
      </div>
    </>
  );
};

export default CustomSpinner;
