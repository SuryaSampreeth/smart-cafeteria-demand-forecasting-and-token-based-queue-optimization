import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bell, Settings, MapPin, ChevronRight, Plus, Minus } from 'lucide-react';

const RightSidebar = ({ cart = [], onRemove }) => {
    const { user } = useContext(AuthContext);

    // Mock calculations for visual
    const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
    const serviceFee = 20; // Fixed mock fee
    const total = subtotal > 0 ? subtotal + serviceFee : 0;

    return (
        <div style={{
            width: 'var(--rightbar-width)',
            height: '100vh',
            background: '#fff',
            padding: '2rem',
            borderLeft: '1px solid #f0f0f0',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
        }}>
            {/* Header Icons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
                <button className="icon-btn" style={{ background: '#f5f5f5' }}><Bell size={20} /></button>
                <button className="icon-btn" style={{ background: '#f5f5f5' }}><Settings size={20} /></button>
                <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'var(--primary)', overflow: 'hidden' }}>
                    <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=fbc02d&color=fff`} alt="Profile" style={{ width: '100%', height: '100%' }} />
                </div>
            </div>

            {/* Wallet / Balance */}
            <p style={{ fontWeight: 600, marginBottom: '1rem' }}>Your Balance</p>
            <div style={{
                background: 'linear-gradient(135deg, #fbc02d 0%, #ff9800 100%)',
                borderRadius: '20px',
                padding: '1.5rem',
                color: 'white',
                marginBottom: '2rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>Balance</p>
                        <h2 style={{ fontSize: '1.8rem' }}>₹125.00</h2>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '8px', flex: 1, textAlign: 'center' }}>
                        Token #42
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '8px', flex: 1, textAlign: 'center' }}>
                        Top Up
                    </div>
                </div>
            </div>

            {/* Address */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>Your Address</p>
                <button style={{ border: 'none', background: 'transparent', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>Change</button>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <MapPin size={24} color="var(--primary)" style={{ marginTop: '0.2rem' }} />
                <div>
                    <p style={{ fontWeight: 600 }}>Elm Street, 23</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
            </div>

            {/* Order Menu (Cart) */}
            <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, marginBottom: '1rem' }}>Order Menu</p>
                {cart.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '2rem 0' }}>Cart is empty</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {cart.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ width: 60, height: 60, borderRadius: '12px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={`https://source.unsplash.com/100x100/?food,${item.category}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>₹{item.price}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>1</span>
                                    <button
                                        onClick={() => onRemove(idx)}
                                        style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid #ddd', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                    >
                                        <Minus size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Total & Checkout */}
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Service</span>
                    <span style={{ fontWeight: 600 }}>₹{cart.length > 0 ? serviceFee : 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total</span>
                    <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>₹{total}</span>
                </div>

                <div style={{ background: '#f9f9f9', borderRadius: '12px', padding: '0.5rem', display: 'flex', marginBottom: '1rem' }}>
                    <div style={{ padding: '0.5rem', background: 'var(--primary)', borderRadius: '8px', color: 'white' }}>%</div>
                    <input type="text" placeholder="Have a coupon code?" style={{ border: 'none', background: 'transparent', padding: '0 0.5rem', outline: 'none', width: '100%' }} />
                    <ChevronRight size={20} color="var(--text-muted)" />
                </div>

                <button className="btn btn-primary" style={{ width: '100%' }} disabled={cart.length === 0}>
                    Checkout
                </button>
            </div>
        </div>
    );
};

export default RightSidebar;
