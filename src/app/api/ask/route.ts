
import {NextRequest, NextResponse} from 'next/server';
import {askQuestion} from '@/app/actions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question = body.question;

    if (!question || typeof question !== 'string') {
      return NextResponse.json({error: 'Question is required and must be a string.'}, {status: 400});
    }

    const aiResponse = await askQuestion(question);

    if (aiResponse.error) {
        return NextResponse.json({ error: aiResponse.error }, { status: 500 });
    }

    return NextResponse.json(aiResponse);
  } catch (error) {
    console.error('API route error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({error: `Failed to process request: ${message}`}, {status: 500});
  }
}
