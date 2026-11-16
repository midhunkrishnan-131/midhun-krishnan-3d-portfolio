"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  failed: boolean;
}

/** Catches errors thrown while creating or rendering a WebGL scene; renders nothing so the static fallback stays. */
export class WebGLErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[3D] scene failed, showing fallback",
        error,
        info.componentStack,
      );
    }
    this.props.onError?.(error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
