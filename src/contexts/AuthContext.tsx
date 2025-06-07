'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Address {
  _id?: string;
  receiverName: string;
  prefix: string; // Mr./Ms./Mrs.
  city: string;
  pinCode: string;
  fullAddress: string;
  phoneNumber: string;
  alternatePhoneNumber?: string;
  addressType: string; // Home/Office/Others
}

interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  isVerified: boolean;
  role?: string;
  createdAt: string;
  updatedAt: string;
  address?: Address[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (userData: Partial<Pick<User, 'name' | 'email'>>) => Promise<boolean>;
  addAddress: (address: Omit<Address, '_id'>) => Promise<boolean>;
  updateAddress: (addressId: string, address: Omit<Address, '_id'>) => Promise<boolean>;
  deleteAddress: (addressId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
  };
  const updateUser = async (userData: Partial<Pick<User, 'name' | 'email'>>) => {
    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      } else {
        console.error('Update user failed:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  };

  const addAddress = async (address: Omit<Address, '_id'>) => {
    try {
      const response = await fetch('/api/user/address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(address),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      } else {
        console.error('Add address failed:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('Add address error:', error);
      return false;
    }
  };

  const updateAddress = async (addressId: string, address: Omit<Address, '_id'>) => {
    try {
      const response = await fetch(`/api/user/address/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(address),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      } else {
        console.error('Update address failed:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('Update address error:', error);
      return false;
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      const response = await fetch(`/api/user/address/${addressId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      } else {
        console.error('Delete address failed:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('Delete address error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth, updateUser, addAddress, updateAddress, deleteAddress }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
