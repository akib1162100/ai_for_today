import React, { useState, useEffect } from 'react';
import { Palette, X, Type, Layers, Layout, Save, Trash2, Sliders, Maximize, Minimize } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ThemeEditor = ({ onClose }) => {
    const { user, updateTheme } = useAuth();
    const [theme, setTheme] = useState({
        backgroundType: 'solid',
        backgroundColor: '#f3f4f6',
        gradientStart: '#6366f1',
        gradientEnd: '#a855f7',
        gradientAngle: 135,
        color: '#111827',
        fontFamily: "'Inter', sans-serif",
        fontSize: 16,
        sidebarColor: '#0088cc',
        cardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        radius: 1,
        layoutHeight: 'auto'
    });

    useEffect(() => {
        if (user?.profile_theme) {
            setTheme({ ...theme, ...user.profile_theme });
        }
    }, [user]);

    const handleSave = async () => {
        await updateTheme(theme);
        onClose();
    };

    return (
        <div className="glass-panel slide-up" style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '95%', maxWidth: '700px', zIndex: 1000, padding: '2.5rem',
            boxShadow: '0 0 0 100vw rgba(0,0,0,0.5), 0 25px 50px -12px rgba(0,0,0,0.5)',
            border: '2px solid var(--sidebar-bg)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                    <Sliders size={28} /> Global Style Engine
                </h2>
                <X style={{ cursor: 'pointer' }} onClick={onClose} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxHeight: '65vh', overflowY: 'auto', paddingRight: '1rem' }}>
                {/* Backdrop Settings */}
                <section>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--sidebar-bg)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Palette size={18} /> Master Backdrop</h3>
                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
                        {['solid', 'gradient'].map(t => (
                            <button key={t} type="button" className={`btn ${theme.backgroundType === t ? 'btn-primary' : ''}`} style={{ flex: 1, fontSize: '0.8rem' }} onClick={() => setTheme({ ...theme, backgroundType: t })}>{t.toUpperCase()}</button>
                        ))}
                    </div>
                    {theme.backgroundType === 'solid' ? (
                        <div className="mb-4">
                            <label className="input-label">Background Color</label>
                            <input type="color" className="input-field" style={{ height: '40px' }} value={theme.backgroundColor} onChange={e => setTheme({ ...theme, backgroundColor: e.target.value })} />
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <div>
                                <label className="input-label">Start</label>
                                <input type="color" className="input-field" style={{ height: '40px' }} value={theme.gradientStart} onChange={e => setTheme({ ...theme, gradientStart: e.target.value })} />
                            </div>
                            <div>
                                <label className="input-label">End</label>
                                <input type="color" className="input-field" style={{ height: '40px' }} value={theme.gradientEnd} onChange={e => setTheme({ ...theme, gradientEnd: e.target.value })} />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="input-label">Angle ({theme.gradientAngle}°)</label>
                                <input type="range" min="0" max="360" value={theme.gradientAngle} onChange={e => setTheme({ ...theme, gradientAngle: parseInt(e.target.value) })} style={{ width: '100%' }} />
                            </div>
                        </div>
                    )}
                    <div className="mt-4">
                        <label className="input-label">Sidebar Primary Color</label>
                        <input type="color" className="input-field" style={{ height: '40px' }} value={theme.sidebarColor} onChange={e => setTheme({ ...theme, sidebarColor: e.target.value })} />
                    </div>
                </section>

                {/* Typography Settings */}
                <section>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--sidebar-bg)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Type size={18} /> Global Typography</h3>
                    <div className="mb-4">
                        <label className="input-label">Font Family</label>
                        <select className="input-field" value={theme.fontFamily} onChange={e => setTheme({ ...theme, fontFamily: e.target.value })}>
                            <option value="'Inter', sans-serif">Modern Sans (Inter)</option>
                            <option value="'Roboto', sans-serif">Standard (Roboto)</option>
                            <option value="'Outfit', sans-serif">Premium (Outfit)</option>
                            <option value="'Montserrat', sans-serif">Sleek (Montserrat)</option>
                            <option value="'Space Grotesk', sans-serif">Futuristic (Space Grotesk)</option>
                            <option value="'Playfair Display', serif">Elegant (Playfair)</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="input-label">Base Font Size ({theme.fontSize}px)</label>
                        <input type="range" min="12" max="24" value={theme.fontSize} onChange={e => setTheme({ ...theme, fontSize: parseInt(e.target.value) })} style={{ width: '100%' }} />
                    </div>
                    <div className="mb-4">
                        <label className="input-label">Global Text Color</label>
                        <input type="color" className="input-field" style={{ height: '40px' }} value={theme.color} onChange={e => setTheme({ ...theme, color: e.target.value })} />
                    </div>
                </section>

                {/* Layout Density Settings */}
                <section>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--sidebar-bg)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Layout size={18} /> Layout Density</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['compact', 'auto', 'relaxed'].map(l => (
                            <button key={l} type="button" className={`btn ${theme.layoutHeight === l ? 'btn-primary' : ''}`} style={{ flex: 1, fontSize: '0.75rem' }} onClick={() => setTheme({ ...theme, layoutHeight: l })}>
                                {l === 'compact' ? <Minimize size={14} /> : l === 'relaxed' ? <Maximize size={14} /> : <Layers size={14} />} {l.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Aesthetic Detail SETTINGS */}
                <section>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--sidebar-bg)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Layers size={18} /> Aesthetic Nuance</h3>
                    <div className="mb-4">
                        <label className="input-label">Corner Roundness</label>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                            {[0, 0.5, 1, 1.5, 2].map(r => (
                                <button key={r} type="button" className={`btn ${theme.radius === r ? 'btn-primary' : ''}`} style={{ flex: 1, fontSize: '0.8rem' }} onClick={() => setTheme({ ...theme, radius: r })}>{r}x</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Global Shadow Depth</label>
                        <select className="input-field" value={theme.cardShadow} onChange={e => setTheme({ ...theme, cardShadow: e.target.value })}>
                            <option value="none">Flat</option>
                            <option value="0 4px 6px -1px rgba(0, 0, 0, 0.1)">Subtle</option>
                            <option value="0 10px 15px -3px rgba(0, 0, 0, 0.1)">Medium</option>
                            <option value="0 25px 50px -12px rgba(0, 0, 0, 0.25)">Immersive</option>
                        </select>
                    </div>
                </section>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '1.25rem', fontSize: '1.1rem' }} onClick={handleSave}>
                <Save size={24} /> Deploy Site-Wide Master Theme
            </button>
        </div>
    );
};

export default ThemeEditor;
