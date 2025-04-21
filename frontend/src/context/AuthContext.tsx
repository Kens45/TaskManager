'use client'

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";


type AuthContextType = {
    user: null;
    login: (token: string, user: any) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const syncAuth = useCallback(() => {
        setIsLoading(true);
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                const userData = localStorage.getItem('user');
                try {
                    setUser(userData ? JSON.parse(userData) : null);
                } catch (error) {
                    console.error("Error parsing user data", error);
                    logout();
                }
            }
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        syncAuth();
        window.addEventListener('storage', syncAuth);
        return () => window.removeEventListener('storage', syncAuth);
    }, [syncAuth]);

    const login = (token: string, userData: any) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            document.cookie = `token=${token}; path=/; max-age=86400`;
        }
        setUser(userData);
        router.push('/dashboard');
    };

    const logout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        setUser(null);
        router.push('/auth/login');
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isAuthenticated: !!user,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};