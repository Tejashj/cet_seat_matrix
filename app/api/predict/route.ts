import { NextRequest, NextResponse } from 'next/server';
import { predict, StudentInput } from '@/lib/prediction/engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as StudentInput;

    // Validate required fields
    if (!body.rank || typeof body.rank !== 'number' || body.rank < 1 || body.rank > 200000) {
      return NextResponse.json(
        { error: 'Invalid rank. Must be between 1 and 200,000.' },
        { status: 400 }
      );
    }

    if (!body.category || typeof body.category !== 'string') {
      return NextResponse.json(
        { error: 'Category is required.' },
        { status: 400 }
      );
    }

    // Set defaults
    const input: StudentInput = {
      ...body,
      includePrivate: body.includePrivate ?? true,
      includeGovernment: body.includeGovernment ?? true,
      includeAided: body.includeAided ?? true,
    };

    const result = predict(input);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'KCET Prediction API v2.0. Use POST with student data.' },
    { status: 200 }
  );
}
