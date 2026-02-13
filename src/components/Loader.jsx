import React from "react";

/**
 * Reusable spinner / loader component.
 *
 * @param {"primary"|"secondary"|"success"|"danger"|"warning"|"info"|"light"|"dark"} [variant="primary"]
 * @param {"sm"|"md"|"lg"} [size="md"]
 * @param {string}  [className]  Extra CSS classes.
 * @param {boolean} [fullPage]   Center the spinner in the viewport.
 */
const SIZES = { sm: "1rem", md: "2rem", lg: "3rem" };

const Loader = ({
  variant = "primary",
  size = "md",
  className = "",
  fullPage = false,
}) => {
  const dimension = SIZES[size] || SIZES.md;

  const spinner = (
    <div
      className={`spinner-border text-${variant} ${className}`}
      role="status"
      style={{ width: dimension, height: dimension }}
    >
      <span className="visually-hidden">Loading...</span>
    </div>
  );

  if (fullPage) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default React.memo(Loader);
