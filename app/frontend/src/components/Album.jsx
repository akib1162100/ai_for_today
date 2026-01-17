import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Camera, Image as ImageIcon, Video, Trash2, Palette, User as UserIcon, Type, Edit3, Save, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Album = () => {
    const [items, setItems] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showDesign, setShowDesign] = useState(false);
    const { user } = useAuth();

    const [designState, setDesignState] = useState({
        backgroundColor: '#ffffff', backgroundType: 'solid',
        gradientStart: '#6366f1', gradientEnd: '#a855f7', gradientAngle: 135,
        color: '#1f2937', width: 2, customHeight: 350,
        fontSize: 14, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center',
        fontFamily: "'Inter', sans-serif"
    });

    useEffect(() => { fetchAlbum(); }, []);

    const fetchAlbum = async () => {
        try {
            const res = await axios.get('http://localhost:8000/album/');
            setItems(res.data);
        } catch (err) { console.error(err); }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('is_public', 'false');
        setUploading(true);
        try {
            await axios.post('http://localhost:8000/album/upload', formData);
            fetchAlbum();
        } catch (err) { console.error(err); }
        finally { setUploading(false); }
    };

    const handleUpdateDesign = async (itemId) => {
        try {
            await axios.put(`http://localhost:8000/album/${itemId}/design`, designState);
            setEditingItem(null); setShowDesign(false);
            fetchAlbum();
        } catch (err) { console.error(err); }
    };

    const deleteItem = async (id) => {
        if (!confirm("Remove this asset?")) return;
        try { await axios.delete(`http://localhost:8000/album/${id}`); fetchAlbum(); } catch (err) { console.error(err); }
    };

    const startEdit = (item) => {
        setEditingItem(item.id);
        setDesignState({ ...designState, ...item.design_config });
        setShowDesign(true);
    };

    const getCardStyle = (design) => {
        if (!design) return {};
        let style = {
            color: design.color,
            minHeight: design.customHeight ? `${design.customHeight}px` : '350px',
            fontSize: design.fontSize ? `${design.fontSize}px` : 'inherit',
            fontWeight: design.fontWeight || 'normal',
            fontStyle: design.fontStyle || 'normal',
            textAlign: design.textAlign || 'center',
            fontFamily: design.fontFamily || 'inherit'
        };
        if (design.backgroundType === 'glass') style.background = 'rgba(255, 255, 255, 0.45)';
        else if (design.backgroundType === 'gradient') style.background = `linear-gradient(${design.gradientAngle}deg, ${design.gradientStart}, ${design.gradientEnd})`;
        else style.background = design.backgroundColor;
        return style;
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>Gallery</h1>
                <div style={{ position: 'relative' }}>
                    <input type="file" id="upload-input" style={{ display: 'none' }} onChange={handleUpload} accept="image/*,video/*" />
                    <label htmlFor="upload-input" className="btn btn-primary" style={{ cursor: uploading ? 'wait' : 'pointer', padding: '0.75rem 2rem' }}>
                        {uploading ? 'Processing...' : 'Upload Asset'}
                    </label>
                </div>
            </div>

            {showDesign && (
                <div className="glass-panel slide-up" style={{ marginBottom: '3rem', border: '2px solid var(--sidebar-bg)' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Palette size={20} /> Design Asset Frame</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label className="input-label">Frame Width</label>
                            <select className="input-field" value={designState.width} onChange={e => setDesignState({ ...designState, width: parseInt(e.target.value) })}>
                                {[1, 2, 3, 4, 5, 6].map(w => <option key={w} value={w}>Grid: {w}/6</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Frame Height ({designState.customHeight}px)</label>
                            <input type="range" min="200" max="800" step="50" value={designState.customHeight} onChange={e => setDesignState({ ...designState, customHeight: parseInt(e.target.value) })} style={{ width: '100%', marginTop: '0.8rem' }} />
                        </div>
                        <div>
                            <label className="input-label">Font Family</label>
                            <select className="input-field" value={designState.fontFamily} onChange={e => setDesignState({ ...designState, fontFamily: e.target.value })}>
                                <option value="'Inter', sans-serif">Inter</option>
                                <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
                                <option value="'Montserrat', sans-serif">Montserrat</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.2rem' }}>
                            <button className={`btn ${designState.fontWeight === 'bold' ? 'btn-primary' : ''}`} onClick={() => setDesignState({ ...designState, fontWeight: designState.fontWeight === 'bold' ? 'normal' : 'bold' })}><Bold size={16} /></button>
                            <button className={`btn ${designState.fontStyle === 'italic' ? 'btn-primary' : ''}`} onClick={() => setDesignState({ ...designState, fontStyle: designState.fontStyle === 'italic' ? 'normal' : 'italic' })}><Italic size={16} /></button>
                        </div>
                        <div style={{ display: 'flex', gap: '0.2rem' }}>
                            {['left', 'center', 'right'].map(a => (
                                <button key={a} className={`btn ${designState.textAlign === a ? 'btn-primary' : ''}`} onClick={() => setDesignState({ ...designState, textAlign: a })}>
                                    {a === 'left' ? <AlignLeft size={16} /> : a === 'center' ? <AlignCenter size={16} /> : <AlignRight size={16} />}
                                </button>
                            ))}
                        </div>
                        <input type="color" value={designState.color} onChange={e => setDesignState({ ...designState, color: e.target.value })} />
                        <input type="number" className="input-field" style={{ width: '70px' }} value={designState.fontSize} onChange={e => setDesignState({ ...designState, fontSize: parseInt(e.target.value) })} />
                        <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => handleUpdateDesign(editingItem)}><Save size={18} /> Apply Changes</button>
                        <button className="btn" onClick={() => { setShowDesign(false); setEditingItem(null); }}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="profile-grid">
                {items.map(item => (
                    <div
                        key={item.id}
                        className={`glass-panel col-span-${item.design_config?.width || 2} ${item.design_config?.backgroundType === 'glass' ? 'glass-effect' : ''}`}
                        style={{ ...getCardStyle(item.design_config), padding: '1rem', display: 'flex', flexDirection: 'column' }}
                    >
                        <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flex: 1, maxHeight: item.design_config?.customHeight ? `${item.design_config.customHeight - 80}px` : '270px' }}>
                            {item.media_type === 'video' ? <video src={`http://localhost:8000/${item.file_path}`} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <img src={`http://localhost:8000/${item.file_path}`} alt="Asset" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}

                            <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => startEdit(item)} style={{ background: 'rgba(255,255,255,0.8)', color: 'var(--sidebar-bg)', border: 'none', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer' }}><Edit3 size={14} /></button>
                                <button onClick={() => deleteItem(item.id)} style={{ background: 'rgba(239, 68, 68, 0.8)', color: 'white', border: 'none', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer' }}><Trash2 size={14} /></button>
                            </div>
                        </div>

                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', opacity: 0.7 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <UserIcon size={12} /> {item.owner?.username || user?.username}
                            </div>
                            <div>{(item.file_size / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Album;
