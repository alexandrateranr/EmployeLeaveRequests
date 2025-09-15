import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Employee = {
  id: number;
  name: string;
  email: string;
  role: string | number;
};

type UserContextType = {
  user: Employee | null;
  login: (employee: Employee) => void;
  logout: () => void;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

type UserProviderProps = {
  children: ReactNode;
};

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved login on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('loggedInUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('loggedInUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (employee: Employee) => {
    setUser(employee);
    localStorage.setItem('loggedInUser', JSON.stringify(employee));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('loggedInUser');
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
