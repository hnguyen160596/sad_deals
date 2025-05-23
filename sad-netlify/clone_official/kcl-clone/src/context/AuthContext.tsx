import type React from 'react';
import { createContext, useState, type ReactNode, useContext } from 'react'

interface AuthContextType {
  user: string | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(() => {
    return localStorage.getItem('user');
  });

  const login = (email: string, password: string) => {
    // TODO: Replace with real API call
    if (email === 'admin@example.com' && password === 'password') {
      setUser(email);
      localStorage.setItem('user', email);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
