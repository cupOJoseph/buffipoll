'use client';

import { useState, useEffect, useRef } from 'react';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface PollData {
  pollId: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
}

export default function PollPage() {
  const [pollData, setPollData] = useState<PollData | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentPollId = useRef<string | null>(null);

  // Check localStorage vote state for current poll
  const checkVoteState = (pollId: string) => {
    const storedPollId = localStorage.getItem('buffipoll-pollId');
    if (storedPollId === pollId) {
      setHasVoted(true);
      setVotedFor(localStorage.getItem('buffipoll-voted-for'));
    } else {
      // Different poll — clear old vote
      localStorage.removeItem('buffipoll-pollId');
      localStorage.removeItem('buffipoll-voted-for');
      setHasVoted(false);
      setVotedFor(null);
    }
  };

  const fetchPollData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const response = await fetch('/api/poll');
      if (!response.ok) throw new Error('Failed to fetch poll data');
      const data: PollData = await response.json();
      setPollData(data);

      // If poll changed, reset vote state
      if (data.pollId !== currentPollId.current) {
        currentPollId.current = data.pollId;
        checkVoteState(data.pollId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => { fetchPollData(); }, []);

  useEffect(() => {
    const interval = setInterval(() => fetchPollData(false), 2000);
    return () => clearInterval(interval);
  }, []);

  const handleVote = async (optionId: string) => {
    if (hasVoted) return;
    try {
      const response = await fetch('/api/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId }),
      });
      if (!response.ok) throw new Error('Failed to submit vote');
      const updatedData: PollData = await response.json();
      setPollData(updatedData);
      localStorage.setItem('buffipoll-pollId', updatedData.pollId);
      localStorage.setItem('buffipoll-voted-for', optionId);
      setHasVoted(true);
      setVotedFor(optionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    }
  };

  const pct = (votes: number, total: number) =>
    total > 0 ? Math.round((votes / total) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-4xl font-bold text-gray-600">Loading poll...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-red-600 mb-4">Error</div>
          <div className="text-xl text-red-500">{error}</div>
          <button onClick={() => fetchPollData()} className="mt-4 admin-button">Retry</button>
        </div>
      </div>
    );
  }

  if (!pollData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800">BuffiPoll</h1>
        </div>

        <div className="result-card mb-8">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-2">
            {pollData.question}
          </h2>
          <p className="text-center text-gray-600 text-lg">
            Total votes: {pollData.totalVotes}
          </p>
          {hasVoted && (
            <p className="text-center text-green-600 font-semibold mt-2">
              ✓ You have voted! Results update live.
            </p>
          )}
        </div>

        <div className="space-y-4">
          {pollData.options.map((option) => {
            const percentage = pct(option.votes, pollData.totalVotes);
            const isVotedFor = votedFor === option.id;
            return (
              <div key={option.id} className="result-card">
                {!hasVoted ? (
                  <button onClick={() => handleVote(option.id)} className="vote-button w-full text-left">
                    {option.text}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={`text-2xl font-semibold ${isVotedFor ? 'text-green-600' : 'text-gray-800'}`}>
                        {isVotedFor && '✓ '}{option.text}
                      </span>
                      <span className="text-xl font-bold text-gray-600">{percentage}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-lg h-8 overflow-hidden">
                      <div
                        className={`percentage-bar h-full ${isVotedFor ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-right text-gray-600">
                      {option.votes} vote{option.votes !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-gray-600">
          {!hasVoted ? (
            <p className="text-lg">Tap an option to vote!</p>
          ) : (
            <p className="text-lg">Results update automatically every 2 seconds</p>
          )}
        </div>
      </div>
    </div>
  );
}
