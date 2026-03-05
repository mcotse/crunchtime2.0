import React from 'react';
import { AuthGuard } from './components/AuthGuard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CrunchTime } from './pages/BudgetApp';
export function App() {
  return (
    <ErrorBoundary>
      <AuthGuard>
        <CrunchTime />
      </AuthGuard>
    </ErrorBoundary>
  );
}