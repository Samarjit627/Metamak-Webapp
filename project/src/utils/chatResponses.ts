import { useModelStore } from '../store/modelStore';
import { analyzeUserInput } from './chatAnalysis';
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:chatResponses');

// Updated sequence of questions
const questions = [
  "Let's start with the basics — what exactly does this part do in your product?",
  "Is this part a standalone component, or will it be assembled with other parts in a system?",
  "Would you say this part is mostly structural, purely aesthetic, or a mix of both?",
  "Will the part be exposed to outdoor conditions, UV light, moisture, or chemicals?",
  "Do you expect it to handle any mechanical stress, vibration, or repeated motion?",
  "Are you considering any specific materials like metal, plastic, or biocompatible materials? Or should I suggest some?",
  "Should this part look polished — like visible to end-users — or is it more internal and functional?",
  "Do you need a specific surface finish (e.g., matte, glossy, VDI texture, or Ra value)?",
  "Would you prefer to optimize for lower cost, longer durability, or a balanced tradeoff?",
  "Do you have a per-unit target cost or are you exploring a few options?",
  "How long should this part last in real-world use — months, years, or more?",
  "Will this part be reused across multiple products or is it project-specific?",
  "Is recyclability or sustainability important for this design?",
  "Does this part need to interface with electronics, fluids, or moving mechanisms?",
  "Would you like me to generate your custom manufacturing insights and recommendations now?"
];

export function generateManufacturingResponse(input: string, messageCount: number): string {
  logger('Generating manufacturing response:', { input, messageCount });

  const { modelFile } = useModelStore.getState();

  // No model uploaded yet
  if (!modelFile) {
    logger('No model file uploaded');
    return "Please upload a CAD model so I can provide specific recommendations for your part.";
  }

  // First message - Welcome and first question
  if (messageCount === 0) {
    logger('Sending initial welcome message');
    return `Welcome! I'll help you analyze your part for manufacturing. Let's start with the first question:\n\n${questions[0]}`;
  }

  // Analyze user input
  const analysis = analyzeUserInput(input);
  logger('User input analysis:', analysis);
  
  // Calculate current question index
  // We subtract 1 from messageCount to account for the initial welcome message
  // Then divide by 2 since each Q&A takes 2 messages (question + answer)
  const currentQuestionIndex = Math.floor((messageCount - 1) / 2);

  // All questions answered, provide final analysis
  if (currentQuestionIndex >= questions.length) {
    logger('All questions answered, generating final recommendations');
    return generateFinalRecommendations();
  }

  // Process the user's answer and provide context-aware follow-up
  let response = "";
  
  // Add contextual acknowledgment based on the previous question
  switch (currentQuestionIndex) {
    case 0: // After purpose question
      response = "I understand the part's purpose. ";
      break;
    case 1: // After assembly context
      response = "Got it regarding the assembly context. ";
      break;
    case 2: // After structural/aesthetic
      response = "Thanks for clarifying the part's role. ";
      break;
    case 3: // After environmental conditions
      response = "Noted the environmental requirements. ";
      break;
    case 4: // After mechanical stress
      response = "Understood the mechanical requirements. ";
      break;
    case 5: // After material preferences
      response = "Thanks for the material input. ";
      break;
    case 6: // After aesthetics
      response = "Got it regarding the appearance requirements. ";
      break;
    case 7: // After surface finish
      response = "Noted the surface finish needs. ";
      break;
    case 8: // After optimization preference
      response = "Understood your optimization priorities. ";
      break;
    case 9: // After target cost
      response = "Thanks for the cost information. ";
      break;
    case 10: // After lifespan
      response = "Got it regarding the expected lifespan. ";
      break;
    case 11: // After product reuse
      response = "Understood the reusability requirements. ";
      break;
    case 12: // After sustainability
      response = "Noted the sustainability considerations. ";
      break;
    case 13: // After interfaces
      response = "Thanks for clarifying the interface requirements. ";
      break;
    default:
      response = "Thank you for that information. ";
  }

  // Add the next question
  response += `\n\n${questions[currentQuestionIndex + 1]}`;

  logger('Generated response:', response);
  return response;
}

function generateFinalRecommendations(): string {
  logger('Generating final recommendations');
  return "Thank you for providing all the information. I'll now generate a comprehensive manufacturing report that includes:\n\n" +
    "1. Recommended Manufacturing Processes\n" +
    "2. Material Selection Analysis\n" +
    "3. Cost Optimization Strategies\n" +
    "4. Quality Control Requirements\n" +
    "5. Production Timeline Estimates\n" +
    "6. Sustainability Considerations\n\n" +
    "Would you like me to generate the detailed report now?";
}