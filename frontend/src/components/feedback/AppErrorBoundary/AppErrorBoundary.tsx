"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/feedback/EmptyState";

type Props = {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
};

type State = {
  hasError: boolean;
};

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("AppErrorBoundary", error, info);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <EmptyState
          title={this.props.fallbackTitle ?? "Algo deu errado"}
          description={
            this.props.fallbackDescription ??
            "Não foi possível exibir esta seção. Tente novamente em instantes."
          }
          action={
            <Button type="button" variant="outline" onClick={this.handleReset}>
              Tentar novamente
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}
