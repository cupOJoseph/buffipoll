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

export default function AdminPage() {
  const [pollData, setPollData] = useState<PollData | null>(null);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPollData();
  }, []);

  const fetchPollData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/poll');
      if (!response.ok) {
        throw new Error('Failed to fetch poll data');
      }

      const data = await response.json();
      setPollData(data);
      setQuestion(data.question);
      setOptions(data.options.map((opt: PollOption) => opt.text));
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Failed to fetch poll data');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      showMessage('error', 'Must have at least 2 options');
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const savePoll = async () => {
    if (!question.trim()) {
      showMessage('error', 'Question is required');
      return;
    }

    const validOptions = options.filter(opt => opt.trim().length > 0);
    if (validOptions.length < 2) {
      showMessage('error', 'At least 2 options are required');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/poll', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          options: validOptions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save poll');
      }

      const updatedData = await response.json();
      setPollData(updatedData);
      showMessage('success', 'Poll saved successfully!');
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Failed to save poll');
    } finally {
      setSaving(false);
    }
  };

  const resetVotes = async () => {
    if (!confirm('Are you sure you want to reset all votes? This cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/poll', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to reset votes');
      }

      const updatedData = await response.json();
      setPollData(updatedData);
      showMessage('success', 'Votes reset successfully!');
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Failed to reset votes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">BuffiPoll Admin</h1>
            <p className="text-gray-600 mt-2">Manage your live poll</p>
          </div>
          <Link
            href="/"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
          >
            ← Back to Poll
          </Link>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 border border-green-300 text-green-700'
              : 'bg-red-100 border border-red-300 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Current Poll Stats */}
        {pollData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Poll Status</h2>
            <p className="text-lg text-gray-700 mb-2">
              <strong>Total Votes:</strong> {pollData.totalVotes}
            </p>
            <div className="space-y-2">
              {pollData.options.map((option) => (
                <div key={option.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                  <span className="font-medium">{option.text}</span>
                  <span className="text-gray-600">
                    {option.votes} vote{option.votes !== 1 ? 's' : ''} 
                    ({pollData.totalVotes > 0 ? Math.round((option.votes / pollData.totalVotes) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Poll Editor */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Poll</h2>
          
          {/* Question */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poll Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full text-gray-900 text-lg"
              placeholder="Enter your poll question..."
              maxLength={200}
            />
          </div>

          {/* Options */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Answer Options
            </label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 w-full text-gray-900 flex-1"
                    placeholder={`Option ${index + 1}...`}
                    maxLength={100}
                  />
                  <button
                    onClick={() => removeOption(index)}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
                    disabled={options.length <= 2}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            
            <button
              onClick={addOption}
              className="mt-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
              disabled={options.length >= 6}
            >
              + Add Option
            </button>
            
            {options.length >= 6 && (
              <p className="text-sm text-gray-500 mt-2">Maximum 6 options allowed</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={savePoll}
              disabled={saving}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded transition-colors duration-200 flex-1"
            >
              {saving ? 'Saving...' : 'Save Poll'}
            </button>
            
            <button
              onClick={resetVotes}
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
            >
              Reset Votes
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>• Edit the poll question and options above</li>
            <li>• Click "Save Poll" to update the live poll (this will reset all votes)</li>
            <li>• Use "Reset Votes" to clear votes without changing the question/options</li>
            <li>• Users can only vote once per browser (localStorage)</li>
            <li>• Results update automatically every 2 seconds</li>
          </ul>
        </div>
      </div>
    </div>
  );
}