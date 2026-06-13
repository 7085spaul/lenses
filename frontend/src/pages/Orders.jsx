import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Filter, MoreVertical, Clock } from 'lucide-react';
import { getApiUrl } from '../config/api';

export default function Orders() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({ status: '', lens_type: '', store_location: '' });
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrder(id);
    } else {
      fetchOrders();
    }
  }, [id, filters]);

  const fetchOrders = async () => {
    try {
      const apiUrl = getApiUrl();
      const params = new URLSearchParams(filters);
      const res = await fetch(`${apiUrl}/api/orders?${params}`);
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchOrder = async (orderId) => {
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/orders/${orderId}`);
      const data = await res.json();
      setSelectedOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  };

  const updateOrderStatus = async (statusData) => {
    try {
      const apiUrl = getApiUrl();
      await fetch(`${apiUrl}/api/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statusData)
      });
      setShowUpdateModal(false);
      fetchOrder(selectedOrder.id);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'order_placed': 'bg-gray-100 text-gray-800',
      'in_production': 'bg-blue-100 text-blue-800',
      'qc_check': 'bg-yellow-100 text-yellow-800',
      'ready_for_delivery': 'bg-green-100 text-green-800',
      'delivered': 'bg-emerald-100 text-emerald-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (selectedOrder) {
    return <OrderDetail order={selectedOrder} onBack={() => { setSelectedOrder(null); navigate('/orders'); }} onUpdate={updateOrderStatus} />;
  }

  return (
    <div className="space-y-6 pointer-events-auto" style={{ position: 'relative', zIndex: 100 }}>
      <div className="flex justify-between items-center pointer-events-auto" style={{ position: 'relative', zIndex: 101 }}>
        <h1 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Orders</h1>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-r from-white to-blue-50 rounded-xl shadow-lg p-6 border border-blue-100">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">All Status</option>
              <option value="order_placed">Order Placed</option>
              <option value="in_production">In Production</option>
              <option value="qc_check">QC Check</option>
              <option value="ready_for_delivery">Ready for Delivery</option>
            </select>
          </div>
          <div className="flex-1">
            <select
              value={filters.lens_type}
              onChange={(e) => setFilters({ ...filters, lens_type: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">All Lens Types</option>
              <option value="single_vision">Single Vision</option>
              <option value="bifocal">Bifocal</option>
              <option value="progressive">Progressive</option>
            </select>
          </div>
          <div className="flex-1">
            <select
              value={filters.store_location}
              onChange={(e) => setFilters({ ...filters, store_location: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">All Locations</option>
              <option value="New York">New York</option>
              <option value="Los Angeles">Los Angeles</option>
              <option value="Chicago">Chicago</option>
              <option value="Miami">Miami</option>
              <option value="Seattle">Seattle</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden pointer-events-auto" style={{ position: 'relative', zIndex: 102 }}>
        <table className="w-full pointer-events-auto" style={{ position: 'relative', zIndex: 103 }}>
          <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lens Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SLA</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order, index) => (
              <tr
                key={order.id}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap font-medium">{order.order_number}</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.customer_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.store_location}</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.lens_type}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{order.sla_hours}h</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    onClick={() => {
                      console.log('View Details button clicked for order:', order.id);
                      navigate(`/orders/${order.id}`);
                    }}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 pointer-events-auto cursor-pointer"
                    style={{ position: 'relative', zIndex: 104 }}
                  >
                    View Details
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrderDetail({ order, onBack, onUpdate }) {
  const [showModal, setShowModal] = useState(false);
  const [updateData, setUpdateData] = useState({ status: '', stage: '', notes: '', delay_reason: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(updateData);
  };

  const stages = ['order_placed', 'inventory_check', 'lens_cutting', 'edging', 'coating', 'assembly', 'qc_check', 'packaging', 'ready_for_delivery', 'delivered'];
  const statuses = ['order_placed', 'in_production', 'qc_check', 'ready_for_delivery', 'delivered'];

  return (
    <div className="space-y-6 pointer-events-auto" style={{ position: 'relative', zIndex: 100 }}>
      <div 
        onClick={() => {
          console.log('Back button clicked!');
          onBack();
        }} 
        className="text-primary hover:text-blue-600 mb-4 pointer-events-auto cursor-pointer" 
        style={{ position: 'relative', zIndex: 101 }}
      >
        ← Back to Orders
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{order.order_number}</h1>
            <p className="text-gray-500">Placed on {new Date(order.placed_at).toLocaleDateString()}</p>
          </div>
          <div
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 pointer-events-auto cursor-pointer"
            style={{ position: 'relative', zIndex: 102 }}
          >
            Update Status
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Customer Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Name:</span> {order.customer_name}</p>
              <p><span className="text-gray-500">Email:</span> {order.customer_email}</p>
              <p><span className="text-gray-500">Phone:</span> {order.customer_phone}</p>
              <p><span className="text-gray-500">Store:</span> {order.store_location}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Prescription</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Sphere:</span> {order.prescription_sphere}</p>
              <p><span className="text-gray-500">Cylinder:</span> {order.prescription_cylinder}</p>
              <p><span className="text-gray-500">Axis:</span> {order.prescription_axis || 'N/A'}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Lens Details</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Type:</span> {order.lens_type}</p>
              <p><span className="text-gray-500">Index:</span> {order.lens_index}</p>
              <p><span className="text-gray-500">Coating:</span> {order.coating || 'None'}</p>
              <p><span className="text-gray-500">Frame:</span> {order.frame}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Order Status</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Status:</span> {order.status}</p>
              <p><span className="text-gray-500">Current Stage:</span> {order.current_stage}</p>
              <p><span className="text-gray-500">Priority:</span> {order.priority}</p>
              <p><span className="text-gray-500">SLA:</span> {order.sla_hours} hours</p>
              <p><span className="text-gray-500">Expected Delivery:</span> {order.expected_delivery ? new Date(order.expected_delivery).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>

        {order.delay_reason && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm"><span className="font-semibold">Delay Reason:</span> {order.delay_reason}</p>
          </div>
        )}
      </div>

      {/* Order History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Order History</h3>
        <div className="space-y-3">
          {order.history?.map((h, i) => (
            <div key={i} className="flex items-start space-x-3 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <p className="font-medium">{h.stage} - {h.status}</p>
                <p className="text-gray-500">{h.notes}</p>
                <p className="text-xs text-gray-400">{new Date(h.changed_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-md pointer-events-auto shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Update Order Status</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={updateData.status}
                    onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select Status</option>
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                  <select
                    value={updateData.stage}
                    onChange={(e) => setUpdateData({ ...updateData, stage: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select Stage</option>
                    {stages.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={updateData.notes}
                    onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delay Reason (if applicable)</label>
                  <input
                    type="text"
                    value={updateData.delay_reason}
                    onChange={(e) => setUpdateData({ ...updateData, delay_reason: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6 pointer-events-auto">
                <div
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 pointer-events-auto cursor-pointer"
                >
                  Cancel
                </div>
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 pointer-events-auto cursor-pointer"
                >
                  Update
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
