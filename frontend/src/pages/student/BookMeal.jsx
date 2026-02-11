import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Check, ChevronRight, ChevronLeft, ShoppingCart, Trash2, CreditCard, Users, Utensils } from 'lucide-react';
import MenuCard from '../../components/MenuCard';
import { 
    AnimatedCard, 
    AnimatedButton, 
    SlideUp, 
    FadeIn,
    CrowdGauge,
    TokenRing,
    useNotifications 
} from '../../components/ui';

const mockSlots = [
    { id: '1', name: 'Breakfast', time: '07:30 AM - 09:30 AM', capacity: 150, booked: 45 },
    { id: '2', name: 'Lunch', time: '12:00 PM - 02:00 PM', capacity: 200, booked: 180 },
    { id: '3', name: 'Snacks', time: '04:30 PM - 06:00 PM', capacity: 150, booked: 60 },
    { id: '4', name: 'Dinner', time: '07:30 PM - 09:30 PM', capacity: 200, booked: 90 },
];

const mockMenu = [
    { _id: '1', name: 'Veg Thali', category: 'veg', price: 120, isAvailable: true, description: 'Rice, Dal, 2 Roti, Sabzi, Curd, Salad' },
    { _id: '2', name: 'Chicken Biryani', category: 'non-veg', price: 180, isAvailable: true, description: 'Hyderabadi style chicken biryani with raita' },
    { _id: '3', name: 'Masala Dosa', category: 'veg', price: 80, isAvailable: true, description: 'Crispy rice crepe filled with spiced potatoes' },
    { _id: '4', name: 'Cold Coffee', category: 'beverage', price: 50, isAvailable: true, description: 'Chilled milk coffee with ice cream' },
    { _id: '5', name: 'Brownie', category: 'dessert', price: 70, isAvailable: true, description: 'Walnut brownie with chocolate sauce' },
    { _id: '6', name: 'Grilled Sandwich', category: 'veg', price: 90, isAvailable: true, description: 'Vegetable grilled sandwich with cheese' },
];

