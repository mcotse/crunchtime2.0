import React from 'react';
import { AuthGuard } from './components/AuthGuard';
import { CrunchTime } from './pages/BudgetApp';
export function App() {
  return (
    <AuthGuard>
      <CrunchTime />
    </AuthGuard>
  );
}