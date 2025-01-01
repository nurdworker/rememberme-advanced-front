import React, { Component, ReactNode } from "react";

// class 컴포넌트에서 hook을 사용할 수 없으므로, ErrorBoundary를 함수형으로 변경할 수도 있습니다.
// 여기서는 class 기반 컴포넌트를 계속 사용하도록 하겠습니다.

type ErrorBoundaryProps = {
  children: ReactNode; // children의 타입 정의
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Error caught in ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      // `useNavigate` 훅을 사용할 수 없으므로, `window.location`을 통해 리디렉션을 처리합니다.
      window.location.href = "/";
      return null; // 리디렉션 후 아무것도 렌더링하지 않습니다.
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
