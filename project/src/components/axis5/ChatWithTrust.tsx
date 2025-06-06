// ChatWithTrust.tsx – Trust-enhanced chat UI for Axis5

import React, { useState } from 'react'
import axios from 'axios'

const ChatWithTrust = () => {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [source, setSource] = useState('')
  const [citations, setCitations] = useState<any[]>([])
  const [showCitations, setShowCitations] = useState(false)
  const [showProposeForm, setShowProposeForm] = useState(false)
  const [proposedEntry, setProposedEntry] = useState({
    text: '',
    source: '',
    tag: 'dfm_rule',
    material: '',
    process: ''
  })
  const [submitMessage, setSubmitMessage] = useState('')
  const [answerFeedback, setAnswerFeedback] = useState<string | null>(null)
  const [citationFeedback, setCitationFeedback] = useState<{[k:number]:string}>({})

  const sendFeedback = async (type: 'answer'|'citation', value: 'up'|'down', idx?: number) => {
    try {
      await axios.post('http://localhost:5050/feedback', {
        type,
        value,
        query,
        response,
        citation: idx !== undefined ? citations[idx] : undefined
      })
      if (type === 'answer') setAnswerFeedback(value)
      if (type === 'citation' && idx !== undefined) setCitationFeedback(prev => ({...prev, [idx]: value}))
    } catch {}
  }

  const handleAsk = async () => {
    setLoading(true)
    try {
      const res = await axios.post('http://localhost:5050/ask', { query })
      setResponse(res.data.response)
      setSource(res.data.source)
      setCitations(res.data.citations || [])
      setShowCitations(false)
    } catch (err) {
      setResponse('❌ Failed to fetch response.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 max-w-2xl bg-white border shadow rounded-xl">
      <h2 className="text-xl font-bold mb-2">Ask Axis5 with Confidence</h2>
      <input
        type="text"
        placeholder="e.g., Best process for transparent plastic lens"
        className="w-full border rounded p-2 mb-2"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        onClick={handleAsk}
        disabled={loading || !query}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? 'Thinking…' : 'Ask'}
      </button>

      {response && (
        <div className="mt-4 border-t pt-4">
          <p className="text-gray-800 whitespace-pre-line">{response}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500">Was this answer helpful?</span>
            <button
              className={`text-lg px-1 ${answerFeedback==='up'?'text-green-600':'text-gray-400'}`}
              disabled={!!answerFeedback}
              onClick={() => sendFeedback('answer', 'up')}
              title="Helpful"
            >👍</button>
            <button
              className={`text-lg px-1 ${answerFeedback==='down'?'text-red-600':'text-gray-400'}`}
              disabled={!!answerFeedback}
              onClick={() => sendFeedback('answer', 'down')}
              title="Not Helpful"
            >👎</button>
            {answerFeedback && <span className="text-xs text-gray-400 ml-2">Thank you for your feedback!</span>}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-medium">Confidence:</span> 
            <div className="w-full h-2 bg-gray-200 rounded mt-1">
              <div className="h-2 bg-green-500 rounded" style={{ width: '85%' }}></div>
            </div>
            <span className="text-xs text-gray-400">🔎 Based on: {source}</span>
            <div className="text-xs mt-2 text-blue-500 cursor-pointer" onClick={() => setShowCitations(!showCitations)}>
              {showCitations ? 'Hide citations ▲' : 'Show exact citations ▼'}
            </div>
            {showCitations && citations.length > 0 && (
              <div className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded">
                {citations.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span>• {c.text} – {c.source}</span>
                    <button
                      className={`text-xs ${citationFeedback[idx]==='up'?'text-green-600':'text-gray-400'}`}
                      disabled={!!citationFeedback[idx]}
                      onClick={() => sendFeedback('citation', 'up', idx)}
                      title="Cite is helpful"
                    >👍</button>
                    <button
                      className={`text-xs ${citationFeedback[idx]==='down'?'text-red-600':'text-gray-400'}`}
                      disabled={!!citationFeedback[idx]}
                      onClick={() => sendFeedback('citation', 'down', idx)}
                      title="Cite is not helpful"
                    >👎</button>
                    {citationFeedback[idx] && <span className="text-gray-400 ml-1">Thanks!</span>}
                  </div>
                ))}
              </div>
            )}
            <div className="text-xs mt-2 text-blue-500 cursor-pointer" title="This answer was generated using recent reflections and verified sources in Axis5">
              Why this answer?
            </div>
          </div>
            <div className="text-xs mt-4 text-blue-500 cursor-pointer" onClick={() => setShowProposeForm(!showProposeForm)}>
              {showProposeForm ? 'Hide Propose Knowledge ▲' : '➕ Propose Knowledge'}
            </div>
            {showProposeForm && (
              <div className="mt-2 text-xs text-gray-700 bg-blue-50 p-3 rounded">
                <textarea
                  className="w-full border rounded p-1 mb-2"
                  rows={2}
                  value={proposedEntry.text}
                  onChange={(e) => setProposedEntry({ ...proposedEntry, text: e.target.value })}
                />
                <input
                  placeholder="Source"
                  className="w-full border rounded p-1 mb-1"
                  value={proposedEntry.source}
                  onChange={(e) => setProposedEntry({ ...proposedEntry, source: e.target.value })}
                />
                <input
                  placeholder="Material"
                  className="w-full border rounded p-1 mb-1"
                  value={proposedEntry.material}
                  onChange={(e) => setProposedEntry({ ...proposedEntry, material: e.target.value })}
                />
                <input
                  placeholder="Process"
                  className="w-full border rounded p-1 mb-1"
                  value={proposedEntry.process}
                  onChange={(e) => setProposedEntry({ ...proposedEntry, process: e.target.value })}
                />
                <button
                  onClick={async () => {
                    try {
                      await axios.post('http://localhost:5000/append_entry', proposedEntry)
                      setSubmitMessage('✅ Proposed knowledge submitted!')
                    } catch (err) {
                      setSubmitMessage('❌ Failed to submit proposal.')
                    }
                  }}
                  className="px-3 py-1 mt-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Submit Proposal
                </button>
                {submitMessage && <p className="text-xs mt-1 text-gray-600">{submitMessage}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatWithTrust
