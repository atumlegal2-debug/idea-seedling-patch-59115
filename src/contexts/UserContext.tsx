import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface AppUser {
  id: string;
  name: string;
  username: string;
  element: "água" | "terra" | "fogo" | "ar" | null;
  xp: number;
  rank: string;
  profilePicture: string | null;
  isProfessor: boolean;
}

interface UserContextType {
  user: AppUser | null;
  loading: boolean;
  login: (user: AppUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUsername = localStorage.getItem("savedUser");
    if (savedUsername) {
      fetchUser(savedUsername);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (username: string) => {
    setLoading(true);
    if (username === "Professor1812") {
        const professorUser: AppUser = {
            id: 'professor-id',
            name: 'Professor',
            username: 'Professor1812',
            isProfessor: true,
            element: 'fogo', // Placeholder
            xp: 9999, // Placeholder
            rank: 'SS', // Placeholder
            profilePicture: null
        };
        setUser(professorUser);
        localStorage.setItem("savedUser", username);
    } else {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (data && !error) {
            const appUser: AppUser = { ...data, isProfessor: false, profilePicture: data.photo_url };
            setUser(appUser);
            localStorage.setItem("savedUser", username);
        } else {
            console.error("Error fetching user:", error);
            logout();
        }
    }
    setLoading(false);
  };
  
  const refreshUser = async () => {
    if (user && !user.isProfessor) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
        if (data && !error) {
            const appUser: AppUser = { ...data, isProfessor: false, profilePicture: data.photo_url };
            setUser(appUser);
        }
    }
  }

  const login = (userToLogin: AppUser) => {
    setUser(userToLogin);
    localStorage.setItem("savedUser", userToLogin.username);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("savedUser");
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};