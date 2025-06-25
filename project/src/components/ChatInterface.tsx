// ChatInterface.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useUserInputStore } from '../store/userInputStore';
import { useModelStore } from '../store/modelStore';
import { useThemeStore } from '../store/themeStore';
import { getGPTResponse } from '../utils/callGPT';
import { useChatStore } from '../store/chatStore';
import { useChatMetricsStore } from '../store/chatMetricsStore';
import { materialCategories } from '../data/materials';
import { manufacturingLocations } from '../data/manufacturingLocations';
import { ModelErrorBoundary } from './ErrorBoundary';
import { runGPTTool } from '../utils/runGPTTool';
import { gptTools } from '../gptTools';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

// ExpandableSection from ChatWithTrust
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


const USER_ID = 'DEMO_USER_123';

export const ChatInterface: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  const { fileName } = useModelStore();
  const { messages, addMessage } = useChatStore();
  const addMetricsMessage = useChatMetricsStore(state => state.addMessage);
  const { isDarkMode } = useThemeStore();

  const [hasConfirmedParams, setHasConfirmedParams] = useState(false);
  const [hasPromptedFunction, setHasPromptedFunction] = useState(false);
  const [lastFileName, setLastFileName] = useState<string | null>(null);
  const [mode, setMode] = useState<'SIMPLE' | 'ADVANCED'>('SIMPLE');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  // Use user input store for parameters (not model store)
  const {
    material: selectedMaterial,
    materialSubtype: selectedMaterialSubtype,
    grade: selectedMaterialGrade,
    location: selectedLocation,
    quantity: productionQuantity,
    setMaterial,
    setMaterialSubtype,
    setGrade,
    setLocation,
    setQuantity
  } = useUserInputStore();

  const [tempMaterial, setTempMaterial] = useState(selectedMaterial);
  const [tempMaterialSubtype, setTempMaterialSubtype] = useState(selectedMaterialSubtype);
  const [tempMaterialGrade, setTempMaterialGrade] = useState(selectedMaterialGrade);
  const [tempLocation, setTempLocation] = useState(selectedLocation);
  const [tempQuantity, setTempQuantity] = useState(productionQuantity);
  const [isEditingParams, setIsEditingParams] = useState(false);

  useEffect(() => {
    if (messages.length === 0 && !fileName) {
      addMessage({
        type: 'assistant',
        content: "Hi! I am your Manufacturing Co-Pilot. Please upload a CAD or PDF file to begin the analysis."
      });
    }
  }, [messages, fileName, addMessage]);

  useEffect(() => {
    if (fileName && fileName !== lastFileName) {
      addMessage({
        type: 'assistant',
        content: `I see you have uploaded ${fileName}. Please confirm the material, location, quantity, and subtype.`
      });
      setLastFileName(fileName);
    }
  }, [fileName, lastFileName, addMessage]);

  useEffect(() => {
    if (hasConfirmedParams && !hasPromptedFunction) {
      addMessage({
        type: 'assistant',
        content: 'Thank you for confirming the parameters. Could you briefly tell me about the functionality of this part and where it will be used?'
      });
      setHasPromptedFunction(true);
    }
  }, [hasConfirmedParams, hasPromptedFunction, addMessage]);

  useEffect(() => {
    if (isOpen && chatInputRef.current) {
      chatInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    addMessage({ type: 'user', content: inputMessage });
    setIsLoading(true);
    setInputMessage('');

    try {
      const response = await getGPTResponse(inputMessage, USER_ID);
      addMessage({ type: 'assistant', content: response.content });
    } catch (err) {
      console.error("GPT Error:", err);
      addMessage({ type: 'assistant', content: '⚠️ Error fetching response.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModelErrorBoundary>
      <div className="flex flex-col h-full w-full">

        {/* Mode Toggle */}
        <div className="px-6 pt-4 pb-2 border-b bg-white dark:bg-gray-900">
          <div className="flex gap-2 items-center">
            <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Mode:</span>
            <button className={`px-2 py-1 rounded text-xs font-medium ${mode === 'SIMPLE' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`} onClick={() => setMode('SIMPLE')}>Simple</button>
            <button className={`px-2 py-1 rounded text-xs font-medium ${mode === 'ADVANCED' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`} onClick={() => setMode('ADVANCED')}>Advanced</button>
          </div>
        </div>

        {/* Parameter Confirmation or Editor */}
        {(!hasConfirmedParams || isEditingParams) && (
          <div className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-900">
            <h3 className="font-medium mb-2">Manufacturing Parameters</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Material</label>
                <select value={tempMaterial} onChange={(e) => {
                  setTempMaterial(e.target.value as any);
                  const category = materialCategories.find(cat => cat.type === e.target.value);
                  if (category && category.options.length > 0) {
                    setTempMaterialSubtype(category.options[0].value);
                    setTempMaterialGrade(category.options[0].grades?.[0]?.grade || '');
                  }
                }} className="w-full px-2 py-1 border rounded">
                  {materialCategories.map(category => (
                    <option key={category.type} value={category.type}>{category.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Subtype</label>
                <select value={tempMaterialSubtype} onChange={(e) => {
                  setTempMaterialSubtype(e.target.value);
                  const option = materialCategories.find(cat => cat.type === tempMaterial)?.options.find(opt => opt.value === e.target.value);
                  if (option && option.grades?.length) {
                    setTempMaterialGrade(option.grades[0].grade);
                  }
                }} className="w-full px-2 py-1 border rounded">
                  {(materialCategories.find(cat => cat.type === tempMaterial)?.options || []).map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Grade</label>
                <select value={tempMaterialGrade} onChange={e => setTempMaterialGrade(e.target.value)} className="w-full px-2 py-1 border rounded">
                  {(materialCategories.find(cat => cat.type === tempMaterial)?.options.find(opt => opt.value === tempMaterialSubtype)?.grades || []).map(grade => (
                    <option key={grade.grade} value={grade.grade}>{grade.grade}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Location</label>
                <select value={tempLocation} onChange={(e) => setTempLocation(e.target.value)} className="w-full px-2 py-1 border rounded">
                  {manufacturingLocations.map(loc => (
                    <option key={loc.city} value={loc.city}>{loc.city}, {loc.state}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Quantity</label>
                <input type="number" value={tempQuantity} onChange={(e) => setTempQuantity(Number(e.target.value))} className="w-full px-2 py-1 border rounded" />
              </div>
              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => {
                  setMaterial(tempMaterial);
                  setMaterialSubtype(tempMaterialSubtype);
                  setGrade(tempMaterialGrade);
                  setLocation(tempLocation);
                  setQuantity(tempQuantity);
                  setHasConfirmedParams(true);
                  setIsEditingParams(false);
                }}>Confirm</button>
                {hasConfirmedParams && (
                  <button className="px-4 py-2 bg-gray-500 text-white rounded" onClick={() => setIsEditingParams(false)}>Cancel</button>
                )}
              </div>
            </div>
          </div>
          )}
        </div>
        {/* Action Buttons */}
        <div className="flex gap-2 px-6 py-2 border-b bg-gray-50 dark:bg-gray-800">
          {['DFM', 'TOOLING', 'COST', 'PROCESS'].map((toolName) => (
            <button
              key={toolName}
              className="px-3 py-1 rounded bg-blue-100 text-blue-800 font-semibold hover:bg-blue-200 transition-colors"
              onClick={async () => {
                setIsLoading(true);
                if (toolName !== 'DFM') {
                  // Legacy logic for other tools
                  try {
                    const tool = gptTools[toolName];
                    if (tool?.functionName) {
                      const result = await runGPTTool(tool.functionName, {});
                      addMessage({ type: 'assistant', content: result.gptSummary || `${toolName} analysis complete.` });
                    } else {
                      addMessage({ type: 'assistant', content: `${toolName} tool is not available.` });
                    }
                  } catch (err) {
                    console.error(`${toolName} Tool Error:`, err);
                    addMessage({ type: 'assistant', content: `⚠️ Error running ${toolName}.` });
                  } finally {
                    setIsLoading(false);
                  }
                  return;
                }
                // --- HYBRID DFM LOGIC START ---
                let backendResult = null;
                let gptResult = null;
                let usedFallback = false;
                let debugLog = '';
                try {
                  // Prepare geometry/process (pseudo, adapt as needed)
                  // You may want to use useModelStore or similar to get geometry
                  let geometry = null;
                  let processType = selectedMaterial || '';
                  if (window?.useModelStore) {
                    const state = window.useModelStore.getState();
                    const selectedParts = state.selectedParts;
                    const currentGeometry = state.currentGeometry;
                    if (selectedParts && selectedParts.length > 0) {
                      const meshPart = selectedParts.find((p) => (p.type === 'Mesh' || p.isMesh) && p.geometry);
                      if (meshPart && meshPart.geometry) {
                        geometry = window.serializeGeometry ? window.serializeGeometry(meshPart.geometry) : meshPart.geometry;
                      }
                    }
                    if (!geometry && currentGeometry) {
                      geometry = window.serializeGeometry ? window.serializeGeometry(currentGeometry) : currentGeometry;
                    }
                    processType = state.selectedProcessType || processType;
                  }
                  if (!geometry) {
                    addMessage({ type: 'assistant', content: '❌ No geometry found for DFM analysis.' });
                    setIsLoading(false);
                    return;
                  }
                  // 1. Call backend
                  try {
                    const res = await fetch('/api/dfm/analysis', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ part_geometry: geometry, process_type: processType })
                    });
                    backendResult = await res.json();
                    debugLog += '[DFM] Backend result received.\n';
                  } catch (err) {
                    debugLog += '[DFM] Backend error: ' + String(err) + '\n';
                  }
                  // Helper to check if key fields are blank
                  function isBlank(val) {
                    return !val || (Array.isArray(val) && val.length === 0) || (typeof val === 'object' && Object.keys(val).length === 0);
                  }
                  const needsFallback = !backendResult ||
                    isBlank(backendResult.holes) && isBlank(backendResult.ribs) && isBlank(backendResult.bosses) &&
                    isBlank(backendResult.grouped) && isBlank(backendResult.recommendations);
                  if (needsFallback) {
                    debugLog += '[DFM] Backend result incomplete or blank. Falling back to GPT tool.\n';
                    try {
                      gptResult = await runGPTTool('DFM', { geometry, processType });
                      usedFallback = true;
                    } catch (err) {
                      debugLog += '[DFM] GPT fallback error: ' + String(err) + '\n';
                    }
                  }
                  // Merge logic: prefer backend, fill blanks from GPT
                  const hybridResult = { ...gptResult, ...backendResult };
                  ['holes','ribs','bosses','grouped','recommendations'].forEach(key => {
                    if (!isBlank(backendResult?.[key]) && backendResult?.[key]) hybridResult[key] = backendResult[key];
                  });
                  // Store for advanced UI rendering (next step)
                  window._lastDFMHybridResult = hybridResult;
                  window._lastDFMDebugLog = debugLog;
                  addMessage({ type: 'assistant', content: '[DFM] Analysis complete. (Advanced UI rendering coming next step.)' });
                } finally {
                  setIsLoading(false);
                }
                // --- HYBRID DFM LOGIC END ---
              }}
            >
              {toolName}
            </button>
          ))}
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3 bg-gray-50 dark:bg-gray-800" style={{ minHeight: '250px', maxHeight: 'calc(100vh - 320px)' }}>
          {messages.map((msg, idx) => {
            if (msg.content === '[DFM] Analysis complete. (Advanced UI rendering coming next step.)' && typeof window !== 'undefined' && window._lastDFMHybridResult) {
              const dfm = window._lastDFMHybridResult;
              // Score/severity helpers
              const getScoreColor = (score: number) => score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-400' : 'bg-red-500';
              const getSeverityLabel = (sev: string) => sev === 'high' ? 'text-red-600' : sev === 'medium' ? 'text-yellow-600' : 'text-green-600';
              // Collapsible raw JSON
              const [showRaw, setShowRaw] = React.useState(false);
              // Feedback state
              const [feedback, setFeedback] = React.useState<'helpful'|'not_helpful'|null>(null);
              // Knowledge proposal state
              const [showProposal, setShowProposal] = React.useState(false);
              const [proposalText, setProposalText] = React.useState('');
              return (
                <div key={idx} className="rounded-lg px-4 py-4 max-w-[85%] bg-white shadow border">
                  {/* 1. DFM Summary */}
                  {dfm.summary_markdown && <div className="mb-2"><ReactMarkdown>{dfm.summary_markdown}</ReactMarkdown></div>}
                  {/* 2. Key metrics */}
                  <div className="flex items-center gap-4 mb-2">
                    {typeof dfm.score === 'number' && <div className="flex items-center gap-1"><span className="font-bold">Score:</span> <span className={`px-2 py-1 rounded text-white ${getScoreColor(dfm.score)}`}>{dfm.score}</span></div>}
                    {dfm.severity && <span className={`font-bold ${getSeverityLabel(dfm.severity)}`}>Severity: {dfm.severity}</span>}
                    {dfm.confidence && <span className="text-xs text-gray-500">Confidence: {dfm.confidence}</span>}
                  </div>
                  {/* 3. Grouped warnings/issues */}
                  {dfm.grouped && Object.keys(dfm.grouped).length > 0 && (
                    <div className="mb-2">
                      {Object.entries(dfm.grouped).map(([group, items]: [string, string[]]) => (
                        <ExpandableSection key={group} label={group} items={items} tooltip={`DFM issues: ${group}`} />
                      ))}
                    </div>
                  )}
                  {/* 4. Recommendations */}
                  {dfm.recommendations && Array.isArray(dfm.recommendations) && dfm.recommendations.length > 0 && (
                    <ExpandableSection label="Recommendations" items={dfm.recommendations} tooltip="DFM Recommendations" alwaysExpanded={false} />
                  )}
                  {/* 5. Markdown explanation */}
                  {dfm.explanation_markdown && <div className="mt-2"><ReactMarkdown>{dfm.explanation_markdown}</ReactMarkdown></div>}
                  {/* 6. Raw JSON details */}
                  <div className="mt-2">
                    <button className="text-xs text-blue-500 underline" onClick={() => setShowRaw(r => !r)}>{showRaw ? 'Hide Raw JSON' : 'Show Raw JSON'}</button>
                    {showRaw && <pre className="bg-gray-100 text-xs mt-1 p-2 rounded max-h-64 overflow-auto">{JSON.stringify(dfm, null, 2)}</pre>}
                  </div>
                  {/* 7. User feedback/knowledge proposal */}
                  <div className="mt-3 flex flex-col gap-2">
                    <div>
                      <span className="font-semibold mr-2">Was this analysis helpful?</span>
                      <button className={`px-2 py-1 rounded mr-2 ${feedback==='helpful'?'bg-green-200':'bg-gray-200'}`} onClick={() => setFeedback('helpful')}>👍 Helpful</button>
                      <button className={`px-2 py-1 rounded ${feedback==='not_helpful'?'bg-red-200':'bg-gray-200'}`} onClick={() => setFeedback('not_helpful')}>👎 Not Helpful</button>
                      {feedback && <span className="ml-2 text-xs text-gray-500">Thank you for your feedback!</span>}
                    </div>
                    <div>
                      <button className="text-xs text-blue-500 underline" onClick={() => setShowProposal(v => !v)}>{showProposal ? 'Hide Knowledge Proposal' : 'Propose Knowledge'}</button>
                      {showProposal && (
                        <form className="mt-2 flex flex-col gap-1" onSubmit={e => {e.preventDefault(); setShowProposal(false); setProposalText('');}}>
                          <textarea className="w-full border rounded p-1 text-xs" rows={2} placeholder="Suggest new DFM knowledge or rules..." value={proposalText} onChange={e => setProposalText(e.target.value)} />
                          <button className="self-end px-2 py-1 bg-blue-600 text-white rounded text-xs mt-1" type="submit">Submit Proposal</button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
            // Default: legacy chat rendering
            return (
              <div key={idx} className={`rounded-lg px-4 py-2 max-w-[85%] whitespace-pre-line ${msg.type === 'user' ? 'ml-auto bg-blue-100' : 'bg-white'}`}>
                {msg.content}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t bg-white dark:bg-gray-900 flex items-center gap-2">
          <textarea
            ref={chatInputRef}
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 resize-none border px-3 py-2 rounded"
            rows={2}
            disabled={isLoading}
          />
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50" disabled={isLoading || !inputMessage.trim()}>
            Send
          </button>
        </form>
      </ModelErrorBoundary>
  );
};

export default ChatInterface;
