import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, Eye } from 'lucide-react';

export default function NewOrder() {
  const navigate = useNavigate();
  const [order, setOrder] = useState({
    order_number: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    store_location: 'New York',
    prescription_sphere: 0,
    prescription_cylinder: 0,
    prescription_axis: null,
    lens_type: 'single_vision',
    lens_index: '1.50',
    coating: '',
    frame: '',
    priority: 'normal'
  });
  const [inventoryCheck, setInventoryCheck] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const checkInventory = async () => {
    try {
      const res = await fetch('/api/inventory/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sphere_power: order.prescription_sphere,
          cylinder_power: order.prescription_cylinder,
          axis: order.prescription_axis,
          lens_type: order.lens_type,
          lens_index: order.lens_index,
          coating: order.coating || null
        })
      });
      const data = await res.json();
      setInventoryCheck(data);
    } catch (error) {
      console.error('Error checking inventory:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => navigate('/orders'), 2000);
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const generateOrderNumber = () => {
    const num = Math.floor(Math.random() * 9000) + 1000;
    setOrder({ ...order, order_number: `ORD-${num}` });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Create New Order</h1>
        <button
          onClick={() => navigate('/orders')}
          className="text-primary hover:text-blue-600"
        >
          Cancel
        </button>
      </div>

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="text-green-800 font-semibold">Order created successfully! Redirecting...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={order.order_number}
                  onChange={(e) => setOrder({ ...order, order_number: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
                <button
                  type="button"
                  onClick={generateOrderNumber}
                  className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Auto
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input
                type="text"
                value={order.customer_name}
                onChange={(e) => setOrder({ ...order, customer_name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={order.customer_email}
                onChange={(e) => setOrder({ ...order, customer_email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={order.customer_phone}
                onChange={(e) => setOrder({ ...order, customer_phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Location</label>
              <select
                value={order.store_location}
                onChange={(e) => setOrder({ ...order, store_location: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="New York">New York</option>
                <option value="Los Angeles">Los Angeles</option>
                <option value="Chicago">Chicago</option>
                <option value="Miami">Miami</option>
                <option value="Seattle">Seattle</option>
              </select>
            </div>
          </div>
        </div>

        {/* Prescription */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Prescription Details</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sphere (SPH)</label>
              <input
                type="number"
                step="0.25"
                value={order.prescription_sphere}
                onChange={(e) => setOrder({ ...order, prescription_sphere: parseFloat(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cylinder (CYL)</label>
              <input
                type="number"
                step="0.25"
                value={order.prescription_cylinder}
                onChange={(e) => setOrder({ ...order, prescription_cylinder: parseFloat(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Axis</label>
              <input
                type="number"
                value={order.prescription_axis || ''}
                onChange={(e) => setOrder({ ...order, prescription_axis: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Lens Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Lens Details</h2>
            <button
              type="button"
              onClick={checkInventory}
              className="flex items-center space-x-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-purple-600"
            >
              <Eye className="w-4 h-4" />
              <span>Check Inventory</span>
            </button>
          </div>

          {inventoryCheck && (
            <div className={`mb-4 p-4 rounded-lg ${inventoryCheck.available ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={inventoryCheck.available ? 'text-green-800' : 'text-red-800'}>
                {inventoryCheck.available ? '✓ In Stock' : '✗ Out of Stock'} - Quantity: {inventoryCheck.quantity}
                {inventoryCheck.location && ` at ${inventoryCheck.location}`}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lens Type</label>
              <select
                value={order.lens_type}
                onChange={(e) => setOrder({ ...order, lens_type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="single_vision">Single Vision</option>
                <option value="bifocal">Bifocal</option>
                <option value="progressive">Progressive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lens Index</label>
              <select
                value={order.lens_index}
                onChange={(e) => setOrder({ ...order, lens_index: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="1.50">1.50</option>
                <option value="1.60">1.60</option>
                <option value="1.67">1.67</option>
                <option value="1.74">1.74</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coating</label>
              <input
                type="text"
                value={order.coating}
                onChange={(e) => setOrder({ ...order, coating: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="e.g., anti_reflective"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frame</label>
              <input
                type="text"
                value={order.frame}
                onChange={(e) => setOrder({ ...order, frame: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={order.priority}
                onChange={(e) => setOrder({ ...order, priority: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center space-x-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            <Save className="w-4 h-4" />
            <span>Create Order</span>
          </button>
        </div>
      </form>
    </div>
  );
}
