import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Leaf, Drumstick, Coffee, Cookie, X, Loader } from 'lucide-react';
import api from '../../services/api';
import MenuCard from '../../components/MenuCard';
import { 
    SlideUp, 
    StaggerContainer, 
    StaggerItem,
    AnimatedButton,
    useNotifications 
} from '../../components/ui';

const categories = [
    { id: 'all', label: 'All', icon: null },
    { id: 'veg', label: 'Veg', icon: Leaf, color: 'var(--success)' },
    { id: 'non-veg', label: 'Non-Veg', icon: Drumstick, color: 'var(--danger)' },
    { id: 'beverage', label: 'Beverage', icon: Coffee, color: 'var(--primary)' },
    { id: 'dessert', label: 'Dessert', icon: Cookie, color: 'var(--warning)' },
];

const Menu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const { addNotification } = useNotifications();

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await api.get('/menu/items');
                setMenuItems(response.data);
            } catch (err) {
                console.error("Failed to fetch menu:", err);
                setMenuItems([
                    { _id: '1', name: 'Veg Thali', category: 'veg', price: 120, isAvailable: true, description: 'Complete meal with rice, dal, and veggies.' },
                    { _id: '2', name: 'Chicken Biryani', category: 'non-veg', price: 180, isAvailable: true, description: 'Aromatic basmati rice cooked with chicken.' },
                    { _id: '3', name: 'Masala Dosa', category: 'veg', price: 80, isAvailable: true, description: 'Crispy rice crepe with spiced potatoes.' },
                    { _id: '4', name: 'Cold Coffee', category: 'beverage', price: 40, isAvailable: true, description: 'Chilled coffee with ice cream.' },
                    { _id: '5', name: 'Chocolate Brownie', category: 'dessert', price: 60, isAvailable: true, description: 'Rich chocolate brownie.' },
                    { _id: '6', name: 'Grilled Sandwich', category: 'veg', price: 90, isAvailable: true, description: 'Vegetable grilled sandwich with cheese.' },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, []);

    const handleAddToCart = (item) => {
        addNotification({
            type: 'success',
            title: 'Added to Cart',
            message: `${item.name} - ₹${item.price}`,
            duration: 2000,
        });
    };

    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="container" style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: 'calc(100vh - 10rem)',
            }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    <Loader size={40} color="var(--primary)" />
                </motion.div>
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading menu...</p>
            </div>
        );
    }

    return (
        <div className="container">
            <SlideUp>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ marginBottom: '0.5rem' }}>Today's Menu</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                        Browse our selection of freshly prepared items
                    </p>
                </div>
            </SlideUp>

            {/* Search & Filter Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    marginBottom: '2rem',
                }}
            >
                {/* Search Input */}
                <div style={{ position: 'relative', maxWidth: '400px' }}>
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
                        placeholder="Search menu items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '2.75rem', paddingRight: searchQuery ? '2.5rem' : '1rem' }}
                    />
                    <AnimatePresence>
                        {searchQuery && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={() => setSearchQuery('')}
                                style={{
                                    position: 'absolute',
                                    right: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'var(--bg-secondary)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                }}
                            >
                                <X size={14} color="var(--text-muted)" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Category Filter */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {categories.map((cat, index) => {
                        const IconComponent = cat.icon;
                        const isActive = activeCategory === cat.id;
                        
                        return (
                            <motion.button
                                key={cat.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveCategory(cat.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: isActive ? 600 : 500,
                                    background: isActive 
                                        ? (cat.color || 'var(--primary)') 
                                        : 'var(--bg-secondary)',
                                    color: isActive ? 'white' : 'var(--text-secondary)',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {IconComponent && <IconComponent size={16} />}
                                {cat.label}
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Results count */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ 
                    color: 'var(--text-muted)', 
                    marginBottom: '1rem',
                    fontSize: '0.9rem',
                }}
            >
                {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
            </motion.p>

            {/* Menu Grid */}
            <StaggerContainer>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item) => (
                            <StaggerItem key={item._id}>
                                <MenuCard item={item} onOrder={handleAddToCart} />
                            </StaggerItem>
                        ))}
                    </AnimatePresence>
                </div>
            </StaggerContainer>

            {/* Empty State */}
            {filteredItems.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        textAlign: 'center',
                        padding: '3rem',
                        color: 'var(--text-muted)',
                    }}
                >
                    <Search size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h3 style={{ marginBottom: '0.5rem' }}>No items found</h3>
                    <p style={{ marginBottom: '1rem' }}>Try adjusting your search or filter</p>
                    <AnimatedButton 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                            setSearchQuery('');
                            setActiveCategory('all');
                        }}
                    >
                        Clear Filters
                    </AnimatedButton>
                </motion.div>
            )}
        </div>
    );
};

export default Menu;
