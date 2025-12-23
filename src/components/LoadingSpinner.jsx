import { useTheme } from '../contexts/ThemeContext';

const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...',
  fullScreen = false 
}) => {
  const { theme } = useTheme();

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'
    : 'flex items-center justify-center min-h-[200px]';

  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2">
          <div 
            className={`rounded-full animate-bounce ${
              theme === 'dark' ? 'bg-amber-400' : 'bg-amber-600'
            } ${sizeClasses[size]}`} 
            style={{ animationDelay: '0ms' }}
          ></div>
          <div 
            className={`rounded-full animate-bounce ${
              theme === 'dark' ? 'bg-amber-400' : 'bg-amber-600'
            } ${sizeClasses[size]}`} 
            style={{ animationDelay: '150ms' }}
          ></div>
          <div 
            className={`rounded-full animate-bounce ${
              theme === 'dark' ? 'bg-amber-400' : 'bg-amber-600'
            } ${sizeClasses[size]}`} 
            style={{ animationDelay: '300ms' }}
          ></div>
        </div>
        {text && (
          <p className={`text-sm font-medium ${textColor}`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;