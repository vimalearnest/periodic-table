import React, { useState } from 'react';

const PeriodicElement = ({ 
  symbol, 
  name, 
  atomicNumber, 
  atomicMass, 
  category = 'other',
  onClick 
}) => {
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
      className={`
        relative w-20 h-20 border-2 ${colorClass}
        cursor-pointer transition-all duration-200
        ${isHovered ? 'scale-110 shadow-lg z-10' : 'shadow'}
        flex flex-col items-center justify-center
        rounded-sm
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="absolute top-0.5 left-1 text-xs font-semibold text-gray-700">
        {atomicNumber}
      </div>
      
      <div className="text-2xl font-bold text-gray-900 mt-1">
        {symbol}
      </div>
      
      <div className="text-xs text-gray-700 font-medium">
        {name}
      </div>
      
      <div className="text-xs text-gray-600 mt-0.5">
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
};

export default PeriodicElement;
