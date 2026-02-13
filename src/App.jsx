import { useState, useEffect, useRef } from 'react';
import PeriodicElement from './components/PeriodicElement';
import { elements, categories, categoryColors, commonCompounds } from './data/elements';

function App() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [hasMatchesBelowFold, setHasMatchesBelowFold] = useState(false);
  const lanthanidesRef = useRef(null);

  const mainElements = elements.filter(el => !el.series);
  const lanthanides = elements.filter(el => el.series === 'lanthanide');
  const actinides = elements.filter(el => el.series === 'actinide');

  const getElementAt = (period, group) =>
    mainElements.find(el => el.period === period && el.group === group);

  const matchesSearch = (el) => {
    if (!search.trim()) return true;
    return el.name.toLowerCase().startsWith(search.toLowerCase());
  };

  const isHighlighted = (el) => {
    if (!search.trim()) return false;
    return el.name.toLowerCase().startsWith(search.toLowerCase());
  };

  const isVisible = (el) => filter === 'all' || el.category === filter;

  // Check if there are search matches below the viewport
  useEffect(() => {
    if (!search.trim()) {
      setHasMatchesBelowFold(false);
      return;
    }

    const matchingLanthanides = lanthanides.filter(el => isVisible(el) && matchesSearch(el));
    const matchingActinides = actinides.filter(el => isVisible(el) && matchesSearch(el));
    const hasMatchesInLowerSections = matchingLanthanides.length > 0 || matchingActinides.length > 0;

    if (!hasMatchesInLowerSections) {
      setHasMatchesBelowFold(false);
      return;
    }

    const checkVisibility = () => {
      if (lanthanidesRef.current) {
        const rect = lanthanidesRef.current.getBoundingClientRect();
        setHasMatchesBelowFold(rect.top > window.innerHeight);
      }
    };

    checkVisibility();
    window.addEventListener('scroll', checkVisibility);
    window.addEventListener('resize', checkVisibility);

    return () => {
      window.removeEventListener('scroll', checkVisibility);
      window.removeEventListener('resize', checkVisibility);
    };
  }, [search, filter]);

  const renderCell = (period, group) => {
    const el = getElementAt(period, group);

    if ((period === 6 || period === 7) && group === 3) {
      return (
        <div
          key={`${period}-${group}`}
          className="border-2 border-dashed border-gray-400 rounded-sm flex flex-col items-center justify-center cursor-default"
          style={{ width: 'var(--element-size)', height: 'var(--element-size)' }}
        >
          <span className="text-[0.5rem] sm:text-xs text-gray-500 font-semibold">
            {period === 6 ? '57-71' : '89-103'}
          </span>
          <span className="text-[0.4rem] sm:text-xs text-gray-400 hidden sm:block">
            {period === 6 ? 'Lanthanides' : 'Actinides'}
          </span>
        </div>
      );
    }

    if (el && isVisible(el)) {
      return (
        <PeriodicElement
          key={el.atomicNumber}
          symbol={el.symbol}
          name={el.name}
          atomicNumber={el.atomicNumber}
          atomicMass={el.atomicMass}
          category={el.category}
          highlighted={isHighlighted(el)}
          dimmed={search.trim() && !matchesSearch(el)}
          onClick={() => setSelected(el)}
        />
      );
    }

    return <div key={`${period}-${group}`} style={{ width: 'var(--element-size)', height: 'var(--element-size)' }} />;
  };

  const renderRow = (period) => {
    const cells = [];
    for (let group = 1; group <= 18; group++) {
      cells.push(renderCell(period, group));
    }
    return (
      <div key={`row-${period}`} className="flex gap-1">
        {cells}
      </div>
    );
  };

  // Calculate element size based on viewport: 18 columns + 17 gaps (4px each) + padding (48px total)
  // Using CSS custom property set via inline style
  const tableStyle = {
    '--element-size': 'clamp(40px, calc((100vw - 48px - 68px) / 18), 80px)',
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 pt-2 pb-6" style={tableStyle}>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => {
              setFilter(cat.key);
              if (selected && cat.key !== 'all' && selected.category !== cat.key) {
                setSelected(null);
              }
            }}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all border-2 ${
              cat.key === 'all'
                ? filter === 'all'
                  ? 'bg-gray-700 text-white border-gray-700'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'
                : `${categoryColors[cat.key]} ${filter === cat.key ? 'ring-2 ring-offset-1 ring-gray-500' : 'hover:opacity-80'}`
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="flex justify-end mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search element..."
          className="px-3 py-1.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40 sm:w-48"
        />
      </div>

      <div className="relative">
        <div>
          <div className="flex flex-col gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map(period => renderRow(period))}
          </div>

          {selected && (
            <div
              className={`absolute top-0 p-3 rounded-lg shadow-lg z-20 border-2 ${categoryColors[selected.category]}`}
              style={{ left: 'calc(5 * var(--element-size) + 16px)', top: '0px', backgroundColor: 'white' }}
            >
              <div className="flex divide-x divide-gray-300 gap-1">
                <div className="pr-3">
                  <div className="flex items-center gap-2">
                    <div className="text-3xl font-bold text-gray-900">{selected.symbol}</div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{selected.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{selected.category.replace('-', ' ')}</div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 mt-2 pt-2 text-xs text-gray-600 space-y-1">
                    <div><span className="text-gray-400">Discovered</span> {selected.discovered || 'Ancient'}</div>
                    <div><span className="text-gray-400">Melting</span> {selected.meltingPoint != null ? `${selected.meltingPoint}°C` : '—'}</div>
                    <div><span className="text-gray-400">Boiling</span> {selected.boilingPoint != null ? `${selected.boilingPoint}°C` : '—'}</div>
                  </div>
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <a
                      href={`https://en.wikipedia.org/wiki/${selected.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Wikipedia →
                    </a>
                  </div>
                </div>
                <div className="px-3 text-sm text-gray-700 flex flex-col justify-center gap-1">
                  <div className="flex justify-between gap-4"><span className="text-gray-400">Atomic Number</span><span className="font-medium">{selected.atomicNumber}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-gray-400">Atomic Mass</span><span className="font-medium">{selected.atomicMass}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-gray-400">Period</span><span className="font-medium">{selected.period}</span></div>
                  {selected.group && <div className="flex justify-between gap-4"><span className="text-gray-400">Group</span><span className="font-medium">{selected.group}</span></div>}
                </div>
                <div className="pl-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-gray-400 text-xs">Compounds</div>
                      {commonCompounds[selected.symbol]?.length > 0 ? (
                        <div className="text-gray-700 font-medium">
                          {commonCompounds[selected.symbol].slice(0, 3).join(', ')}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="text-gray-400 hover:text-gray-600 text-base leading-none"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={lanthanidesRef} className="mt-4 flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="text-xs text-gray-500 font-semibold mr-2 w-[4.5rem]">Lanthanides</div>
              {lanthanides.filter(el => isVisible(el)).map(el => (
                <PeriodicElement
                  key={el.atomicNumber}
                  symbol={el.symbol}
                  name={el.name}
                  atomicNumber={el.atomicNumber}
                  atomicMass={el.atomicMass}
                  category={el.category}
                  highlighted={isHighlighted(el)}
                  dimmed={search.trim() && !matchesSearch(el)}
                  onClick={() => setSelected(el)}
                />
              ))}
            </div>
          </div>

          <div className="mt-1 flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="text-xs text-gray-500 font-semibold mr-2 w-[4.5rem]">Actinides</div>
              {actinides.filter(el => isVisible(el)).map(el => (
                <PeriodicElement
                  key={el.atomicNumber}
                  symbol={el.symbol}
                  name={el.name}
                  atomicNumber={el.atomicNumber}
                  atomicMass={el.atomicMass}
                  category={el.category}
                  highlighted={isHighlighted(el)}
                  dimmed={search.trim() && !matchesSearch(el)}
                  onClick={() => setSelected(el)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {hasMatchesBelowFold && (
        <button
          onClick={() => lanthanidesRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <span className="text-sm font-medium">More matches below</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default App;
