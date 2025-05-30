# Project Bolt: Technical Architecture & Codebase Overview

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Core Modules](#core-modules)
   - [Components](#components)
   - [Advisors](#advisors)
   - [Agents](#agents)
   - [Chat](#chat)
   - [Data](#data)
   - [Functions](#functions)
   - [GPT & GPT Tools](#gpt--gpt-tools)
   - [Hooks](#hooks)
   - [Lib](#lib)
   - [Store](#store)
   - [Types](#types)
   - [Utils](#utils)
3. [Application Flow](#application-flow)
4. [Key Features](#key-features)
5. [Entry Points & Bootstrapping](#entry-points--bootstrapping)
6. [Testing](#testing)
7. [Configuration & Build](#configuration--build)
8. [Summary](#summary)

---

## Project Structure

```
project-bolt-sb1/
└── project/
    ├── .bolt/
    ├── dist/
    ├── node_modules/
    ├── public/
    ├── scripts/
    ├── src/
    │   ├── advisors/
    │   ├── agents/
    │   ├── chat/
    │   ├── components/
    │   ├── data/
    │   ├── functions/
    │   ├── gpt/
    │   ├── gptTools/
    │   ├── hooks/
    │   ├── lib/
    │   ├── store/
    │   ├── tests/
    │   ├── types/
    │   └── utils/
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── ...
```

---

## Core Modules

### Components

- **Purpose:** UI building blocks for the app, including the chat interface, toolbars, analysis panels, modals, and 3D viewers.
- **Key Files:**
  - `ChatInterface.tsx`: Main chat UI, handles user input, message display, and integration with advisors and cost estimation.
  - `Model.tsx`, `Viewer3D.tsx`, `FloatingViewer.tsx`: 3D model and CAD visualization.
  - `BOMPanel.tsx`, `CostAnalysisPanel.tsx`, `ManufacturingAnalysisPanel.tsx`: Specialized panels for engineering/manufacturing data.
  - `AIRecommendationsPanel.tsx`, `DFMHeatmapModal.tsx`, `PartAnalysisModal.tsx`: Advanced analysis and feedback UI.

### Advisors

- **Purpose:** Provide smart suggestions and feedback based on manufacturing metadata and user input.
- **Key Files:**
  - `smartAdvisor.tsx`: Core logic for generating manufacturing advice.
  - `smartAdvisor.test.tsx`: Tests for advisor logic.

### Agents

- **Purpose:** Autonomous or semi-autonomous modules for planning, design revision, and DFM (Design for Manufacturability) assistance.
- **Key Files:**
  - `autoManufacturingPlanAgent.ts`, `designRevisionAgent.ts`, `dfmAssistant.ts`: Implement agent logic for various tasks.

### Chat

- **Purpose:** Chat-related logic, including hybrid interfaces, message handling, and chat-specific functions.
- **Key Files:**
  - `HybridChatInterface.tsx`: Alternative chat UI.
  - `messageHandlers.ts`: Centralized message processing.
  - `functions/`: Chat-specific utility functions.

### Data

- **Purpose:** Static or semi-static data for manufacturing, materials, locations, vendors, etc.
- **Key Files:**
  - `materials.ts`, `manufacturingLocations.ts`, `vendors.ts`: Lookup tables and configuration for manufacturing domain.

### Functions

- **Purpose:** Backend-like logic for DFM risk analysis, mapping, and utility functions.
- **Key Files:**
  - `analyzeDFMRisksWithGPT.ts`, `dfmRiskFunctions.ts`, `mapDFMRisksToGeometry.ts`: Analysis and mapping logic.

### GPT & GPT Tools

- **Purpose:** Integration with GPT models for cost estimation, process optimization, and advanced reasoning.
- **Key Files:**
  - `gptFunctions.ts`, `gptFunctionRouter.ts`, `toolingEstimator.ts`, `costOptimizer.ts`: Orchestrate GPT-powered workflows.

### Hooks

- **Purpose:** Custom React hooks for state and effect management.
- **Key Files:**
  - `useModelLoader.ts`, `useVersionStore.ts`: Manage model loading and versioning.

### Lib

- **Purpose:** External libraries and wrappers.
- **Key Files:**
  - `supabase.ts`: Placeholder for Supabase client integration.

### Store

- **Purpose:** State management using Zustand.
- **Key Files:**
  - `chatStore.ts`, `chatMetricsStore.ts`, `modelStore.ts`, `themeStore.ts`, `userInputStore.ts`: Manage global and scoped state.

### Types

- **Purpose:** TypeScript type definitions.
- **Key Files:**
  - `database.types.ts`: Types for Supabase and data models.

### Utils

- **Purpose:** Utility functions for analysis, formatting, AI integration, and more.
- **Key Files:**
  - `chatAnalysis.ts`, `costEstimator.ts`, `featureRecognition.ts`, `geometryAnalysis.ts`, `manufacturingAnalysis.ts`, etc.

---

## Application Flow

1. **App Initialization**
   - Entry point: `src/main.tsx` mounts the React app, loading `App.tsx`.
   - Global state is initialized via Zustand stores.

2. **User Interaction**
   - User interacts with the chat interface (`ChatInterface.tsx`).
   - Messages are processed, triggering advisors, agents, or GPT tools as needed.

3. **Smart Advisor & Agents**
   - Advisors analyze user input and manufacturing metadata to provide suggestions.
   - Agents can perform autonomous planning, DFM analysis, or design revisions.

4. **Manufacturing Analysis**
   - Data and utility modules analyze parts, estimate costs, and generate DFM feedback.
   - 3D viewers and analysis panels visualize models and results.

5. **State Management**
   - All major user and app state is managed via Zustand stores in `src/store/`.

6. **Output & Feedback**
   - Results are shown in the chat, panels, and modals.
   - Users can upload files, receive PDF analyses, and interact with advanced tooling.

---

## Key Features

- **Hybrid Chat Interface:** Combines simple and advanced chat modes for user flexibility.
- **Smart Manufacturing Advisor:** Context-aware suggestions for manufacturability and cost.
- **Cost Estimation:** Uses GPT and custom logic for accurate manufacturing cost predictions.
- **DFM Analysis:** Automated detection of manufacturability risks and suggestions.
- **3D Model Viewer:** Interactive visualization of CAD models and analysis overlays.
- **Agentic Workflows:** Agents can autonomously revise designs or generate manufacturing plans.
- **User State & Metrics:** Tracks user actions, preferences, and chat metrics for analytics.

---

## Entry Points & Bootstrapping

- **index.html:** Root HTML file, contains the `#root` div for React.
- **main.tsx:** React entry point, mounts `App.tsx`.
- **App.tsx:** Top-level component, sets up routes, theme, and global providers.

---

## Testing

- **Unit Tests:** Present in `advisors/` and `utils/`.
- **Test Examples:** `smartAdvisor.test.tsx`, `costUtils.test.ts`, `toolingEstimator.test.ts`.

---

## Configuration & Build

- **Vite:** Fast dev server and build tool (`vite.config.ts`).
- **TypeScript:** Strict typing and config via `tsconfig.json`.
- **Tailwind CSS:** Utility-first CSS framework (`tailwind.config.js`).
- **ESLint:** Linting and code quality (`eslint.config.js`).

---

## Summary

Project Bolt is a sophisticated, modular platform for manufacturing analysis, leveraging AI, GPT, and advanced UI/UX. Its architecture is highly componentized, with clear separation of concerns between UI, state, logic, and data. The chat interface is the main user entry point, tightly integrated with smart advisors, agents, and manufacturing analysis tools.

---

**If you want a deeper dive into any specific file, workflow, or feature, let me know!**
I can also generate diagrams or more detailed docs for any module or function.
