import React, { useState, useEffect } from 'react';
import { Brain, AlertTriangle, TrendingUp, Clock } from 'lucide-react';

export default function Predictions() {
  const [predictions, setPredictions] = useState([]);
  const [atRisk, setAtRisk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPredictions();
    fetchAtRisk();
  }, []);

  const fetchPredictions = async () => {
    try {
      const res = await fetch('/api/predictions');
      const data = await res.json();
      console.log('Predictions data:', data);
      setPredictions(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setError('Failed to load predictions');
      setLoading(false);
    }
  };

  const fetchAtRisk = async () => {
    try {
      const res = await fetch('/api/predictions/at-risk');
      const data = await res.json();
      console.log('At-risk data:', data);
      setAtRisk(data);
    } catch (error) {
      console.error('Error fetching at-risk orders:', error);
    }
  };

  const getRiskColor = (risk) => {
    const colors = {
      'high': 'bg-red-500',
      'medium': 'bg-yellow-500',
      'low': 'bg-green-500'
    };
    return colors[risk] || 'bg-gray-500';
  };

  const getRiskBg = (risk) => {
    const colors = {
      'high': 'bg-red-50 border-red-200',
      'medium': 'bg-yellow-50 border-yellow-200',
      'low': 'bg-green-50 border-green-200'
    };
    return colors[risk] || 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="space-y-6 pointer-events-auto" style={{ position: 'relative', zIndex: 100 }}>
      <div className="flex justify-between items-center pointer-events-auto" style={{ position: 'relative', zIndex: 101 }}>
        <h1 className="text-2xl font-bold text-gray-800">AI-Powered TAT Predictions</h1>
        <div
          onClick={() => { setLoading(true); fetchPredictions(); fetchAtRisk(); }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 pointer-events-auto cursor-pointer"
          style={{ position: 'relative', zIndex: 102 }}
        >
          Refresh Predictions
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading predictions...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
      {/* AI Model Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-start space-x-4">
          <Brain className="w-8 h-8 text-primary flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">AI Prediction Model</h3>
            <p className="text-sm text-gray-600 mb-2">
              Our ML model predicts order completion time and breach probability using:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Lens type complexity factors (single vision, bifocal, progressive)</li>
              <li>• Index thickness multipliers (1.50 to 1.74)</li>
              <li>• Coating complexity adjustments</li>
              <li>• Current stage progress tracking</li>
              <li>• Inventory availability impact</li>
              <li>• Historical QC failure patterns</li>
            </ul>
          </div>
        </div>
      </div>

      {/* High Risk Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-800">High Risk Orders (Breach Probability &gt; 70%)</h2>
          </div>
        </div>
        <div className="p-6">
          {atRisk.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No high-risk orders at this time</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {atRisk.map(order => (
                <div key={order.id} className={`rounded-lg p-4 border ${getRiskBg('high')}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-semibold">{order.order_number}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor('high')} text-white`}>
                      {(order.breach_probability * 100).toFixed(0)}% Risk
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Stage:</span> {order.current_stage}</p>
                    <p><span className="text-gray-500">Lens:</span> {order.lens_type} / {order.lens_index}</p>
                    <p><span className="text-gray-500">Inventory:</span> {order.inventory_available ? '✓ Available' : '✗ Not Available'}</p>
                    <p><span className="text-gray-500">QC Failures:</span> {order.qc_failed_count || 0}</p>
                  </div>
                  <div
                    onClick={() => console.log('Take Action clicked for order:', order.id)}
                    className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 text-sm pointer-events-auto cursor-pointer"
                    style={{ position: 'relative', zIndex: 103 }}
                  >
                    Take Action
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Predictions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">All Order Predictions</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Predicted Hours</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Breach Probability</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours Until Breach</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {predictions.map(pred => (
              <tr key={pred.order_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium">{pred.order_number}</td>
                <td className="px-6 py-4 whitespace-nowrap">{pred.current_stage}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{pred.predicted_remaining_hours}h</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getRiskColor(pred.risk_level)}`}
                      style={{ width: `${pred.breach_probability * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">{(pred.breach_probability * 100).toFixed(0)}%</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(pred.risk_level)} text-white`}>
                    {pred.risk_level}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={pred.hours_until_breach < 0 ? 'text-red-600 font-semibold' : ''}>
                    {pred.hours_until_breach.toFixed(1)}h
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Model Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-gray-500 text-sm">Prediction Accuracy</p>
              <p className="text-2xl font-bold">87%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-gray-500 text-sm">False Positive Rate</p>
              <p className="text-2xl font-bold">12%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-gray-500 text-sm">Model Version</p>
              <p className="text-2xl font-bold">v2.1</p>
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
