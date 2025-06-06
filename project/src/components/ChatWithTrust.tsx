// ChatWithTrust.tsx – Trust-enhanced chat UI for Axis5

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios'
import { useModelStore } from '../store/modelStore'
import { serializeGeometry } from '../utils/geometrySerialization'

// Expandable section for DFM features
const ExpandableSection: React.FC<{label: string, items: string[], tooltip: string, alwaysExpanded?: boolean}> = ({label, items, tooltip, alwaysExpanded}) => {
  const [expanded, setExpanded] = React.useState(false);
  const showExpand = items.length > 3 && !alwaysExpanded;
  const isExpanded = alwaysExpanded || expanded;
  return (
    <div className="mt-2">
      <b>{label}:</b>
      {showExpand && (
        <button
          className="ml-2 text-xs text-blue-500 underline"
          title={isExpanded ? 'Collapse' : 'Expand'}
          onClick={() => setExpanded(e => !e)}
        >
          {isExpanded ? 'Show Less ▲' : `Show All (${items.length}) ▼`}
        </button>
      )}
      <ul className="list-disc pl-6" title={tooltip}>
        {(isExpanded ? items : items.slice(0,3)).map((f: string, i: number) => <li key={i}>{f}</li>)}
        {!isExpanded && items.length > 3 && <li>... and {items.length - 3} more</li>}
      </ul>
    </div>
  );
};

