import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Loader2 } from 'lucide-react';

interface DFMGPTExplanationProps {
  summaryMarkdown: string;
}

export const DFMGPTExplanation: React.FC<DFMGPTExplanationProps> = ({ summaryMarkdown }) => {
  const [userQuery, setUserQuery] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = async () => {
    setLoading(true);
    setError(null);
    setExplanation('');
    try {
      const response = await axios.post('/api/dfm/ai-explanation', {
        dfm_summary_markdown: summaryMarkdown,
        user_query: userQuery,
      });
      setExplanation(response.data.gpt_explanation || 'No explanation received.');
    } catch (err: any) {
      setError('Failed to fetch explanation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4 p-4 bg-yellow-50 rounded-md">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={18} className="text-yellow-600" />
        <span className="font-semibold text-yellow-900">Ask AI for Advanced DFM Explanation</span>
      </div>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          className="flex-1 px-2 py-1 border border-gray-300 rounded"
          placeholder="Ask a question about manufacturability..."
          value={userQuery}
          onChange={e => setUserQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleRequest(); }}
        />
        <button
          onClick={handleRequest}
          disabled={loading || !summaryMarkdown}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
        >
          {loading ? <Loader2 size={16} className="animate-spin mr-1" /> : <Sparkles size={16} className="mr-1" />}
          Ask AI
        </button>
      </div>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      {explanation && (
        <div className="bg-white rounded p-3 mt-2 border border-gray-200 prose max-w-none">
          <ReactMarkdown>{explanation}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default DFMGPTExplanation;
