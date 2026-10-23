import React, { useState, useEffect, useCallback, useRef } from 'react';

const SPECIALS_API_URL = 'https://jsonplaceholder.typicode.com/todos?_limit=10';

export default function SpecialsPage() {
  const [specials, setSpecials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track request controller so StrictMode unmount can abort cleanly
  const activeControllerRef = useRef(null);

  const fetchSpecials = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }
    const controller = new AbortController();
    activeControllerRef.current = controller;

    try {
      const response = await fetch(SPECIALS_API_URL, {
        signal: controller.signal
      });

      // Task 3 Requirement 3: Check HTTP response status. Treat non-2xx as failures
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Task 3 Requirement 5: Display available specials first. Preserve API order within groups
      const availableItems = data.filter((item) => !item.completed);
      const soldOutItems = data.filter((item) => item.completed);
      const orderedSpecials = [...availableItems, ...soldOutItems];

      setSpecials(orderedSpecials);
      setIsLoading(false);
    } catch (err) {
      if (err.name === 'AbortError') {
        // Ignored: aborted during component unmount / StrictMode cleanup
        return;
      }
      console.error('Specials fetch error:', err);
      // Task 3 Requirement 7: If failed, display Could not load specials
      setError('Could not load specials');
      setIsLoading(false);
    }
  }, []);

  // Task 3 Requirement 1: On opening page, request endpoint exactly once for that page load/mount
  useEffect(() => {
    fetchSpecials();
    return () => {
      if (activeControllerRef.current) {
        activeControllerRef.current.abort();
      }
    };
  }, [fetchSpecials]);

  // Derived counts for exact summary format: <n> of <total> available
  const availableCount = specials.filter((s) => !s.completed).length;
  const totalCount = specials.length;

  return (
    <div className="specials-page">
      {/* Specials Board Hero */}
      <div className="specials-header">
        <div>
          <div className="specials-live-badge">
            <span className="pulsing-green-dot" /> Kitchen Board Live Feed
          </div>
          <h2 className="specials-main-title">👨‍🍳 Chef's Daily Specials Board</h2>
          <p className="specials-subtitle">
            Freshly prepared limited-run specials curated by our master canteen chefs today.
          </p>
        </div>

        {!isLoading && !error && totalCount > 0 && (
          <div className="specials-summary-badge" id="specials-summary">
            {/* Task 3 Requirement 6: exact format <n> of <total> available */}
            {availableCount} of {totalCount} available
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="state-loading" id="specials-loading">
          <div className="loading-spinner" />
          <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#854d0e', marginTop: '16px' }}>
            Loading specials...
          </p>
          <p style={{ color: '#a16207', fontSize: '0.9rem', marginTop: '4px' }}>
            Connecting with canteen kitchen board
          </p>
        </div>
      )}

      {/* Error state with Retry button */}
      {!isLoading && error && (
        <div className="state-error" id="specials-error">
          <div className="error-icon">⚠️</div>
          <p style={{ color: '#991b1b', fontSize: '1.15rem', fontWeight: 700 }}>
            {error}
          </p>
          <p style={{ color: '#78716c', fontSize: '0.9rem', marginTop: '4px' }}>
            Unable to fetch latest specials from the kitchen endpoint.
          </p>
          <button
            type="button"
            className="btn-retry"
            id="retry-specials-btn"
            onClick={fetchSpecials}
          >
            🔄 Retry
          </button>
        </div>
      )}

      {/* Success state list */}
      {!isLoading && !error && (
        <div className="specials-list" id="specials-list">
          {specials.map((todo) => {
            const isAvailable = !todo.completed;
            const statusLabel = isAvailable ? 'Available' : 'Sold out';

            return (
              <div
                key={todo.id}
                id={`special-item-${todo.id}`}
                className={`special-item ${!isAvailable ? 'sold-out' : ''}`}
              >
                <div className="special-item-left">
                  <span className="special-item-star">{isAvailable ? '⭐' : '⚪'}</span>
                  <span className="special-title">{todo.title}</span>
                </div>
                <span
                  className={`badge ${isAvailable ? 'badge-available' : 'badge-unavailable'}`}
                >
                  <span className="status-dot" /> {statusLabel}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
