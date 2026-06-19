import { NextRequest, NextResponse } from 'next/server';
import { predict, StudentInput } from '@/lib/prediction/engine';
import { withCache } from '@/lib/cache/nodeCache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FASTAPI_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8000';

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

    // Create unique cache key based on inputs
    const cacheKey = `predict_${input.rank}_${input.category}_${input.round || 'R1'}_${input.gender || ''}_${input.rural ? 'r' : ''}_${input.kannadaMedium ? 'k' : ''}_${input.ph ? 'ph' : ''}_${input.exDefence ? 'ex' : ''}_${input.preferredCities?.sort().join(',') || ''}_${input.preferredBranches?.sort().join(',') || ''}_${input.includeGovernment ? 'g' : ''}_${input.includeAided ? 'a' : ''}_${input.includePrivate ? 'p' : ''}`;

    const result = await withCache(
      cacheKey,
      async () => {
        try {
          // Attempt to call the Python FastAPI backend
          console.log(`Forwarding prediction request to FastAPI: ${FASTAPI_URL}/api/predict`);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout

          const response = await fetch(`${FASTAPI_URL}/api/predict`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              rank: input.rank,
              category: input.category,
              gender: input.gender,
              rural: input.rural ?? false,
              kannada_medium: input.kannadaMedium ?? false,
              ph: input.ph ?? false,
              ex_defence: input.exDefence ?? false,
              preferred_cities: input.preferredCities,
              preferred_branches: input.preferredBranches,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            // Adapt python response keys if necessary to match TypeScript Recommendation / PredictionResult interface
            return data;
          } else {
            const errText = await response.text();
            console.warn(`FastAPI prediction failed: ${response.status} - ${errText}. Falling back to JS Engine.`);
          }
        } catch (fetchError: any) {
          console.warn(`FastAPI backend unreachable or timed out (${fetchError.message}). Falling back to JS Engine.`);
        }

        // Local engine fallback
        return predict(input);
      },
      3600 // Cache for 1 hour
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Prediction proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'KCET Prediction Proxy API v2.0. Use POST with student data.' },
    { status: 200 }
  );
}

