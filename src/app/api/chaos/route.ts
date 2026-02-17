
import { NextResponse } from 'next/server';
import { chaos } from '@/lib/chaos-config';

// Only allow in development or staging
const isChaosEnabled = process.env.NODE_ENV !== 'production' || process.env.ENABLE_CHAOS === 'true';

export async function GET() {
  if (!isChaosEnabled) {
    return NextResponse.json({ error: 'Chaos mode disabled' }, { status: 403 });
  }
  return NextResponse.json({
    state: chaos.getState(),
    metrics: chaos.getMetrics(),
  });
}

export async function POST(request: Request) {
  if (!isChaosEnabled) {
    return NextResponse.json({ error: 'Chaos mode disabled' }, { status: 403 });
  }
  try {
    const body = await request.json();
    chaos.setState(body);
    return NextResponse.json({ success: true, state: chaos.getState() });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE() {
  if (!isChaosEnabled) {
    return NextResponse.json({ error: 'Chaos mode disabled' }, { status: 403 });
  }
  chaos.resetState();
  chaos.resetMetrics();
  return NextResponse.json({ success: true, message: 'Chaos state reset' });
}
