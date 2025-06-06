// materialMemoryEngine.ts
export const saveMaterialSuggestion = async (
  partId: string,
  userQuery: string,
  response: string
) => {
  // Example: Save to localStorage or send to backend
  const key = `materialSuggestion-${partId}`;
  const entry = {
    query: userQuery,
    answer: response,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(key, JSON.stringify(entry)); // or send to server
};
