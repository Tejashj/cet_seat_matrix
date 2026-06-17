import { NextRequest, NextResponse } from 'next/server';

// PDF generation is done client-side via react-pdf
// This route provides a trigger endpoint that redirects to the PDF page
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Use the Export PDF button in the Shortlist tab.' });
}
