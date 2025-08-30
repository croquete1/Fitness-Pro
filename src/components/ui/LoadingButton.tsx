'use client';

import React from 'react';

export default function LoadingButton({
  loading,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      className={`btn primary ${props.className ?? ''}`}
      disabled={loading || props.disabled}
    >
      {loading && <span className="spinner" aria-hidden="true" />}
      <span style={{ marginLeft: loading ? 8 : 0 }}>{children}</span>
    </button>
  );
}
