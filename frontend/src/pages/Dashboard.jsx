import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { getApiUrl } from '../config/api';

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    console.log('Refresh button clicked!');
    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      const [ordersRes, predRes] = await Promise.all([
        fetch(`${apiUrl}/api/orders`),
        fetch(`${apiUrl}/api/predictions`)
      ]);
      const ordersData = await ordersRes.json();
      const predData = await predRes.json();
      setOrders(ordersData);
      setPredictions(predData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const getStageColor = (stage) => {
    const colors = {
      'order_placed': 'bg-gray-100 text-gray-800',
      'inventory_check': 'bg-blue-100 text-blue-800',
      'lens_cutting': 'bg-purple-100 text-purple-800',
      'edging': 'bg-indigo-100 text-indigo-800',
      'coating': 'bg-pink-100 text-pink-800',
      'assembly': 'bg-yellow-100 text-yellow-800',
      'qc_check': 'bg-orange-100 text-orange-800',
      'packaging': 'bg-green-100 text-green-800',
      'ready_for_delivery': 'bg-teal-100 text-teal-800',
      'delivered': 'bg-emerald-100 text-emerald-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const getRiskColor = (risk) => {
    const colors = {
      'high': 'bg-red-500',
      'medium': 'bg-yellow-500',
      'low': 'bg-green-500'
    };
    return colors[risk] || 'bg-gray-500';
  };

  const atRiskOrders = predictions.filter(p => p.risk_level === 'high');

  return (
    <div className="space-y-6 pointer-events-auto" style={{ position: 'relative', zIndex: 100 }}>
      <div className="flex justify-between items-center pointer-events-auto" style={{ position: 'relative', zIndex: 101 }}>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div
          onClick={fetchData}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 pointer-events-auto cursor-pointer"
          style={{ position: 'relative', zIndex: 102 }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading data...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Risk Overview */}
          {atRiskOrders.length > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h2 className="text-lg font-semibold text-red-800">High Risk Orders</h2>
              </div>
              <p className="text-red-700 mb-4">{atRiskOrders.length} orders at high risk of breaching SLA</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {atRiskOrders.slice(0, 6).map((order, index) => (
                  <div
                    key={order.order_id}
                    className="bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold">{order.order_number}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRiskColor(order.risk_level)} text-white`}>
                        {(order.breach_probability * 100).toFixed(0)}% Risk
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{order.current_stage}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {order.hours_until_breach.toFixed(1)}h until breach
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
              <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lens Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inventory</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.slice(0, 10).map((order, index) => {
                    const prediction = predictions.find(p => p.order_id === order.id);
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{order.order_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{order.customer_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{order.lens_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(order.current_stage)}`}>
                            {order.current_stage}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {prediction && (
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${getRiskColor(prediction.risk_level)}`}></div>
                              <span className="text-sm">{prediction.risk_level}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.inventory_available ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-yellow-500" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, color: 'blue', label: 'Avg. Processing Time', value: '42h' },
              { icon: CheckCircle, color: 'green', label: 'On-Time Delivery', value: '94%' },
              { icon: AlertTriangle, color: 'orange', label: 'QC Pass Rate', value: '89%' }
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <div className={`bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-md`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
