import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Book, FileText, Image as ImageIcon, Activity, HardDrive } from 'lucide-react';

const Card = ({ title, value, subtitle, icon: Icon }) => (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.1, color: 'var(--sidebar-bg)' }}>
            {Icon && <Icon size={80} />}
        </div>
        <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>{title}</h3>
        <div style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0.2rem 0', color: 'var(--sidebar-bg)' }}>{value}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{subtitle}</div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:8000/dashboard/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Gathering insights...</div>;

    return (
        <div className="slide-up">
            <h1 style={{ marginBottom: '2.5rem' }}>Your Progress</h1>

            <div className="grid-gallery">
                <Card
                    title="Journaling"
                    value={stats?.journal_count || 0}
                    subtitle="Memories captured"
                    icon={Book}
                />
                <Card
                    title="Published Stories"
                    value={stats?.blog_count || 0}
                    subtitle="Thoughts shared"
                    icon={FileText}
                />
                <Card
                    title="Media Assets"
                    value={stats?.album_count || 0}
                    subtitle="Photos & Videos"
                    icon={ImageIcon}
                />
                <Card
                    title="Storage"
                    value={`${stats?.storage_used_mb || 0} MB`}
                    subtitle="Space utilized"
                    icon={HardDrive}
                />
            </div>

            <div className="glass-panel" style={{ marginTop: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <Activity size={20} color="var(--sidebar-bg)" />
                    <h3 style={{ margin: 0 }}>Recent Activity</h3>
                </div>

                {stats?.recent_activity?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {stats.recent_activity.map((act, i) => (
                            <div key={`${act.type}-${act.id}`} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem',
                                background: 'rgba(0,0,0,0.02)',
                                borderRadius: 'var(--radius-md)',
                                borderLeft: `4px solid ${act.type === 'journal' ? '#0ea5e9' : '#8b5cf6'}`
                            }}>
                                <div>
                                    <div style={{ fontWeight: '600' }}>{act.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{act.type} entry</div>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {new Date(act.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.01)', borderRadius: 'var(--radius-md)' }}>
                        Start creating to see your activity here! ✨
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