const ChatWithTrust = () => {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDFMDetails, setShowDFMDetails] = useState(false);
  const [dfmResult, setDFMResult] = useState<any | null>(null);

  // Helper: map severity to color
  function severityColor(severity: string) {
    switch ((severity||'').toLowerCase()) {
      case 'high': return 'bg-red-600 text-white';
      case 'medium': return 'bg-yellow-400 text-gray-900';
      case 'low': return 'bg-green-600 text-white';
      default: return 'bg-gray-400 text-white';
    }
  }
  // Helper: map score to color and label
  function scoreColor(score: string) {
    const s = parseInt((score||'').toString().replace(/[^0-9]/g, ''));
    if (s >= 90) return 'bg-green-600';
    if (s >= 70) return 'bg-yellow-400';
    if (s >= 40) return 'bg-orange-400';
    return 'bg-red-600';
  }
  function scoreLabel(score: string) {
    const s = parseInt((score||'').toString().replace(/[^0-9]/g, ''));
    if (s >= 90) return 'Excellent';
    if (s >= 70) return 'Good';
    if (s >= 40) return 'Fair';
    if (!isNaN(s)) return 'Poor';
    return 'N/A';
  }

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

  // Geometry extraction from model store
  const selectedParts = useModelStore(state => state.selectedParts)
  const currentGeometry = useModelStore(state => state.currentGeometry)
  const setDFMRisks = useModelStore(state => state.setDFMRisks)

  const sendFeedback = async (type: 'answer'|'citation', value: 'up'|'down') => {
    try {
      await axios.post('http://localhost:5000/feedback', {
        type,
        value,
        query,
        response
      })
      if (type === 'answer') setAnswerFeedback(value)
      // No citation or source logic remains; all state and setters are removed
    } catch {}
  }

  const handleAsk = async () => {
    setLoading(true);
    try {
      // Prefer selected part geometry, fallback to currentGeometry
      let geometryJSON = null;
      let processType = null;
      if (selectedParts && selectedParts.length > 0) {
        const meshPart = selectedParts.find(
          (p: any) => (p.type === 'Mesh' || p.isMesh) && p.geometry
        );
        if (meshPart && meshPart.geometry) {
          geometryJSON = serializeGeometry(meshPart.geometry);
        }
      }
      if (!geometryJSON && currentGeometry) {
        geometryJSON = serializeGeometry(currentGeometry);
      }
      // Use selected process type from dropdown
      processType = selectedProcessType || null;
      if (!geometryJSON) {
        setResponse('❌ No geometry found for DFM analysis. Please upload a model or select a part.');
        setDFMResult(null);
        setLoading(false);
        return;
      }
      if (!processType) {
        setResponse('❌ No process type found for DFM analysis. Please select a process.');
        setDFMResult(null);
        setLoading(false);
        return;
      }
      // Call new backend endpoint
      let res;
      try {
        res = await axios.post('/api/dfm/analysis', {
          part_geometry: geometryJSON,
          process_type: processType
        }, { timeout: 20000 });
      } catch (err: any) {
        if (err.code === 'ECONNABORTED') {
          setResponse('❌ DFM analysis timed out. The server took too long to respond. Please try again or check backend logs.');
        } else if (err.response && err.response.data && err.response.data.error) {
          setResponse('❌ Backend error: ' + err.response.data.error);
        } else {
          setResponse('❌ Failed to fetch response. Please check your backend server and network connection.');
        }
        setDFMResult(null);
        setLoading(false);
        return;
      }
      setDFMResult(res.data);
      setResponse('');
      ('DFM Engine');
      ([]);
      (false);
      if (res.data.risks) {
        setDFMRisks(res.data.risks);
      }
    } catch (err) {
      setResponse('❌ Failed to fetch response.');
      setDFMResult(null);
    } finally {
      setLoading(false);
    }
  }

  // Supported process types (from backend memory)
  const processTypes = [
    'cnc', 'injection_molding', 'sheet_metal', 'blow_molding', 'casting', 'compression_molding', 'die_casting', 'fdm', 'insert_molding', 'overmolding', 'post_processing', 'sla', 'sls', 'stamping', 'thermoforming', 'turning', 'vacuum_forming', 'welding', 'wood_turning'
  ];
  // Local state for selected process type
  const [selectedProcessType, setSelectedProcessType] = useState<string>("");
  // Preselect process type if available on part
  React.useEffect(() => {
    if (selectedParts && selectedParts.length > 0) {
      const meshPart = selectedParts.find((p: any) => (p.type === 'Mesh' || p.isMesh) && p.geometry);
      if (meshPart && (meshPart.processType || meshPart.process)) {
        setSelectedProcessType(meshPart.processType || meshPart.process);
      }
    }
  }, [selectedParts]);

  return (
    <div className="p-4 max-w-2xl bg-white border shadow rounded-xl">
      <h2 className="text-xl font-bold mb-2">Ask Axis5 with Confidence</h2>
      {/* Process type dropdown */}
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1">Process Type for DFM Analysis</label>
        <select
          className="w-full border rounded p-2"
          value={selectedProcessType}
          onChange={e => setSelectedProcessType(e.target.value)}
        >
          <option value="">Select process...</option>
          {processTypes.map(pt => (
            <option key={pt} value={pt}>{pt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
          ))}
        </select>
      </div>
      <input
        type="text"
        placeholder="e.g., Best process for transparent plastic lens"
        className="w-full border rounded p-2 mb-2"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        onClick={handleAsk}
        disabled={loading || !query || !selectedProcessType}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? 'Thinking…' : 'Ask'}
      </button>

      {(dfmResult || response) && (
  <div className="mt-4 border-t pt-4">
    {/* Enhanced DFM summary from backend */}
    {dfmResult ? (
      <div className="mb-2">
        <span className="font-semibold text-blue-700">🔍 DFM Analysis Results:</span>
        <div className="mt-2 prose max-w-none">
          <ReactMarkdown>{dfmResult.summary_markdown || ''}</ReactMarkdown>
        </div>
        {dfmResult.score && (
          <div className="flex items-center gap-3 mt-2">
            <span className="font-bold">Manufacturability Score:</span>
            <span className="text-lg">{dfmResult.score}</span>
            <div className="w-32 bg-gray-200 rounded h-2 relative">
              <div className={`h-2 rounded ${scoreColor(dfmResult.score)}`} style={{ width: dfmResult.score + '%' }}></div>
              <span className="absolute right-1 text-xs text-gray-600 top-0">{scoreLabel(dfmResult.score)}</span>
            </div>
          </div>
        )}
        {dfmResult.severity && (
          <div className="flex items-center gap-2 mt-1">
            <span className="font-bold">Severity:</span>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${severityColor(dfmResult.severity)}`}>{dfmResult.severity}</span>
          </div>
        )}
        {/* Grouped issues */}
        {dfmResult.grouped && Object.keys(dfmResult.grouped).length > 0 &&
          (Object.entries(dfmResult.grouped) as [string, string[]][]).map(([group, items]) => (
            <ExpandableSection key={group} label={group} items={items} tooltip={`DFM issues in group: ${group}`} />
          ))} // Type assertion for grouped entries
        {/* Recommendations */}
        {dfmResult.recommendations && dfmResult.recommendations.length > 0 && (
          <ExpandableSection label="Recommendations" items={dfmResult.recommendations} tooltip="Actionable suggestions to improve manufacturability" alwaysExpanded />
        )}
        <button
          className="mt-2 text-xs text-blue-500 underline"
          onClick={() => setShowDFMDetails((v: boolean) => !v)}
        >
          {showDFMDetails ? 'Hide Details ▲' : 'Show Full DFM Details ▼'}
        </button>
        {showDFMDetails && (
          <pre className="bg-gray-100 p-2 mt-2 rounded text-xs text-gray-700 overflow-x-auto max-h-48 whitespace-pre-wrap">
            {JSON.stringify(dfmResult, null, 2)}
          </pre>
        )}
      </div>
    ) : (
      // Fallback: legacy string summary
      <p className="text-gray-800 whitespace-pre-line">{response}</p>
    )}
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
      <span className="text-xs text-gray-400">🔎 Based on: Enhanced DFM backend</span>
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
)}
    </div>
  )
}

export default ChatWithTrust
