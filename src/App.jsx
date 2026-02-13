import { useState, useEffect, useRef, useCallback } from 'react';
import PeriodicElement from './components/PeriodicElement';
import { elements, categories, categoryColors, commonCompounds } from './data/elements';

function App() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [hasMatchesBelowFold, setHasMatchesBelowFold] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(null);
  const [detailsTop, setDetailsTop] = useState(0);
  const lanthanidesRef = useRef(null);
  const tableContainerRef = useRef(null);
  const detailsRef = useRef(null);
  const elementRefs = useRef({});
  const searchRef = useRef(null);
  const filterRefs = useRef({});
  const menuRef = useRef(null);

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

  // Keep details pane visible when scrolling down
  useEffect(() => {
    if (!selected) return;

    const updateDetailsTop = () => {
      const container = tableContainerRef.current;
      const details = detailsRef.current;
      if (!container || !details) return;

      const containerRect = container.getBoundingClientRect();
      const detailsHeight = details.offsetHeight;
      const containerHeight = container.offsetHeight;
      const maxTop = containerHeight - detailsHeight;

      // How far the container top has scrolled above the viewport
      const scrolledAbove = -containerRect.top;

      if (scrolledAbove <= 0) {
        setDetailsTop(0);
      } else {
        setDetailsTop(Math.min(scrolledAbove, Math.max(0, maxTop)));
      }
    };

    updateDetailsTop();
    window.addEventListener('scroll', updateDetailsTop);
    window.addEventListener('resize', updateDetailsTop);

    return () => {
      window.removeEventListener('scroll', updateDetailsTop);
      window.removeEventListener('resize', updateDetailsTop);
    };
  }, [selected]);

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  // Build grid of navigable positions: main grid + lanthanide/actinide rows
  const getGridPosition = useCallback((el) => {
    if (el.series === 'lanthanide') return { row: 8, col: lanthanides.indexOf(el) };
    if (el.series === 'actinide') return { row: 9, col: actinides.indexOf(el) };
    return { row: el.period, col: el.group };
  }, [lanthanides, actinides]);

  const findElementAtGrid = useCallback((row, col, direction) => {
    if (row >= 1 && row <= 7) {
      // Main grid
      const el = mainElements.find(e => e.period === row && e.group === col);
      if (el && isVisible(el)) return el;
      // Skip empty cells in the given direction
      if (direction === 'right') {
        for (let g = col + 1; g <= 18; g++) {
          const e = mainElements.find(e2 => e2.period === row && e2.group === g);
          if (e && isVisible(e)) return e;
        }
      } else if (direction === 'left') {
        for (let g = col - 1; g >= 1; g--) {
          const e = mainElements.find(e2 => e2.period === row && e2.group === g);
          if (e && isVisible(e)) return e;
        }
      }
      return null;
    }
    const series = row === 8 ? lanthanides : actinides;
    const visible = series.filter(e => isVisible(e));
    if (col >= 0 && col < visible.length) return visible[col];
    if (direction === 'right' && col < visible.length) return visible[Math.min(col, visible.length - 1)];
    if (direction === 'left' && col >= 0) return visible[Math.max(col, 0)];
    return null;
  }, [mainElements, lanthanides, actinides, filter]);

  // Global keyboard handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }

      // If typing in search, handle Tab and arrow keys to navigate results
      if (e.target.tagName === 'INPUT') {
        if ((e.key === 'Tab' || e.key === 'ArrowDown') && search.trim()) {
          const matches = elements.filter(el => isVisible(el) && isHighlighted(el));
          if (matches.length > 0) {
            e.preventDefault();
            elementRefs.current[matches[0].atomicNumber]?.focus();
          }
          return;
        }
        if (e.key !== 'Escape') return;
      }

      // When search is active and an element is focused, arrow keys cycle through matches
      if (search.trim() && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const matches = elements.filter(el => isVisible(el) && isHighlighted(el));
        if (matches.length > 0) {
          const focusedKey = Object.keys(elementRefs.current).find(
            k => elementRefs.current[k] === document.activeElement
          );
          if (focusedKey) {
            const currentIdx = matches.findIndex(el => el.atomicNumber === parseInt(focusedKey));
            if (currentIdx !== -1) {
              e.preventDefault();
              let nextIdx;
              if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                nextIdx = (currentIdx + 1) % matches.length;
              } else {
                nextIdx = (currentIdx - 1 + matches.length) % matches.length;
              }
              elementRefs.current[matches[nextIdx].atomicNumber]?.focus();
              return;
            }
          }
        }
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        const isElementFocused = Object.values(elementRefs.current).includes(document.activeElement);
        if (selected) {
          // First escape: close details pane
          setSelected(null);
          if (isElementFocused) document.activeElement.blur();
        } else if (filter !== 'all') {
          // Second escape (or first if no details): reset filter
          setFilter('all');
          filterRefs.current['all']?.focus();
        } else if (search.trim()) {
          setSearch('');
          searchRef.current?.blur();
        } else if (isElementFocused) {
          filterRefs.current['all']?.focus();
        }
        return;
      }

      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault();

      // Find currently focused element
      const focusedEl = document.activeElement;
      const focusedKey = Object.keys(elementRefs.current).find(
        k => elementRefs.current[k] === focusedEl
      );

      if (!focusedKey) {
        // No element focused, focus the first visible element
        const first = elements.find(el => !el.series && isVisible(el));
        if (first && elementRefs.current[first.atomicNumber]) {
          elementRefs.current[first.atomicNumber].focus();
        }
        return;
      }

      const currentEl = elements.find(el => el.atomicNumber === parseInt(focusedKey));
      if (!currentEl) return;

      const pos = getGridPosition(currentEl);
      let nextEl = null;

      if (e.key === 'ArrowRight') {
        if (pos.row >= 8) {
          const series = pos.row === 8 ? lanthanides : actinides;
          const visible = series.filter(el => isVisible(el));
          const idx = visible.indexOf(currentEl);
          if (idx < visible.length - 1) nextEl = visible[idx + 1];
        } else {
          nextEl = findElementAtGrid(pos.row, pos.col + 1, 'right');
        }
      } else if (e.key === 'ArrowLeft') {
        if (pos.row >= 8) {
          const series = pos.row === 8 ? lanthanides : actinides;
          const visible = series.filter(el => isVisible(el));
          const idx = visible.indexOf(currentEl);
          if (idx > 0) nextEl = visible[idx - 1];
        } else {
          nextEl = findElementAtGrid(pos.row, pos.col - 1, 'left');
        }
      } else if (e.key === 'ArrowDown') {
        if (pos.row < 7) {
          // Try same column in next row, then search nearby
          for (let r = pos.row + 1; r <= 7; r++) {
            const e2 = mainElements.find(el => el.period === r && el.group === pos.col);
            if (e2 && isVisible(e2)) { nextEl = e2; break; }
          }
          if (!nextEl) {
            // Jump to lanthanides/actinides
            const lv = lanthanides.filter(el => isVisible(el));
            if (lv.length > 0) nextEl = lv[Math.min(pos.col - 1, lv.length - 1)];
          }
        } else if (pos.row === 7) {
          const lv = lanthanides.filter(el => isVisible(el));
          if (lv.length > 0) nextEl = lv[Math.min(pos.col - 1, lv.length - 1)];
        } else if (pos.row === 8) {
          const av = actinides.filter(el => isVisible(el));
          if (av.length > 0) nextEl = av[Math.min(pos.col, av.length - 1)];
        }
      } else if (e.key === 'ArrowUp') {
        if (pos.row === 9) {
          const lv = lanthanides.filter(el => isVisible(el));
          if (lv.length > 0) nextEl = lv[Math.min(pos.col, lv.length - 1)];
        } else if (pos.row === 8) {
          // Jump back to main grid row 7
          for (let g = pos.col + 1; g <= 18; g++) {
            const e2 = mainElements.find(el => el.period === 7 && el.group === g);
            if (e2 && isVisible(e2)) { nextEl = e2; break; }
          }
          if (!nextEl) {
            const e2 = mainElements.find(el => el.period === 7 && isVisible(el));
            if (e2) nextEl = e2;
          }
        } else if (pos.row > 1) {
          for (let r = pos.row - 1; r >= 1; r--) {
            const e2 = mainElements.find(el => el.period === r && el.group === pos.col);
            if (e2 && isVisible(e2)) { nextEl = e2; break; }
          }
        }
      }

      if (nextEl && elementRefs.current[nextEl.atomicNumber]) {
        elementRefs.current[nextEl.atomicNumber].focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, filter, getGridPosition, findElementAtGrid]);

  const setElementRef = useCallback((atomicNumber, node) => {
    if (node) {
      elementRefs.current[atomicNumber] = node;
    } else {
      delete elementRefs.current[atomicNumber];
    }
  }, []);

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
          ref={(node) => setElementRef(el.atomicNumber, node)}
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
      {/* Top bar: nav menu + dropdown */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setNavMenuOpen(!navMenuOpen)}
          className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-500 flex items-center gap-0.5"
          aria-label="Games menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg className={`w-3 h-3 transition-transform duration-300 ${navMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div className={`flex items-center gap-1 overflow-hidden transition-all duration-300 ${navMenuOpen ? 'max-w-md opacity-100' : 'max-w-0 opacity-0'}`}>
          <button
            onClick={() => setNavMenuOpen(false)}
            className="px-3 py-1 rounded-full text-sm font-medium border-2 border-gray-300 text-gray-600 hover:bg-gray-100 whitespace-nowrap transition-colors"
          >
            Game 1
          </button>
          <button
            onClick={() => setNavMenuOpen(false)}
            className="px-3 py-1 rounded-full text-sm font-medium border-2 border-gray-300 text-gray-600 hover:bg-gray-100 whitespace-nowrap transition-colors"
          >
            Game 2
          </button>
        </div>
        <div className="flex-1" />
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-full hover:bg-gray-200 transition-colors text-gray-700"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-30 min-w-[180px]">
              <button
                onClick={() => { setShowModal('shortcuts'); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Keyboard Shortcuts
              </button>
              <button
                onClick={() => { setShowModal('credits'); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Credits
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {categories.map(cat => (
          <button
            key={cat.key}
            ref={(node) => { filterRefs.current[cat.key] = node; }}
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
          ref={searchRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search element..."
          className="px-3 py-1.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40 sm:w-48"
        />
      </div>

      <div className="relative" ref={tableContainerRef}>
        <div>
          <div className="flex flex-col gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map(period => renderRow(period))}
          </div>

          {selected && (
            <div
              ref={detailsRef}
              className={`absolute p-3 rounded-lg shadow-lg z-20 border-2 transition-[top] duration-150 ${categoryColors[selected.category]}`}
              style={{ left: 'calc(5 * var(--element-size) + 16px)', top: `${detailsTop}px`, backgroundColor: 'white' }}
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
                  ref={(node) => setElementRef(el.atomicNumber, node)}
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
                  ref={(node) => setElementRef(el.atomicNumber, node)}
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

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowModal(null)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {showModal === 'shortcuts' ? 'Keyboard Shortcuts' : 'Credits'}
              </h2>
              <button onClick={() => setShowModal(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            {showModal === 'shortcuts' && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Focus search</span><kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">Ctrl+S</kbd></div>
                <div className="flex justify-between"><span className="text-gray-600">Navigate elements</span><kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">Arrow keys</kbd></div>
                <div className="flex justify-between"><span className="text-gray-600">Select element</span><kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">Enter / Space</kbd></div>
                <div className="flex justify-between"><span className="text-gray-600">Focus first search result</span><kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">Tab</kbd></div>
                <div className="flex justify-between"><span className="text-gray-600">Close / Reset</span><kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">Esc</kbd></div>
              </div>
            )}
            {showModal === 'credits' && (
              <div className="text-sm text-gray-600 space-y-2">
                <p>Interactive Periodic Table of Elements</p>
                <p>© 2025 CodMonk</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
