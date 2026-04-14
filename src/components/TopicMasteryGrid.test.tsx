import React from 'react';
import { render, screen } from '@testing-library/react';
import { TopicMasteryGrid } from './TopicMasteryGrid';
import type { StudentIntelligence } from '@/types/intelligence';

jest.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="icon-alert" />,
  CheckCircle2: () => <div data-testid="icon-check" />,
  Clock: () => <div data-testid="icon-clock" />,
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
  attentionRisk: "LOW",
  revisionUrgency: "NONE",
  adkDecision: "PROGRESS_MODE",
  confidence: "HIGH",
  reasoning: [],
  flags: []
};

describe('TopicMasteryGrid', () => {
  it('renders all topics', () => {
    render(<TopicMasteryGrid intelligence={mockIntelligence} />);
    expect(screen.getByText('Algebra')).toBeInTheDocument();
    expect(screen.getByText('Geometry')).toBeInTheDocument();
  });

  it('shows high priority indicator for weak topics', () => {
    render(<TopicMasteryGrid intelligence={mockIntelligence} />);
    // Algebra is 80% (Low priority, Strong) -> Check icon
    // Geometry is 40% (High priority) -> Alert icon

    expect(screen.getByTestId('icon-check')).toBeInTheDocument();
    expect(screen.getByTestId('icon-alert')).toBeInTheDocument();
  });

  it('displays mastery percentages', () => {
    render(<TopicMasteryGrid intelligence={mockIntelligence} />);
    expect(screen.getByText('80% mastered')).toBeInTheDocument();
    expect(screen.getByText('40% mastered')).toBeInTheDocument();
  });

  it('shows revision recommended warning for Geometry', () => {
      render(<TopicMasteryGrid intelligence={mockIntelligence} />);
      expect(screen.getByText('⚠️ Revision recommended')).toBeInTheDocument();
  });
});
