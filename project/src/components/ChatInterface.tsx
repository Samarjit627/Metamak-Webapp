// ChatInterface.tsx

import React, { useState, useEffect, useRef } from 'react';

import { useUserInputStore } from '../store/userInputStore';
import { useThemeStore } from '../store/themeStore';
import { getGPTResponse } from '../utils/callGPT';
import { useChatStore } from '../store/chatStore';
import { useChatMetricsStore } from '../store/chatMetricsStore';
import { materialCategories } from '../data/materials';
import { manufacturingLocations } from '../data/manufacturingLocations';
import { ModelErrorBoundary } from './ErrorBoundary';
import { runGPTTool } from '../utils/runGPTTool';
import { gptTools } from '../gptTools';

const USER_ID = 'DEMO_USER_123';

export const ChatInterface: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  const { fileName } = useUserInputStore();
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

        {/* Action Buttons */}
        <div className="flex gap-2 px-6 py-2 border-b bg-gray-50 dark:bg-gray-800">
          {['DFM', 'TOOLING', 'COST', 'PROCESS'].map((toolName) => (
            <button
              key={toolName}
              className="px-3 py-1 rounded bg-blue-100 text-blue-800 font-semibold hover:bg-blue-200 transition-colors"
              onClick={async () => {
                setIsLoading(true);
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
              }}
            >
              {toolName}
            </button>
          ))}
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3 bg-gray-50 dark:bg-gray-800" style={{ minHeight: '250px', maxHeight: 'calc(100vh - 320px)' }}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`rounded-lg px-4 py-2 max-w-[85%] whitespace-pre-line ${msg.type === 'user' ? 'ml-auto bg-blue-100' : 'bg-white'}`}>
              {msg.content}
            </div>
          ))}
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
      </div>
    </ModelErrorBoundary>
  );
};

export default ChatInterface;
