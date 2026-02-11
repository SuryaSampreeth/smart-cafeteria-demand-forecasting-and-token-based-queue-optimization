import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, Save, Leaf, Drumstick, Coffee, Cookie, Search, Check } from 'lucide-react';
import { 
    AnimatedCard, 
    AnimatedButton, 
    SlideUp,
    useNotifications 
} from '../../components/ui';

const mockMenuItems = [
    { _id: '1', name: 'Veg Thali', category: 'veg', price: 120, isAvailable: true, description: 'Complete meal with rice, dal, and veggies.' },
    { _id: '2', name: 'Chicken Biryani', category: 'non-veg', price: 180, isAvailable: true, description: 'Aromatic basmati rice cooked with chicken.' },
    { _id: '3', name: 'Cold Coffee', category: 'beverage', price: 40, isAvailable: true, description: 'Chilled coffee with ice cream.' },
    { _id: '4', name: 'Chocolate Brownie', category: 'dessert', price: 60, isAvailable: false, description: 'Rich chocolate brownie.' },
    { _id: '5', name: 'Masala Dosa', category: 'veg', price: 80, isAvailable: true, description: 'Crispy crepe with spiced potatoes.' },
];

const categories = [
    { value: 'veg', label: 'Veg', icon: Leaf, color: 'var(--success)' },
    { value: 'non-veg', label: 'Non-Veg', icon: Drumstick, color: 'var(--danger)' },
    { value: 'beverage', label: 'Beverage', icon: Coffee, color: 'var(--primary)' },
    { value: 'dessert', label: 'Dessert', icon: Cookie, color: 'var(--warning)' },
];

const CategoryBadge = ({ category }) => {
    const cat = categories.find(c => c.value === category) || categories[0];
    const Icon = cat.icon;
    
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: `${cat.color}15`,
            color: cat.color,
            textTransform: 'capitalize',
        }}>
            <Icon size={12} />
            {cat.label}
        </span>
    );
};

