import { NextRequest, NextResponse } from 'next/server';

// In-memory poll storage (will reset when deployed, but good for demo)
let pollData = {
  question: "What's your favorite programming language?",
  options: [
    { id: '1', text: 'JavaScript', votes: 0 },
    { id: '2', text: 'Python', votes: 0 },
    { id: '3', text: 'TypeScript', votes: 0 },
    { id: '4', text: 'Go', votes: 0 }
  ],
  totalVotes: 0
};

// GET - Fetch current poll data
export async function GET() {
  return NextResponse.json(pollData);
}

// POST - Vote for an option
export async function POST(request: NextRequest) {
  try {
    const { optionId } = await request.json();
    
    if (!optionId) {
      return NextResponse.json(
        { error: 'Option ID is required' },
        { status: 400 }
      );
    }

    const option = pollData.options.find(o => o.id === optionId);
    if (!option) {
      return NextResponse.json(
        { error: 'Invalid option ID' },
        { status: 400 }
      );
    }

    option.votes += 1;
    pollData.totalVotes += 1;

    return NextResponse.json(pollData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

// PUT - Update poll question and options (admin only)
export async function PUT(request: NextRequest) {
  try {
    const { question, options } = await request.json();
    
    if (!question || !options || !Array.isArray(options)) {
      return NextResponse.json(
        { error: 'Question and options array are required' },
        { status: 400 }
      );
    }

    // Create new options with IDs and reset votes
    const newOptions = options.map((text, index) => ({
      id: (index + 1).toString(),
      text: text.trim(),
      votes: 0
    })).filter(option => option.text.length > 0);

    if (newOptions.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 options are required' },
        { status: 400 }
      );
    }

    pollData = {
      question: question.trim(),
      options: newOptions,
      totalVotes: 0
    };

    return NextResponse.json(pollData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

// DELETE - Reset poll votes
export async function DELETE() {
  pollData.options.forEach(option => {
    option.votes = 0;
  });
  pollData.totalVotes = 0;

  return NextResponse.json(pollData);
}