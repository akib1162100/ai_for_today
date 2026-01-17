import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Palette, Layers, Save, Trash2, Edit3, User as UserIcon, Calendar, Hash, Type, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Camera, Video as VideoIcon, X } from 'lucide-react';
import MediaCarousel from './MediaCarousel';

const Blog = () => {
    const [posts, setPosts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [previews, setPreviews] = useState([]);
    const { user } = useAuth();

    const [formState, setFormState] = useState({
        title: '', content: '', tags: '', mediaFiles: [],
        design: {
            backgroundType: 'solid', backgroundColor: '#ffffff',
            gradientStart: '#6366f1', gradientEnd: '#a855f7', gradientAngle: 135,
            color: '#1f2937', width: 6, customHeight: 500, animation: 'none',
            fontSize: 18, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'left',
            fontFamily: "'Inter', sans-serif"
        }
    });

    useEffect(() => { fetchPosts(); }, []);

    const fetchPosts = async () => {
        try {
            const res = await axios.get('http://localhost:8000/blog/');
            setPosts(res.data);
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

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title: formState.title, content: formState.content,
                tags: formState.tags, design_config: formState.design
            };

            let res;
            if (editingId) res = await axios.put(`http://localhost:8000/blog/${editingId}`, payload);
            else res = await axios.post('http://localhost:8000/blog/', payload);

            if (formState.mediaFiles.length > 0) {
                const formData = new FormData();
                for (let file of formState.mediaFiles) {
                    formData.append('files', file);
                }
                await axios.post(`http://localhost:8000/blog/${res.data.id}/media`, formData);
            }

            resetForm(); fetchPosts();
        } catch (err) { console.error(err); }
    };

    const resetForm = () => {
        setEditingId(null); setShowForm(false);
        previews.forEach(p => URL.revokeObjectURL(p.url));
        setPreviews([]);
        setFormState({
            title: '', content: '', tags: '', mediaFiles: [],
            design: {
                backgroundType: 'solid', backgroundColor: '#ffffff', gradientStart: '#6366f1', gradientEnd: '#a855f7', gradientAngle: 135, color: '#1f2937',
                width: 6, customHeight: 500, animation: 'none',
                fontSize: 18, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'left',
                fontFamily: "'Inter', sans-serif"
            }
        });
    };

    const deletePost = async (id) => {
        if (!confirm("Delete this story?")) return;
        try { await axios.delete(`http://localhost:8000/blog/${id}`); fetchPosts(); } catch (err) { console.error(err); }
    };

    const startEdit = (post) => {
        setEditingId(post.id);
        setFormState({
            title: post.title, content: post.content, tags: post.tags, mediaFiles: [],
            design: { ...formState.design, ...post.design_config }
        });
        setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getStyle = (design) => {
        if (!design) return {};
        let style = {
            color: design.color,
            minHeight: design.customHeight ? `${design.customHeight}px` : '500px',
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
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>Blog</h1>
                <button className="btn btn-primary" onClick={() => (showForm ? resetForm() : setShowForm(true))}>{showForm ? 'Cancel' : 'New Post'}</button>
            </div>

            {showForm && (
                <div className="glass-panel slide-up" style={{ marginBottom: '3rem', border: '2px solid var(--sidebar-bg)' }}>
                    <form onSubmit={handleSave}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <input className="input-field" placeholder="Post Title" value={formState.title} onChange={e => setFormState({ ...formState, title: e.target.value })} required />
                            <input className="input-field" placeholder="Tags" value={formState.tags} onChange={e => setFormState({ ...formState, tags: e.target.value })} />
                            <select className="input-field" value={formState.design.width} onChange={e => setFormState({ ...formState, design: { ...formState.design, width: parseInt(e.target.value) } })}>
                                {[1, 2, 3, 4, 5, 6].map(w => <option key={w} value={w}>Width: {w}/6</option>)}
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: '#f8fafc', padding: '1.25rem', borderRadius: '1rem', border: '2px dashed #e2e8f0' }}>
                                <Camera size={20} /> Add Hero Gallery
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

                        <textarea className="input-field" style={{ minHeight: '200px' }} placeholder="Tell your story..." value={formState.content} onChange={e => setFormState({ ...formState, content: e.target.value })} required />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', background: '#f1f5f9', padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                            <section>
                                <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Palette size={16} /> Backdrop</h3>
                                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem' }}>
                                    {['solid', 'gradient', 'glass'].map(t => (
                                        <button key={t} type="button" className={`btn ${formState.design.backgroundType === t ? 'btn-primary' : ''}`} style={{ flex: 1, fontSize: '0.75rem' }} onClick={() => setFormState({ ...formState, design: { ...formState.design, backgroundType: t } })}>{t}</button>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                    {(formState.design.backgroundType === 'solid' || formState.design.backgroundType === 'glass') && <input type="color" value={formState.design.backgroundColor} onChange={e => setFormState({ ...formState, design: { ...formState.design, backgroundColor: e.target.value } })} />}
                                    {formState.design.backgroundType === 'gradient' && (
                                        <>
                                            <input type="color" value={formState.design.gradientStart} onChange={e => setFormState({ ...formState, design: { ...formState.design, gradientStart: e.target.value } })} />
                                            <input type="color" value={formState.design.gradientEnd} onChange={e => setFormState({ ...formState, design: { ...formState.design, gradientEnd: e.target.value } })} />
                                        </>
                                    )}
                                </div>
                                <label className="input-label" style={{ fontSize: '0.75rem' }}>Height: {formState.design.customHeight}px</label>
                                <input type="range" min="200" max="1000" step="50" value={formState.design.customHeight} onChange={e => setFormState({ ...formState, design: { ...formState.design, customHeight: parseInt(e.target.value) } })} style={{ width: '100%' }} />
                            </section>

                            <section>
                                <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Type size={16} /> Typography</h3>
                                <select className="input-field mb-2" style={{ fontSize: '0.8rem' }} value={formState.design.fontFamily} onChange={e => setFormState({ ...formState, design: { ...formState.design, fontFamily: e.target.value } })}>
                                    <option value="'Inter', sans-serif">Inter</option>
                                    <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
                                    <option value="'Montserrat', sans-serif">Montserrat</option>
                                    <option value="'Playfair Display', serif">Playfair</option>
                                </select>
                                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem' }}>
                                    <button type="button" className={`btn ${formState.design.fontWeight === 'bold' ? 'btn-primary' : ''}`} onClick={() => setFormState({ ...formState, design: { ...formState.design, fontWeight: formState.design.fontWeight === 'bold' ? 'normal' : 'bold' } })}><Bold size={14} /></button>
                                    <button type="button" className={`btn ${formState.design.fontStyle === 'italic' ? 'btn-primary' : ''}`} onClick={() => setFormState({ ...formState, design: { ...formState.design, fontStyle: formState.design.fontStyle === 'italic' ? 'normal' : 'italic' } })}><Italic size={14} /></button>
                                    <div style={{ display: 'flex', gap: '0.1rem', marginLeft: 'auto' }}>
                                        {['left', 'center', 'right'].map(align => (
                                            <button key={align} type="button" className={`btn ${formState.design.textAlign === align ? 'btn-primary' : ''}`} onClick={() => setFormState({ ...formState, design: { ...formState.design, textAlign: align } })}>
                                                {align === 'left' ? <AlignLeft size={14} /> : align === 'center' ? <AlignCenter size={14} /> : <AlignRight size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <input type="range" min="14" max="42" value={formState.design.fontSize} onChange={e => setFormState({ ...formState, design: { ...formState.design, fontSize: parseInt(e.target.value) } })} style={{ flex: 1 }} />
                                    <input type="color" value={formState.design.color} onChange={e => setFormState({ ...formState, design: { ...formState.design, color: e.target.value } })} />
                                </div>
                            </section>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}><Save size={20} /> Publish Story</button>
                    </form>
                </div>
            )}

            <div className="profile-grid">
                {posts.map(post => (
                    <div
                        key={post.id}
                        className={`glass-panel col-span-${post.design_config?.width || 6} ${post.design_config?.backgroundType === 'glass' ? 'glass-effect' : ''}`}
                        style={getStyle(post.design_config)}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{post.title}</h2>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Edit3 size={20} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => startEdit(post)} />
                                <Trash2 size={20} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => deletePost(post.id)} />
                            </div>
                        </div>

                        {post.media_gallery && post.media_gallery.length > 0 && (
                            <div style={{ marginBottom: '2rem' }}>
                                <MediaCarousel
                                    media={post.media_gallery}
                                    height={post.design_config?.customHeight ? `${post.design_config.customHeight * 0.75}px` : '400px'}
                                />
                            </div>
                        )}

                        {post.tags && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                                {post.tags.split(',').map(tag => (
                                    <span key={tag} style={{ background: 'rgba(0,0,0,0.05)', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                        <Hash size={10} /> {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        )}

                        <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, opacity: 0.9 }}>{post.content}</p>

                        <div style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', opacity: 0.6 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={16} /> {new Date(post.created_at).toLocaleDateString()}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserIcon size={16} /> Story by {post.owner?.username || user?.username}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Blog;
