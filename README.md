# Metamak Webapp

A modern, AI-powered manufacturing co-pilot web application for interactive part analysis, design feedback, and manufacturing recommendations.

---

## 🚀 Features

- **Interactive Chat Interface**
  - Natural language chat with an AI assistant for manufacturing guidance.
  - Robust error boundaries for smooth user experience.
  - Streamlined onboarding: prompts users to upload files and confirm manufacturing parameters.
  - Real-time feedback and clear error messages.

- **File Upload & Analysis**
  - Upload CAD or PDF files for instant analysis.
  - Automatic detection and prompting based on uploaded files.

- **Manufacturing Parameter Management**
  - Confirm and edit material, subtype, grade, location, and quantity.
  - Temporary and confirmed state management for parameters.
  - Guided flow ensures no legacy/duplicate messages or states.

- **AI-Driven Recommendations**
  - Integrates with GPT for part-specific recommendations and answers.
  - Advanced chat submission logic for seamless user experience.
  - (Planned) Tool integration for process recommendations.

- **Custom Hooks & State Management**
  - Modular state management for user input, chat messages, chat metrics, and theme.
  - Clean, linted, and TypeScript-checked codebase.

- **UI/UX Enhancements**
  - Responsive, modern design with light/dark mode support.
  - Clearly structured chat bubbles for user and assistant.
  - Easy-to-edit manufacturing parameters.

- **Developer Experience**
  - Robust error handling and clear error messages.
  - [.gitignore](cci:7://file:///Users/samarjit/Desktop/project-bolt-sb1/.gitignore:0:0-0:0) for clean version control.
  - Modular, maintainable React + TypeScript codebase.

---

## 🛠️ Getting Started

1. **Clone the repository**
    ```sh
    git clone [https://github.com/Samarjit627/Metamak-Webapp.git](https://github.com/Samarjit627/Metamak-Webapp.git)
    cd Metamak-Webapp
    ```

2. **Install dependencies**
    ```sh
    npm install
    ```

3. **Start the development server**
    ```sh
    npm run dev
    ```

4. **Open in browser**
    - Visit `http://localhost:5173`

---

## 📝 Project Structure
src/components/ # Core React components (ChatInterface, FileUpload, etc.) src/store/ # State management hooks and stores src/utils/ # Utility functions (API, GPT integration, etc.) public/ # Static files and assets

CopyInsert

---

## 🤖 Technologies Used

- **React** (with TypeScript)
- **Vite** (for fast dev/build)
- **Custom Hooks** for state management
- **OpenAI GPT API** (for chat and recommendations)
- **Tailwind CSS** (if used for styling)
- **ESLint/Prettier** for code quality

---

## 📦 Features in Progress / Planned

- Advanced process recommendation tools
- Enhanced metrics and analytics dashboard
- More file types for upload and analysis
- Team collaboration features

---

## 🙌 Contributing

1. Fork the repo and create your branch from `main`.
2. Commit your changes with clear messages.
3. Push to your fork and submit a Pull Request.

---

## 📄 License

MIT License (or specify your license here)

---

all copyrights of this project is reserved by Samarjit
