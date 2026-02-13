import React, { useState, forwardRef } from 'react';

const PeriodicElement = forwardRef(({
  symbol,
  name,
  atomicNumber,
  atomicMass,
  category = 'other',
  highlighted = false,
  dimmed = false,
  onClick
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const categoryColors = {
    'alkali-metal': 'bg-red-100 border-red-400',
    'alkaline-earth': 'bg-orange-100 border-orange-400',
    'transition-metal': 'bg-yellow-100 border-yellow-400',
    'post-transition': 'bg-green-100 border-green-400',
    'metalloid': 'bg-teal-100 border-teal-400',
    'nonmetal': 'bg-blue-100 border-blue-400',
    'halogen': 'bg-purple-100 border-purple-400',
    'noble-gas': 'bg-pink-100 border-pink-400',
    'lanthanide': 'bg-indigo-100 border-indigo-400',
    'actinide': 'bg-violet-100 border-violet-400',
    'other': 'bg-gray-100 border-gray-400'
  };

  const colorClass = categoryColors[category] || categoryColors['other'];
  
  return (
    <div
      ref={ref}
      tabIndex={0}
      role="button"
      aria-label={`${name}, atomic number ${atomicNumber}`}
      className={`
        relative border-2 ${colorClass}
        cursor-pointer transition-all duration-200
        ${isHovered ? 'scale-110 shadow-lg z-10' : 'shadow'}
        ${highlighted ? 'border-blue-500 border-3' : ''}
        ${dimmed ? 'opacity-30' : ''}
        flex flex-col items-center justify-center
        rounded-sm overflow-hidden
        focus:outline-none focus:ring-3 focus:ring-blue-600 focus:ring-offset-2 focus:scale-110 focus:shadow-lg focus:z-10
      `}
      style={{ width: 'var(--element-size)', height: 'var(--element-size)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="absolute top-0 left-0.5 text-[0.5rem] sm:text-xs font-semibold text-gray-700">
        {atomicNumber}
      </div>

      <div className="text-sm sm:text-xl md:text-2xl font-bold text-gray-900 mt-1">
        {symbol}
      </div>

      <div className="text-[0.4rem] sm:text-xs text-gray-700 font-medium truncate max-w-full px-0.5">
        {name}
      </div>

      <div className="text-[0.35rem] sm:text-xs text-gray-600 hidden sm:block">
        {atomicMass}
      </div>

      {isHovered && (
        <div className="absolute top-full mt-2 bg-gray-900 text-white text-sm px-3 py-2 rounded shadow-lg whitespace-nowrap z-20">
          <div className="font-semibold">{name}</div>
          <div className="text-xs mt-1">Category: {category.replace('-', ' ')}</div>
        </div>
      )}
    </div>
  );
});

export default PeriodicElement;
