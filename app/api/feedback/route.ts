import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rank, category, rating, comment, email, round } = body;

    if (!comment || typeof comment !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Comment is required and must be a string.' },
        { status: 400 }
      );
    }

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be a number between 1 and 5.' },
        { status: 400 }
      );
    }

    // Log the feedback submission on server console
    console.log(`[API FEEDBACK] Rank: ${rank}, Cat: ${category}, Rating: ${rating}, Comment: "${comment}"`);

    // In a full production app, you could optionally save to database or trigger slack/email notification here.

    return NextResponse.json({
      success: true,
      message: 'Feedback received successfully by server endpoint.'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Invalid request body.' },
      { status: 500 }
    );
  }
}
