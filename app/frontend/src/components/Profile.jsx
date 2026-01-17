import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Camera, Image as ImageIcon, Move, Trash2, Palette, Edit3, Save, Layers, User as UserIcon, Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Video as VideoIcon, X } from 'lucide-react';
import MediaCarousel from './MediaCarousel';

const Profile = () => {
    const [userMeta, setUserMeta] = useState(null);
    const [sections, setSections] = useState([]);
    const [editingSection, setEditingSection] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [previews, setPreviews] = useState([]);

    // Form & Customization State
    const [formState, setFormState] = useState({
        title: '', content: '', section_type: 'custom', mediaFiles: [],
        design: {
            backgroundType: 'solid', backgroundColor: '#ffffff',
            gradientStart: '#6366f1', gradientEnd: '#a855f7', gradientAngle: 135,
            color: '#1f2937', width: 6, customHeight: 400, animation: 'none',
            fontSize: 18, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'left',
            fontFamily: "'Inter', sans-serif"
        }
    });

    useEffect(() => {
        fetchProfile();
        fetchUserMeta();
    }, []);

    const fetchUserMeta = async () => {
        try {
            const res = await axios.get('http://localhost:8000/profile/me');
            setUserMeta(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchProfile = async () => {
        try {
            const res = await axios.get('http://localhost:8000/profile/');
            setSections(res.data);
        } catch (err) { console.error(err); }
    };

    const handleProfilePicUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            await axios.post('http://localhost:8000/profile/picture', formData);
            fetchUserMeta();
        } catch (err) { console.error(err); }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFormState({ ...formState, mediaFiles: [...formState.mediaFiles, ...files] });

        const newPreviews = files.map(file => ({
            url: URL.createObjectURL(file),
            type: file.type.startsWith('video') ? 'video' : 'image'
        }));
        setPreviews([...previews, ...newPreviews]);
    };

    const removeFile = (index) => {
        const newFiles = [...formState.mediaFiles];
        newFiles.splice(index, 1);
        setFormState({ ...formState, mediaFiles: newFiles });

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index].url);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const openEditMode = (section) => {
        setEditingSection(section.id);
        setFormState({
            title: section.title,
            content: section.content,
            section_type: section.section_type,
            mediaFiles: [],
            design: { ...formState.design, ...section.design_config }
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSaveSection = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title: formState.title,
                content: formState.content,
                section_type: formState.section_type,
                order: sections.length,
                design_config: formState.design
            };

            let res;
            if (editingSection) {
                res = await axios.put(`http://localhost:8000/profile/section/${editingSection}`, payload);
            } else {
                res = await axios.post('http://localhost:8000/profile/section', payload);
            }

            if (formState.mediaFiles.length > 0) {
                const formData = new FormData();
                for (let file of formState.mediaFiles) {
                    formData.append('files', file);
                }
                await axios.post(`http://localhost:8000/profile/section/${res.data.id}/media`, formData);
            }

            resetForm();
            fetchProfile();
        } catch (err) { console.error(err); }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingSection(null);
        previews.forEach(p => URL.revokeObjectURL(p.url));
        setPreviews([]);
        setFormState({
            title: '', content: '', section_type: 'custom', mediaFiles: [],
            design: {
                backgroundType: 'solid', backgroundColor: '#ffffff', gradientStart: '#6366f1', gradientEnd: '#a855f7', gradientAngle: 135, color: '#1f2937',
                width: 6, customHeight: 400, animation: 'none',
                fontSize: 18, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'left',
                fontFamily: "'Inter', sans-serif"
            }
        });
    };

    const handleDeleteSection = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            await axios.delete(`http://localhost:8000/profile/section/${id}`);
            fetchProfile();
        } catch (err) { console.error(err); }
    };

    const [draggedIndex, setDraggedIndex] = useState(null);
    const onDragStart = (e, index) => { setDraggedIndex(index); e.dataTransfer.effectAllowed = "move"; };
    const onDragOver = (index) => {
        if (draggedIndex === index) return;
        const newSections = [...sections];
        const draggedItem = newSections[draggedIndex];
        newSections.splice(draggedIndex, 1);
        newSections.splice(index, 0, draggedItem);
        setDraggedIndex(index);
        setSections(newSections);
    };
    const onDragEnd = async () => {
        setDraggedIndex(null);
        const orderMap = {};
        sections.forEach((item, index) => { orderMap[item.id] = index; });
        try { await axios.put('http://localhost:8000/profile/reorder', orderMap); } catch (err) { fetchProfile(); }
    };

    const getSectionStyle = (design) => {
        if (!design) return {};
        let style = {
            color: design.color,
            transition: 'all 0.3s ease',
            minHeight: design.customHeight ? `${design.customHeight}px` : '400px',
            fontSize: design.fontSize ? `${design.fontSize}px` : 'inherit',
            fontWeight: design.fontWeight || 'normal',
            fontStyle: design.fontStyle || 'normal',
            textAlign: design.textAlign || 'left',
            fontFamily: design.fontFamily || 'inherit'
        };

        if (design.backgroundType === 'glass') style.background = 'rgba(255, 255, 255, 0.45)';
        else if (design.backgroundType === 'gradient') style.background = `linear-gradient(${design.gradientAngle}deg, ${design.gradientStart}, ${design.gradientEnd})`;
        else style.background = design.backgroundColor;

        return style;
    };

    return (
        <div style={{ padding: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
                <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                    <img
                        src={userMeta?.profile_picture ? `http://localhost:8000/${userMeta.profile_picture}` : "https://via.placeholder.com/140"}
                        alt="Profile"
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '5px solid white', boxShadow: 'var(--card-shadow)' }}
                    />
                    <label htmlFor="pfp-upload" style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'var(--sidebar-bg)', padding: '0.6rem', borderRadius: '50%', cursor: 'pointer', color: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                        <Camera size={20} />
                    </label>
                    <input type="file" id="pfp-upload" style={{ display: 'none' }} onChange={handleProfilePicUpload} accept="image/*" />
                </div>

                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{userMeta?.username || "Loading..."}</h1>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-primary" style={{ padding: '0.75rem 2rem' }} onClick={() => (showForm ? resetForm() : setShowForm(true))}>
                            {showForm ? 'Cancel' : 'Add Section'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Immersive Form */}
            {showForm && (
                <div className="glass-panel slide-up" style={{ marginBottom: '3rem', padding: '2.5rem', border: '2px solid var(--sidebar-bg)', boxShadow: 'var(--card-shadow)' }}>
                    <h2 style={{ marginBottom: '2rem', fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {editingSection ? <Edit3 size={28} /> : <Layers size={28} />} {editingSection ? 'Modify Piece' : 'New Section'}
                    </h2>

                    <form onSubmit={handleSaveSection}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="input-label">Section Title</label>
                                <input className="input-field" value={formState.title} onChange={e => setFormState({ ...formState, title: e.target.value })} placeholder="e.g. My Creative Journey" required />
                            </div>
                            <div>
                                <label className="input-label">Layout Width</label>
                                <select className="input-field" value={formState.design.width} onChange={e => setFormState({ ...formState, design: { ...formState.design, width: parseInt(e.target.value) } })}>
                                    {[1, 2, 3, 4, 5, 6].map(w => <option key={w} value={w}>Width: {w}/6</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: '#f8fafc', padding: '1.25rem', borderRadius: '1rem', border: '2px dashed #e2e8f0' }}>
                                <VideoIcon size={20} /> Attach Media Gallery
                                <input type="file" multiple style={{ display: 'none' }} accept="image/*,video/*" onChange={handleFileChange} />
                            </label>

                            {previews.length > 0 && (
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '1rem' }}>
                                    {previews.map((p, i) => (
                                        <div key={i} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                            {p.type === 'video' ? <video src={p.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <img src={p.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                            <button type="button" onClick={() => removeFile(i)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239, 68, 68, 0.8)', border: 'none', color: 'white', borderRadius: '50%', padding: '2px', cursor: 'pointer' }}>
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label className="input-label">Section Content</label>
                            <textarea className="input-field" style={{ minHeight: '150px' }} value={formState.content} onChange={e => setFormState({ ...formState, content: e.target.value })} placeholder="Write something inspiring..." required />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem', padding: '2rem', background: '#f8fafc', borderRadius: '1.5rem', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                            <section>
                                <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', color: '#475569', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Palette size={18} /> Backdrop</h3>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                    {['solid', 'gradient', 'glass'].map(type => (
                                        <button key={type} type="button" className={`btn ${formState.design.backgroundType === type ? 'btn-primary' : ''}`} style={{ flex: 1, fontSize: '0.8rem' }} onClick={() => setFormState({ ...formState, design: { ...formState.design, backgroundType: type } })}>{type}</button>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                                    {(formState.design.backgroundType === 'solid' || formState.design.backgroundType === 'glass') && <input type="color" className="color-picker" value={formState.design.backgroundColor} onChange={e => setFormState({ ...formState, design: { ...formState.design, backgroundColor: e.target.value } })} />}
                                    {formState.design.backgroundType === 'gradient' && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input type="color" value={formState.design.gradientStart} onChange={e => setFormState({ ...formState, design: { ...formState.design, gradientStart: e.target.value } })} />
                                            <input type="color" value={formState.design.gradientEnd} onChange={e => setFormState({ ...formState, design: { ...formState.design, gradientEnd: e.target.value } })} />
                                        </div>
                                    )}
                                </div>
                                <label className="input-label" style={{ fontSize: '0.75rem' }}>Height: {formState.design.customHeight}px</label>
                                <input type="range" min="200" max="1000" step="50" value={formState.design.customHeight} onChange={e => setFormState({ ...formState, design: { ...formState.design, customHeight: parseInt(e.target.value) } })} style={{ width: '100%' }} />
                            </section>

                            <section>
                                <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', color: '#475569', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Type size={18} /> Typography</h3>
                                <select className="input-field mb-3" style={{ fontSize: '0.85rem' }} value={formState.design.fontFamily} onChange={e => setFormState({ ...formState, design: { ...formState.design, fontFamily: e.target.value } })}>
                                    <option value="'Inter', sans-serif">Inter</option>
                                    <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
                                    <option value="'Montserrat', sans-serif">Montserrat</option>
                                    <option value="'Playfair Display', serif">Playfair</option>
                                </select>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <button type="button" className={`btn ${formState.design.fontWeight === 'bold' ? 'btn-primary' : ''}`} onClick={() => setFormState({ ...formState, design: { ...formState.design, fontWeight: formState.design.fontWeight === 'bold' ? 'normal' : 'bold' } })}><Bold size={16} /></button>
                                    <button type="button" className={`btn ${formState.design.fontStyle === 'italic' ? 'btn-primary' : ''}`} onClick={() => setFormState({ ...formState, design: { ...formState.design, fontStyle: formState.design.fontStyle === 'italic' ? 'normal' : 'italic' } })}><Italic size={16} /></button>
                                    <div style={{ display: 'flex', gap: '0.2rem', marginLeft: 'auto' }}>
                                        {['left', 'center', 'right'].map(align => (
                                            <button key={align} type="button" className={`btn ${formState.design.textAlign === align ? 'btn-primary' : ''}`} onClick={() => setFormState({ ...formState, design: { ...formState.design, textAlign: align } })}>
                                                {align === 'left' ? <AlignLeft size={16} /> : align === 'center' ? <AlignCenter size={16} /> : <AlignRight size={16} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <input type="range" min="14" max="42" value={formState.design.fontSize} onChange={e => setFormState({ ...formState, design: { ...formState.design, fontSize: parseInt(e.target.value) } })} style={{ width: '100%' }} />
                                    </div>
                                    <input type="color" value={formState.design.color} onChange={e => setFormState({ ...formState, design: { ...formState.design, color: e.target.value } })} />
                                </div>
                            </section>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.25rem', fontSize: '1.2rem' }}><Save size={24} /> {editingSection ? 'Update MASTERPIECE' : 'DEPLOY CONTENT'}</button>
                    </form>
                </div>
            )}

            {/* Immersive Section Grid */}
            <div className="profile-grid">
                {sections.map((section, index) => (
                    <div
                        key={section.id}
                        className={`glass-panel col-span-${section.design_config?.width || 6} ${section.design_config?.backgroundType === 'glass' ? 'glass-effect' : ''} animate-${section.design_config?.animation || 'none'}`}
                        style={{ ...getSectionStyle(section.design_config), opacity: draggedIndex === index ? 0.5 : 1 }}
                        onDragOver={() => onDragOver(index)}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div draggable onDragStart={(e) => onDragStart(e, index)} onDragEnd={onDragEnd} style={{ cursor: 'grab' }}><Move size={20} style={{ opacity: 0.4 }} /></div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>{section.title}</h2>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Edit3 size={20} style={{ cursor: 'pointer', opacity: 0.5 }} className="hover-primary" onClick={() => openEditMode(section)} />
                                <Trash2 size={20} style={{ cursor: 'pointer', opacity: 0.5 }} className="hover-danger" onClick={() => handleDeleteSection(section.id)} />
                            </div>
                        </div>

                        {section.media_gallery && section.media_gallery.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <MediaCarousel
                                    media={section.media_gallery}
                                    height={section.design_config?.customHeight ? `${section.design_config.customHeight * 0.65}px` : '250px'}
                                />
                            </div>
                        )}

                        <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, opacity: 0.9 }}>{section.content}</p>

                        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', opacity: 0.6 }}>
                            <UserIcon size={12} /> Designed with Passion by {userMeta?.username}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Profile;
