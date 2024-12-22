import React, { useState, useCallback } from 'react';

const ResistorCalculator = () => {
  const [resistors, setResistors] = useState('100, 220, 330, 470, 1000, 2200, 3300, 4700, 10000');
  const [targetValue, setTargetValue] = useState(1500);
  const [tolerance, setTolerance] = useState(5);
  const [maxResistors, setMaxResistors] = useState(3);
  const [connectionType, setConnectionType] = useState('both');
  const [results, setResults] = useState({ series: [], parallel: [] });

  const findSeriesCombinations = useCallback((availableResistors, target, tolerance, maxR) => {
    const results = [];
    const maxError = tolerance / 100;

    const findCombinations = (current, sum, startIdx) => {
      if (current.length > maxR) return;

      if (current.length > 0) {
        const error = Math.abs(sum - target) / target;
        if (error <= maxError) {
          results.push({
            resistors: [...current],
            total: sum,
            error: error * 100
          });
        }
      }

      for (let i = startIdx; i < availableResistors.length; i++) {
        findCombinations(
          [...current, availableResistors[i]],
          sum + availableResistors[i],
          i
        );
      }
    };

    findCombinations([], 0, 0);
    return results.sort((a, b) => a.error - b.error);
  }, []);

  const findParallelCombinations = useCallback((availableResistors, target, tolerance, maxR) => {
    const results = [];
    const maxError = tolerance / 100;

    const findCombinations = (current, startIdx) => {
      if (current.length > maxR) return;

      if (current.length > 0) {
        const total = 1 / current.reduce((sum, r) => sum + 1/r, 0);
        const error = Math.abs(total - target) / target;
        if (error <= maxError) {
          results.push({
            resistors: [...current],
            total,
            error: error * 100
          });
        }
      }

      for (let i = startIdx; i < availableResistors.length; i++) {
        findCombinations([...current, availableResistors[i]], i);
      }
    };

    findCombinations([], 0);
    return results.sort((a, b) => a.error - b.error);
  }, []);

  const calculateCombinations = useCallback(() => {
    try {
      const availableResistors = resistors
        .split(',')
        .map(r => parseFloat(r.trim()))
        .filter(r => !isNaN(r));

      const newResults = {
        series: [],
        parallel: []
      };

      if (connectionType === 'series' || connectionType === 'both') {
        newResults.series = findSeriesCombinations(
          availableResistors,
          targetValue,
          tolerance,
          maxResistors
        );
      }

      if (connectionType === 'parallel' || connectionType === 'both') {
        newResults.parallel = findParallelCombinations(
          availableResistors,
          targetValue,
          tolerance,
          maxResistors
        );
      }

      setResults(newResults);
    } catch (error) {
      console.error('Calculation error:', error);
    }
  }, [resistors, targetValue, tolerance, maxResistors, connectionType, findSeriesCombinations, findParallelCombinations]);

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white shadow-xl rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Resistor Calculator</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Available Resistors (Ω)</label>
            <textarea
              value={resistors}
              onChange={(e) => setResistors(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Target Value (Ω)</label>
            <input
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(parseFloat(e.target.value))}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Tolerance: {tolerance}%
            </label>
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={tolerance}
              onChange={(e) => setTolerance(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Max Resistors: {maxResistors}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={maxResistors}
              onChange={(e) => setMaxResistors(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Connection Type</label>
            <select
              value={connectionType}
              onChange={(e) => setConnectionType(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="both">Both</option>
              <option value="series">Series Only</option>
              <option value="parallel">Parallel Only</option>
            </select>
          </div>

          <button
            onClick={calculateCombinations}
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
          >
            Calculate Combinations
          </button>

          {results.series.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Series Combinations</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Resistors (Ω)</th>
                      <th className="border p-2 text-left">Total (Ω)</th>
                      <th className="border p-2 text-left">Error (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.series.slice(0, 5).map((result, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border p-2">{result.resistors.join(' + ')}</td>
                        <td className="border p-2">{result.total.toFixed(1)}</td>
                        <td className="border p-2">{result.error.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {results.parallel.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Parallel Combinations</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Resistors (Ω)</th>
                      <th className="border p-2 text-left">Total (Ω)</th>
                      <th className="border p-2 text-left">Error (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.parallel.slice(0, 5).map((result, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border p-2">{result.resistors.join(' || ')}</td>
                        <td className="border p-2">{result.total.toFixed(1)}</td>
                        <td className="border p-2">{result.error.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResistorCalculator;