import React, { Component, ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  errorCode?: number;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorCode: undefined,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: React.ErrorInfo) {
    console.error("Error caught in ErrorBoundary:", error, info);

    // error에 statusCode가 있는 경우, 해당 값을 상태에 저장
    if (error?.statusCode) {
      this.setState({ errorCode: error.statusCode });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.state.errorCode !== 419) {
        window.location.href = "/";
      }
      return null;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
