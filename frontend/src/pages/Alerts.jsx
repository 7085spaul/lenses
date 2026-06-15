import React, { useState, useEffect } from 'react';
import { Bell, Mail, Send, CheckCircle } from 'lucide-react';
import { getApiUrl } from '../config/api';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlert, setNewAlert] = useState({ order_id: '', alert_type: '', message: '', channel: 'email' });
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchAlerts();
    fetchOrders();
  }, []);

  const fetchAlerts = async () => {
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/alerts`);
      const data = await res.json();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const createAlert = async (e) => {
    e.preventDefault();
    console.log('Create Alert button clicked!', newAlert);
    try {
      const apiUrl = getApiUrl();
      await fetch(`${apiUrl}/api/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlert)
      });
      setShowCreateModal(false);
      fetchAlerts();
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  };

  const autoGenerateAlerts = async () => {
    console.log('Auto-Generate button clicked!');
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/alerts/auto-generate`, {
        method: 'POST'
      });
      if (res.ok) {
        console.log('Alerts generated successfully');
        fetchAlerts();
      } else {
        console.error('Failed to generate alerts');
      }
    } catch (error) {
      console.error('Error auto-generating alerts:', error);
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'email': return <Mail className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getAlertTypeColor = (type) => {
    const colors = {
      'breach_warning': 'bg-red-100 text-red-800',
      'delay_notice': 'bg-yellow-100 text-yellow-800',
      'qc_failure': 'bg-orange-100 text-orange-800',
      'inventory_shortage': 'bg-purple-100 text-purple-800',
      'delivery_reminder': 'bg-blue-100 text-blue-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 pointer-events-auto" style={{ position: 'relative', zIndex: 100 }}>
      <div className="flex justify-between items-center pointer-events-auto" style={{ position: 'relative', zIndex: 101 }}>
        <h1 className="text-2xl font-bold text-gray-800">Alerts & Notifications</h1>
        <div className="flex space-x-3 pointer-events-auto" style={{ position: 'relative', zIndex: 102 }}>
          <div
            onClick={autoGenerateAlerts}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 pointer-events-auto cursor-pointer"
            style={{ position: 'relative', zIndex: 103 }}
          >
            Auto-Generate
          </div>
          <div
            onClick={() => {
              console.log('Create Alert button clicked!');
              setShowCreateModal(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 pointer-events-auto cursor-pointer"
            style={{ position: 'relative', zIndex: 103 }}
          >
            Create Alert
          </div>
        </div>
      </div>

      {/* Alert Channels Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 border border-blue-100">
        <div className="flex items-center space-x-3 mb-4">
          <Mail className="w-6 h-6 text-blue-500" />
          <h3 className="font-semibold text-gray-800">Email Alerts</h3>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Automated email notifications for SLA breaches, delays, and QC failures.
        </p>
        <div className="text-xs text-gray-500">
          <p>• Configured via Nodemailer</p>
          <p>• Supports Gmail, SMTP, and other providers</p>
          <p>• Template-based messaging</p>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
          <h2 className="text-lg font-semibold text-gray-800">Recent Alerts</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {alerts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No alerts yet</p>
          ) : (
            alerts.map((alert, index) => (
              <div
                key={alert.id}
                className="p-6 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${getAlertTypeColor(alert.alert_type)} shadow-md`}>
                      {getChannelIcon(alert.channel)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold">{alert.order_number}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertTypeColor(alert.alert_type)}`}>
                          {alert.alert_type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{new Date(alert.created_at).toLocaleString()}</span>
                        {alert.sent ? (
                          <span className="flex items-center space-x-1 text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            <span>Sent via {alert.channel}</span>
                          </span>
                        ) : (
                          <span className="text-red-600">Not sent</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl pointer-events-auto">
            <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Create Alert</h3>
            <form onSubmit={createAlert}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <select
                    value={newAlert.order_id}
                    onChange={(e) => setNewAlert({ ...newAlert, order_id: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select Order</option>
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>{o.order_number} - {o.customer_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alert Type</label>
                  <select
                    value={newAlert.alert_type}
                    onChange={(e) => setNewAlert({ ...newAlert, alert_type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="breach_warning">Breach Warning</option>
                    <option value="delay_notice">Delay Notice</option>
                    <option value="qc_failure">QC Failure</option>
                    <option value="inventory_shortage">Inventory Shortage</option>
                    <option value="delivery_reminder">Delivery Reminder</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                  <select
                    value={newAlert.channel}
                    onChange={(e) => setNewAlert({ ...newAlert, channel: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="email">Email</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={newAlert.message}
                    onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows="3"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6 pointer-events-auto">
                <div
                  onClick={() => {
                    console.log('Cancel button clicked!');
                    setShowCreateModal(false);
                  }}
                  className="px-4 py-2 bg-white text-black border border-gray-300 rounded-lg hover:bg-gray-50 pointer-events-auto cursor-pointer"
                >
                  Cancel
                </div>
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Send Alert button clicked!');
                    createAlert(e);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 pointer-events-auto cursor-pointer"
                >
                  Send Alert
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
