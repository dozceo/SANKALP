import React from 'react';
import { render, screen } from '@testing-library/react';
import { LearningStateCard } from './LearningStateCard';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { StudentIntelligence } from '@/types/intelligence';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Brain: () => <div data-testid="icon-brain" />,
  AlertTriangle: () => <div data-testid="icon-alert" />,
  TrendingUp: () => <div data-testid="icon-trending" />,
  Info: () => <div data-testid="icon-info" />,
}));

const mockIntelligence: StudentIntelligence = {
  studentId: "123",
  generatedAt: new Date().toISOString(),
  mastery: {
    "Algebra": {
        score: 0.8,
        confidence: 0.9,
        priority: "LOW",
        daysSinceRevision: 2,
        needsRevision: false,
        attempts: 5,
        trend: "IMPROVING"
    },
    "Geometry": {
        score: 0.4,
        confidence: 0.6,
        priority: "HIGH",
        daysSinceRevision: 10,
        needsRevision: true,
        attempts: 3,
        trend: "STABLE"
    }
  },
  attentionRisk: "MEDIUM",
  revisionUrgency: "SCHEDULED",
  adkDecision: "SHORT_REVISION_MODE",
  confidence: "MEDIUM",
  reasoning: ["Reason 1", "Reason 2"],
  flags: []
};

const renderWithProvider = (ui: React.ReactElement) => {
    return render(
        <TooltipProvider>
            {ui}
        </TooltipProvider>
    );
};

describe('LearningStateCard', () => {
  it('renders correctly with given intelligence', () => {
    renderWithProvider(<LearningStateCard intelligence={mockIntelligence} />);

    expect(screen.getByText('Learning State')).toBeInTheDocument();
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();

    expect(screen.getByText('SHORT REVISION MODE')).toBeInTheDocument();

    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('displays reasoning list', () => {
    renderWithProvider(<LearningStateCard intelligence={mockIntelligence} />);
    expect(screen.getByText('Reason 1')).toBeInTheDocument();
    expect(screen.getByText('Reason 2')).toBeInTheDocument();
  });

  it('shows high attention risk warning', () => {
      const highRisk: StudentIntelligence = { ...mockIntelligence, attentionRisk: "HIGH" };
      renderWithProvider(<LearningStateCard intelligence={highRisk} />);
      expect(screen.getByText('HIGH')).toBeInTheDocument();
      // Check for alert icon
      expect(screen.getByTestId('icon-alert')).toBeInTheDocument();
  });
});
