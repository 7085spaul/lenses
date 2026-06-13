import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Dashboard, Orders, Inventory, Predictions, Alerts, NewOrder } from './pages';
import { Activity, Package, Database, Brain, Bell, Plus } from 'lucide-react';
import { getApiUrl } from './config/api';

function App() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/orders/stats/overview`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Activity className="w-8 h-8 text-primary" />
                <span className="text-xl font-bold text-gray-800">EyewearOMS</span>
              </div>
              
              <div className="flex items-center space-x-6">
                <Link to="/" className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors">
                  <Layout />
                  <span>Dashboard</span>
                </Link>
                <Link to="/orders" className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors">
                  <Package />
                  <span>Orders</span>
                </Link>
                <Link to="/inventory" className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors">
                  <Database />
                  <span>Inventory</span>
                </Link>
                <Link to="/predictions" className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors">
                  <Brain />
                  <span>Predictions</span>
                </Link>
                <Link to="/alerts" className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors">
                  <Bell />
                  <span>Alerts</span>
                </Link>
                <Link
                  to="/orders/new"
                  className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Order</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 py-8 pointer-events-auto">
          {stats && (
            <div className="grid grid-cols-4 gap-4 mb-8 pointer-events-auto">
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow pointer-events-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Active Orders</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.total_orders}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-md">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Critical</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.critical_orders}</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-500 to-red-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-md">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">SLA Breached</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.breached_orders}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-md">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">At Risk</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.by_status?.filter(s => s.status === 'in_production')?.[0]?.count || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-md">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pointer-events-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/new" element={<NewOrder />} />
              <Route path="/orders/:id" element={<Orders />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/alerts" element={<Alerts />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