const AddEditModal = ({ item, onClose, onSave }) => {
    const [formData, setFormData] = useState(item || {
        name: '',
        category: 'veg',
        price: '',
        description: '',
        isAvailable: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                zIndex: 1000,
            }}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: '500px',
                }}
            >
                <AnimatedCard>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0 }}>{item ? 'Edit Item' : 'Add New Item'}</h2>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            style={{
                                background: 'var(--bg-secondary)',
                                border: 'none',
                                borderRadius: 'var(--radius)',
                                padding: '0.5rem',
                                cursor: 'pointer',
                            }}
                        >
                            <X size={18} color="var(--text-secondary)" />
                        </motion.button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Item Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter item name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                {categories.map((cat) => {
                                    const Icon = cat.icon;
                                    const isSelected = formData.category === cat.value;
                                    return (
                                        <motion.button
                                            key={cat.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, category: cat.value })}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            style={{
                                                padding: '0.75rem',
                                                borderRadius: 'var(--radius)',
                                                border: isSelected ? `2px solid ${cat.color}` : '2px solid var(--border-color)',
                                                background: isSelected ? `${cat.color}15` : 'var(--bg-secondary)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                            }}
                                        >
                                            <Icon size={18} color={isSelected ? cat.color : 'var(--text-muted)'} />
                                            <span style={{ color: isSelected ? cat.color : 'var(--text-secondary)', fontWeight: isSelected ? 600 : 400 }}>
                                                {cat.label}
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Price (₹)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="Enter price"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-input"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description"
                                rows={3}
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <AnimatedButton variant="outline" onClick={onClose} style={{ flex: 1 }}>
                                Cancel
                            </AnimatedButton>
                            <AnimatedButton type="submit" variant="primary" icon={<Save size={16} />} style={{ flex: 1 }}>
                                {item ? 'Update' : 'Add Item'}
                            </AnimatedButton>
                        </div>
                    </form>
                </AnimatedCard>
            </motion.div>
        </motion.div>
    );
};

const ManageMenu = () => {
    const [items, setItems] = useState(mockMenuItems);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { addNotification } = useNotifications();

    const toggleAvailability = (id) => {
        setItems(items.map(item => {
            if (item._id === id) {
                const updated = { ...item, isAvailable: !item.isAvailable };
                addNotification({
                    type: updated.isAvailable ? 'success' : 'info',
                    title: updated.isAvailable ? 'Item Available' : 'Item Unavailable',
                    message: `${item.name} is now ${updated.isAvailable ? 'available' : 'unavailable'}`,
                });
                return updated;
            }
            return item;
        }));
    };

    const handleDelete = (id) => {
        const item = items.find(i => i._id === id);
        setItems(items.filter(item => item._id !== id));
        addNotification({
            type: 'info',
            title: 'Item Deleted',
            message: `${item.name} has been removed from the menu`,
        });
    };

    const handleSave = (formData) => {
        if (editItem) {
            setItems(items.map(item => item._id === editItem._id ? { ...item, ...formData } : item));
            addNotification({
                type: 'success',
                title: 'Item Updated',
                message: `${formData.name} has been updated`,
            });
        } else {
            const newItem = { ...formData, _id: Date.now().toString() };
            setItems([...items, newItem]);
            addNotification({
                type: 'success',
                title: 'Item Added',
                message: `${formData.name} has been added to the menu`,
            });
        }
        setShowModal(false);
        setEditItem(null);
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container">
            <SlideUp>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h1 style={{ margin: 0 }}>Manage Menu</h1>
                    <AnimatedButton
                        variant="primary"
                        icon={<Plus size={18} />}
                        onClick={() => { setEditItem(null); setShowModal(true); }}
                    >
                        Add New Item
                    </AnimatedButton>
                </div>
            </SlideUp>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ marginBottom: '1.5rem', maxWidth: '300px' }}
            >
                <div style={{ position: 'relative' }}>
                    <Search 
                        size={18} 
                        style={{ 
                            position: 'absolute', 
                            left: '1rem', 
                            top: '50%', 
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)',
                        }} 
                    />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '2.75rem' }}
                    />
                </div>
            </motion.div>

            {/* Table */}
            <AnimatedCard style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th style={{ textAlign: 'center' }}>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredItems.map((item, index) => (
                                    <motion.tr
                                        key={item._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <td>
                                            <div>
                                                <span style={{ fontWeight: 600 }}>{item.name}</span>
                                                {item.description && (
                                                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td><CategoryBadge category={item.category} /></td>
                                        <td style={{ fontWeight: 600 }}>₹{item.price}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => toggleAvailability(item._id)}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.35rem',
                                                    background: item.isAvailable ? 'var(--success)' : 'var(--text-muted)',
                                                    color: 'white',
                                                    padding: '0.35rem 0.75rem',
                                                    borderRadius: '20px',
                                                    border: 'none',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {item.isAvailable && <Check size={12} />}
                                                {item.isAvailable ? 'Active' : 'Unavailable'}
                                            </motion.button>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => { setEditItem(item); setShowModal(true); }}
                                                    style={{
                                                        background: 'var(--bg-secondary)',
                                                        border: '1px solid var(--border-color)',
                                                        borderRadius: 'var(--radius)',
                                                        padding: '0.5rem',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                    }}
                                                >
                                                    <Edit size={16} color="var(--text-secondary)" />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleDelete(item._id)}
                                                    style={{
                                                        background: 'var(--danger-light)',
                                                        border: '1px solid transparent',
                                                        borderRadius: 'var(--radius)',
                                                        padding: '0.5rem',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                    }}
                                                >
                                                    <Trash2 size={16} color="var(--danger)" />
                                                </motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {filteredItems.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No items found
                    </div>
                )}
            </AnimatedCard>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <AddEditModal
                        item={editItem}
                        onClose={() => { setShowModal(false); setEditItem(null); }}
                        onSave={handleSave}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageMenu;