const StepIndicator = ({ currentStep, steps }) => (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', alignItems: 'center' }}>
        {steps.map((step, index) => {
            const isActive = index + 1 === currentStep;
            const isCompleted = index + 1 < currentStep;
            
            return (
                <React.Fragment key={step.id}>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            borderRadius: 'var(--radius-lg)',
                            background: isActive 
                                ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                                : isCompleted 
                                    ? 'var(--success-light)' 
                                    : 'var(--bg-secondary)',
                            color: isActive 
                                ? 'white' 
                                : isCompleted 
                                    ? 'var(--success)' 
                                    : 'var(--text-muted)',
                            fontWeight: isActive ? 600 : 400,
                            transition: 'all 0.3s ease',
                            flex: 1,
                            justifyContent: 'center',
                        }}
                    >
                        {isCompleted ? (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500 }}
                            >
                                <Check size={18} />
                            </motion.div>
                        ) : (
                            <span style={{ 
                                width: '24px', 
                                height: '24px', 
                                borderRadius: '50%',
                                background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.85rem',
                            }}>
                                {index + 1}
                            </span>
                        )}
                        <span className="hide-mobile">{step.label}</span>
                    </motion.div>
                    {index < steps.length - 1 && (
                        <ChevronRight size={20} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

const SlotCard = ({ slot, isSelected, onClick }) => {
    const occupancy = (slot.booked / slot.capacity) * 100;
    const crowdLevel = occupancy > 80 ? 'high' : occupancy > 50 ? 'moderate' : 'low';
    const crowdConfig = {
        low: { color: 'var(--success)', text: 'Low Traffic' },
        moderate: { color: 'var(--warning)', text: 'Moderate' },
        high: { color: 'var(--danger)', text: 'High Traffic' },
    };
    
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            style={{ cursor: 'pointer' }}
        >
            <AnimatedCard
                glowColor={isSelected ? 'rgba(255, 184, 0, 0.3)' : undefined}
                style={{
                    border: isSelected ? '2px solid var(--primary)' : '2px solid transparent',
                    transition: 'border-color 0.2s ease',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Utensils size={18} color="var(--primary)" />
                        {slot.name}
                    </h3>
                    <span style={{ 
                        color: crowdConfig[crowdLevel].color, 
                        fontWeight: 600, 
                        fontSize: '0.8rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 'var(--radius)',
                        background: `${crowdConfig[crowdLevel].color}20`,
                    }}>
                        {crowdConfig[crowdLevel].text}
                    </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    <Clock size={16} />
                    {slot.time}
                </div>

                <CrowdGauge current={slot.booked} max={slot.capacity} showLabel={false} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                    <p style={{ fontSize: '0.8rem', margin: 0, color: 'var(--text-muted)' }}>
                        <Users size={14} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                        {slot.capacity - slot.booked} seats available
                    </p>
                    {isSelected && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Check size={14} color="white" />
                        </motion.div>
                    )}
                </div>
            </AnimatedCard>
        </motion.div>
    );
};

const BookMeal = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [cart, setCart] = useState([]);
    const [step, setStep] = useState(1);
    const [isBooking, setIsBooking] = useState(false);
    const [bookingComplete, setBookingComplete] = useState(false);
    const [generatedToken, setGeneratedToken] = useState(null);
    const { addNotification } = useNotifications();

    const steps = [
        { id: 1, label: 'Select Slot' },
        { id: 2, label: 'Choose Menu' },
        { id: 3, label: 'Confirm' },
    ];

    const handleAddToCart = (item) => {
        setCart([...cart, item]);
        addNotification({
            type: 'success',
            title: 'Added to Cart',
            message: `${item.name} added`,
            duration: 2000,
        });
    };

    const removeFromCart = (index) => {
        const newCart = [...cart];
        const removed = newCart.splice(index, 1);
        setCart(newCart);
        addNotification({
            type: 'info',
            title: 'Removed',
            message: `${removed[0].name} removed from cart`,
            duration: 2000,
        });
    };

    const calculateTotal = () => cart.reduce((total, item) => total + item.price, 0);

    const handleBooking = async () => {
        setIsBooking(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        const token = Math.floor(Math.random() * 100) + 10;
        setGeneratedToken(token);
        setIsBooking(false);
        setBookingComplete(true);
        addNotification({
            type: 'success',
            title: 'Booking Confirmed!',
            message: `Your token number is #${token}`,
        });
    };

    if (bookingComplete) {
        return (
            <div className="container" style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: 'calc(100vh - 10rem)',
                textAlign: 'center',
            }}>
                <SlideUp>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    >
                        <TokenRing number={generatedToken} status="waiting" size="lg" />
                    </motion.div>
                    
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{ marginTop: '2rem' }}
                    >
                        Booking Confirmed!
                    </motion.h2>
                    
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}
                    >
                        {selectedSlot?.name} on {selectedDate} | Estimated wait: ~10 mins
                    </motion.p>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <AnimatedButton 
                            variant="primary" 
                            onClick={() => {
                                setStep(1);
                                setCart([]);
                                setSelectedSlot(null);
                                setBookingComplete(false);
                                setGeneratedToken(null);
                            }}
                        >
                            Book Another Meal
                        </AnimatedButton>
                    </motion.div>
                </SlideUp>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingBottom: '2rem' }}>
            <SlideUp>
                <h1 style={{ marginBottom: '1.5rem' }}>Book a Meal</h1>
                <StepIndicator currentStep={step} steps={steps} />
            </SlideUp>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <AnimatedCard style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                <Calendar size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                Select Date
                            </label>
                            <input
                                type="date"
                                className="form-input"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                style={{ maxWidth: '300px' }}
                            />
                        </AnimatedCard>

                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={20} />
                            Available Time Slots
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {mockSlots.map((slot, index) => (
                                <motion.div
                                    key={slot.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <SlotCard
                                        slot={slot}
                                        isSelected={selectedSlot?.id === slot.id}
                                        onClick={() => setSelectedSlot(slot)}
                                    />
                                </motion.div>
                            ))}
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <AnimatedButton 
                                variant="primary" 
                                disabled={!selectedSlot} 
                                onClick={() => setStep(2)}
                                icon={<ChevronRight size={18} />}
                                iconPosition="right"
                            >
                                Next: Select Menu
                            </AnimatedButton>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Menu for {selectedSlot?.name}</h3>
                            <motion.div
                                animate={{ scale: cart.length > 0 ? [1, 1.1, 1] : 1 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    background: 'var(--glass-bg)',
                                    backdropFilter: 'blur(10px)',
                                    padding: '0.75rem 1.25rem',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--border-color)',
                                }}
                            >
                                <ShoppingCart size={18} color="var(--primary)" />
                                <span style={{ fontWeight: 600 }}>{cart.length} items</span>
                                <span style={{ color: 'var(--text-muted)' }}>|</span>
                                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{calculateTotal()}</span>
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {mockMenu.map((item, index) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <MenuCard item={item} onOrder={handleAddToCart} />
                                </motion.div>
                            ))}
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                            <AnimatedButton 
                                variant="outline" 
                                onClick={() => setStep(1)}
                                icon={<ChevronLeft size={18} />}
                            >
                                Back
                            </AnimatedButton>
                            <AnimatedButton 
                                variant="primary" 
                                disabled={cart.length === 0} 
                                onClick={() => setStep(3)}
                                icon={<ChevronRight size={18} />}
                                iconPosition="right"
                            >
                                Review Order
                            </AnimatedButton>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <AnimatedCard style={{ maxWidth: '600px', margin: '0 auto' }}>
                            <h3 style={{ textAlign: 'center', marginBottom: '2rem' }}>Booking Summary</h3>

                            <div style={{ 
                                padding: '1rem', 
                                background: 'var(--bg-secondary)', 
                                borderRadius: 'var(--radius)',
                                marginBottom: '1.5rem',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <Calendar size={16} color="var(--primary)" />
                                    <strong>Date:</strong> {selectedDate}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <Clock size={16} color="var(--primary)" />
                                    <strong>Slot:</strong> {selectedSlot?.name} ({selectedSlot?.time})
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Users size={16} color="var(--warning)" />
                                    <strong>Crowd Status:</strong> 
                                    <span style={{ color: 'var(--warning)' }}>Moderate - Expect ~10 min wait</span>
                                </div>
                            </div>

                            <div style={{ 
                                borderTop: '1px solid var(--border-color)', 
                                borderBottom: '1px solid var(--border-color)', 
                                padding: '1rem 0', 
                                marginBottom: '1.5rem' 
                            }}>
                                <AnimatePresence>
                                    {cart.map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                padding: '0.5rem 0',
                                            }}
                                        >
                                            <span>{item.name}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <span style={{ fontWeight: 600 }}>₹{item.price}</span>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => removeFromCart(idx)}
                                                    style={{
                                                        background: 'var(--danger-light)',
                                                        border: 'none',
                                                        borderRadius: 'var(--radius)',
                                                        padding: '0.35rem',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                    }}
                                                >
                                                    <Trash2 size={14} color="var(--danger)" />
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    marginTop: '1rem', 
                                    paddingTop: '1rem',
                                    borderTop: '1px dashed var(--border-color)',
                                    fontWeight: 700, 
                                    fontSize: '1.25rem' 
                                }}>
                                    <span>Total</span>
                                    <span style={{ color: 'var(--primary)' }}>₹{calculateTotal()}</span>
                                </div>
                            </div>

                            <AnimatedButton 
                                variant="primary" 
                                fullWidth 
                                size="lg"
                                loading={isBooking}
                                onClick={handleBooking}
                                icon={<CreditCard size={18} />}
                            >
                                Confirm Booking & Pay
                            </AnimatedButton>
                            
                            <AnimatedButton
                                variant="ghost"
                                fullWidth
                                onClick={() => setStep(2)}
                                style={{ marginTop: '0.75rem' }}
                            >
                                Modify Order
                            </AnimatedButton>
                        </AnimatedCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BookMeal;
