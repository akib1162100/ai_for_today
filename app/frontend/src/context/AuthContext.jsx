import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const applyTheme = (theme) => {
    if (!theme) return;
    const root = document.documentElement;

    // Backdrop logic
    if (theme.backgroundType === 'gradient') {
        root.style.setProperty('--main-bg', `linear-gradient(${theme.gradientAngle || 135}deg, ${theme.gradientStart || '#f3f4f6'}, ${theme.gradientEnd || '#e5e7eb'})`);
    } else {
        if (theme.backgroundColor) root.style.setProperty('--main-bg', theme.backgroundColor);
    }

    if (theme.color) root.style.setProperty('--text-primary', theme.color);
    if (theme.fontFamily) root.style.setProperty('--font-heading', theme.fontFamily);
    if (theme.fontSize) root.style.setProperty('font-size', theme.fontSize + 'px');
    if (theme.sidebarColor) root.style.setProperty('--sidebar-bg', theme.sidebarColor);
    if (theme.cardShadow) root.style.setProperty('--card-shadow', theme.cardShadow);
    if (theme.radius) root.style.setProperty('--radius-lg', theme.radius + 'rem');

    // Layout Height
    if (theme.layoutHeight) {
        const heightVal = theme.layoutHeight === 'compact' ? '120px' :
            theme.layoutHeight === 'relaxed' ? '250px' : 'auto';
        root.style.setProperty('--card-min-height', heightVal);
    }
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
            fetchUserInfo();
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
            setUser(null);
        }
    }, [token]);

    const fetchUserInfo = async () => {
        try {
            const res = await axios.get('http://localhost:8000/profile/me');
            setUser(res.data);
            if (res.data.profile_theme) {
                applyTheme(res.data.profile_theme);
            }
        } catch (err) {
            console.error("Failed to fetch user info", err);
            if (err.response?.status === 401) {
                logout();
            }
        }
    };

    const updateTheme = async (newTheme) => {
        try {
            await axios.put('http://localhost:8000/profile/theme', newTheme);
            applyTheme(newTheme);
            setUser(prev => ({ ...prev, profile_theme: newTheme }));
        } catch (err) {
            console.error("Failed to update theme", err);
        }
    };

    const login = async (username, password) => {
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            const response = await axios.post('http://localhost:8000/auth/token', formData);
            const { access_token } = response.data;
            setToken(access_token);
            return true;
        } catch (error) {
            console.error("Login failed", error);
            return false;
        }
    };

    const register = async (username, email, password) => {
        try {
            await axios.post('http://localhost:8000/auth/register', { username, email, password });
            return await login(username, password);
        } catch (error) {
            console.error("Register failed", error);
            throw error;
        }
    }

    const logout = () => {
        setToken(null);
        setUser(null);
        // Reset styles to default
        const root = document.documentElement;
        root.style.removeProperty('--main-bg');
        root.style.removeProperty('--text-primary');
        root.style.removeProperty('--font-heading');
        root.style.removeProperty('font-size');
        root.style.removeProperty('--sidebar-bg');
        root.style.removeProperty('--card-shadow');
        root.style.removeProperty('--radius-lg');
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, register, updateTheme, fetchUserInfo }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
