'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface PollData {
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

  // Check if user has voted (localStorage)
  useEffect(() => {
    const voted = localStorage.getItem('buffipoll-voted');
    const votedOption = localStorage.getItem('buffipoll-voted-for');
    if (voted === 'true') {
      setHasVoted(true);
      setVotedFor(votedOption);
    }
  }, []);

  // Fetch poll data initially
  useEffect(() => {
    fetchPollData();
  }, []);

  // Poll for updates every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPollData(false); // Don't show loading on updates
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const fetchPollData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const response = await fetch('/api/poll');
      if (!response.ok) {
        throw new Error('Failed to fetch poll data');
      }

      const data = await response.json();
      setPollData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleVote = async (optionId: string) => {
    if (hasVoted) return;

    try {
      const response = await fetch('/api/poll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ optionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }

      const updatedData = await response.json();
      setPollData(updatedData);
      
      // Mark as voted in localStorage
      localStorage.setItem('buffipoll-voted', 'true');
      localStorage.setItem('buffipoll-voted-for', optionId);
      setHasVoted(true);
      setVotedFor(optionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    }
  };

  const getPercentage = (votes: number, total: number) => {
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

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
          <button
            onClick={() => fetchPollData()}
            className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!pollData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">BuffiPoll</h1>
          <Link
            href="/admin"
            className="inline-block bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200 text-sm"
          >
            Admin Panel
          </Link>
        </div>

        {/* Poll Question */}
        <div className="bg-white shadow-lg rounded-lg p-6 border-2 border-gray-200 mb-8">
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

        {/* Poll Options */}
        <div className="space-y-4">
          {pollData.options.map((option) => {
            const percentage = getPercentage(option.votes, pollData.totalVotes);
            const isVotedFor = votedFor === option.id;

            return (
              <div key={option.id} className="bg-white shadow-lg rounded-lg p-6 border-2 border-gray-200">
                {!hasVoted ? (
                  // Voting mode
                  <button
                    onClick={() => handleVote(option.id)}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-lg text-2xl transition-colors duration-200 w-full min-h-20 text-left"
                    disabled={hasVoted}
                  >
                    {option.text}
                  </button>
                ) : (
                  // Results mode
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={`text-2xl font-semibold ${isVotedFor ? 'text-green-600' : 'text-gray-800'}`}>
                        {isVotedFor && '✓ '}{option.text}
                      </span>
                      <span className="text-xl font-bold text-gray-600">
                        {percentage}%
                      </span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="bg-gray-200 rounded-lg h-8 overflow-hidden">
                      <div
                        className={`h-full rounded-r-lg transition-all duration-500 ease-out ${isVotedFor ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
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

        {/* Instructions */}
        <div className="mt-8 text-center text-gray-600">
          {!hasVoted ? (
            <p className="text-lg">Click on an option to vote!</p>
          ) : (
            <p className="text-lg">Results update automatically every 2 seconds</p>
          )}
        </div>
      </div>
    </div>
  );
}