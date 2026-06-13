import React, { useState, useEffect } from 'react';
import { Plus, Search, AlertTriangle } from 'lucide-react';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    sphere_power: 0, cylinder_power: 0, axis: null,
    lens_type: 'single_vision', lens_index: '1.50', coating: '',
    quantity: 0, location: 'warehouse'
  });

  useEffect(() => {
    fetchInventory();
    fetchLowStock();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const fetchLowStock = async () => {
    try {
      const res = await fetch('/api/inventory/alerts/low-stock');
      const data = await res.json();
      setLowStock(data);
    } catch (error) {
      console.error('Error fetching low stock:', error);
    }
  };

  const checkAvailability = async () => {
    try {
      const res = await fetch('/api/inventory/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sphere_power: newItem.sphere_power,
          cylinder_power: newItem.cylinder_power,
          axis: newItem.axis,
          lens_type: newItem.lens_type,
          lens_index: newItem.lens_index,
          coating: newItem.coating || null
        })
      });
      const data = await res.json();
      alert(`Availability: ${data.available ? 'In Stock' : 'Out of Stock'}\nQuantity: ${data.quantity}`);
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  const addInventory = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      setShowAddModal(false);
      fetchInventory();
    } catch (error) {
      console.error('Error adding inventory:', error);
    }
  };

  return (
    <div className="space-y-6 pointer-events-auto" style={{ position: 'relative', zIndex: 100 }}>
      <div className="flex justify-between items-center pointer-events-auto" style={{ position: 'relative', zIndex: 101 }}>
        <h1 className="text-2xl font-bold text-gray-800">Lens Inventory</h1>
        <div
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 pointer-events-auto cursor-pointer"
          style={{ position: 'relative', zIndex: 102 }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Inventory</span>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <h2 className="text-lg font-semibold text-yellow-800">Low Stock Alerts</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStock.map(item => (
              <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm">
                <p className="font-semibold">{item.lens_type} - {item.lens_index}</p>
                <p className="text-sm text-gray-600">SPH: {item.sphere_power} CYL: {item.cylinder_power}</p>
                <p className="text-sm font-medium text-red-600">Qty: {item.quantity}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Check */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Availability Check</h2>
        <div className="grid grid-cols-4 gap-4">
          <input
            type="number"
            step="0.25"
            placeholder="Sphere Power"
            value={newItem.sphere_power}
            onChange={(e) => setNewItem({ ...newItem, sphere_power: parseFloat(e.target.value) })}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <input
            type="number"
            step="0.25"
            placeholder="Cylinder Power"
            value={newItem.cylinder_power}
            onChange={(e) => setNewItem({ ...newItem, cylinder_power: parseFloat(e.target.value) })}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <select
            value={newItem.lens_type}
            onChange={(e) => setNewItem({ ...newItem, lens_type: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="single_vision">Single Vision</option>
            <option value="bifocal">Bifocal</option>
            <option value="progressive">Progressive</option>
          </select>
          <select
            value={newItem.lens_index}
            onChange={(e) => setNewItem({ ...newItem, lens_index: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="1.50">1.50</option>
            <option value="1.60">1.60</option>
            <option value="1.67">1.67</option>
            <option value="1.74">1.74</option>
          </select>
        </div>
        <div
          onClick={checkAvailability}
          className="mt-4 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-purple-600 pointer-events-auto cursor-pointer"
          style={{ position: 'relative', zIndex: 102 }}
        >
          Check Availability
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lens Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Index</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sphere</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cylinder</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inventory.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{item.lens_type}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.lens_index}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.sphere_power}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.cylinder_power}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.coating || 'None'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={item.quantity < 10 ? 'text-red-600 font-semibold' : ''}>
                    {item.quantity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{item.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-md pointer-events-auto shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Add Inventory</h3>
            <form onSubmit={addInventory}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    step="0.25"
                    placeholder="Sphere Power"
                    value={newItem.sphere_power}
                    onChange={(e) => setNewItem({ ...newItem, sphere_power: parseFloat(e.target.value) })}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                  <input
                    type="number"
                    step="0.25"
                    placeholder="Cylinder Power"
                    value={newItem.cylinder_power}
                    onChange={(e) => setNewItem({ ...newItem, cylinder_power: parseFloat(e.target.value) })}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <input
                  type="number"
                  placeholder="Axis (optional)"
                  value={newItem.axis || ''}
                  onChange={(e) => setNewItem({ ...newItem, axis: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <select
                  value={newItem.lens_type}
                  onChange={(e) => setNewItem({ ...newItem, lens_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="single_vision">Single Vision</option>
                  <option value="bifocal">Bifocal</option>
                  <option value="progressive">Progressive</option>
                </select>
                <select
                  value={newItem.lens_index}
                  onChange={(e) => setNewItem({ ...newItem, lens_index: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="1.50">1.50</option>
                  <option value="1.60">1.60</option>
                  <option value="1.67">1.67</option>
                  <option value="1.74">1.74</option>
                </select>
                <input
                  type="text"
                  placeholder="Coating (optional)"
                  value={newItem.coating}
                  onChange={(e) => setNewItem({ ...newItem, coating: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={newItem.location}
                    onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6 pointer-events-auto">
                <div
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 pointer-events-auto cursor-pointer"
                >
                  Cancel
                </div>
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    addInventory(e);
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 pointer-events-auto cursor-pointer"
                >
                  Add
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
