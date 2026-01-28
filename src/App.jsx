import { useState } from 'react';
import PeriodicElement from './components/PeriodicElement';

function App() {
  const [selectedElement, setSelectedElement] = useState(null);
  
  const elements = [
    { symbol: 'H', name: 'Hydrogen', atomicNumber: 1, atomicMass: '1.008', category: 'nonmetal' },
    { symbol: 'He', name: 'Helium', atomicNumber: 2, atomicMass: '4.003', category: 'noble-gas' },
    { symbol: 'Li', name: 'Lithium', atomicNumber: 3, atomicMass: '6.941', category: 'alkali-metal' },
    { symbol: 'Be', name: 'Beryllium', atomicNumber: 4, atomicMass: '9.012', category: 'alkaline-earth' },
    { symbol: 'C', name: 'Carbon', atomicNumber: 6, atomicMass: '12.01', category: 'nonmetal' },
    { symbol: 'N', name: 'Nitrogen', atomicNumber: 7, atomicMass: '14.01', category: 'nonmetal' },
    { symbol: 'O', name: 'Oxygen', atomicNumber: 8, atomicMass: '16.00', category: 'nonmetal' },
    { symbol: 'F', name: 'Fluorine', atomicNumber: 9, atomicMass: '19.00', category: 'halogen' },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Periodic Table</h1>
      
      <div className="flex flex-wrap gap-4 mb-8">
        {elements.map((element) => (
          <PeriodicElement
            key={element.atomicNumber}
            {...element}
            onClick={() => setSelectedElement(element)}
          />
        ))}
      </div>
      
      {selectedElement && (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold mb-4">{selectedElement.name}</h2>
          <div className="space-y-2 text-gray-700">
            <p><span className="font-semibold">Symbol:</span> {selectedElement.symbol}</p>
            <p><span className="font-semibold">Atomic Number:</span> {selectedElement.atomicNumber}</p>
            <p><span className="font-semibold">Atomic Mass:</span> {selectedElement.atomicMass}</p>
            <p><span className="font-semibold">Category:</span> {selectedElement.category.replace('-', ' ')}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
