import { dfmAssistant } from "../agents/dfmAssistant";
import { useChatStore } from "../store/chatStore";
import { useModelStore } from "../store/modelStore";
import debug from 'debug';

// Initialize debug logger
export const logger = debug('app:messageHandlers');

export async function handleDFMButtonClick() {
  try {
    logger('DFM button clicked');
    
    const { addMessage } = useChatStore.getState();
    const { selectedParts } = useModelStore.getState();
    
    if (!selectedParts || selectedParts.length === 0) {
      logger('No part selected for DFM analysis');
      addMessage({
        type: 'assistant',
        content: "Please select a part first to analyze DFM risks.",
        id: Date.now().toString(),
        timestamp: new Date()
      });
      return;
    }
    
    // Show loading message
    addMessage({
      type: 'user',
      content: "Can you check DFM risks for this part?",
      id: Date.now().toString(),
      timestamp: new Date()
    });
    
    logger('Calling DFM assistant');
    await dfmAssistant(selectedParts[0]);
    
    logger('DFM analysis completed and displayed');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error handling DFM button click:', errorMsg);
    
    const { addMessage } = useChatStore.getState();
    addMessage({
      type: 'assistant',
      content: `I encountered an error while analyzing DFM risks: ${errorMsg}. Please try again.`,
      id: Date.now().toString(),
      timestamp: new Date()
    });
  }
}