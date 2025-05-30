import { HelpCircle, Settings, Menu, Sparkles, Box as Box3d, Moon, Sun } from 'lucide-react';
import { useModelStore } from '../store/modelStore';
import { useThemeStore } from '../store/themeStore';

interface TopNavbarProps {
  onAIClick?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = () => {
  const { fileName } = useModelStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  return (
    <div className={`w-full backdrop-blur-md border-b ${
      isDarkMode 
        ? 'bg-gray-900/80 border-gray-700/50' 
        : 'bg-white/80 border-gray-200/50'
    }`}>
      <div className="h-14 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center gap-2">
            <Sparkles className="text-blue-600" size={24} />
            <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Manufacturing Analysis with AI
            </span>
          </div>

          {fileName && (
            <span className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {fileName}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode 
                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className={`p-2 rounded-full transition-colors ${
            isDarkMode 
              ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}>
            <HelpCircle size={20} />
          </button>
          <button className={`p-2 rounded-full transition-colors ${
            isDarkMode 
              ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}>
            <Settings size={20} />
          </button>
          <button className={`p-2 rounded-full transition-colors ${
            isDarkMode 
              ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}>
            <Menu size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};