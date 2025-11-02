import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

interface SavedProfile {
  username: string;
  name: string;
  profilePicture: string | null;
  isProfessor: boolean;
  element: "água" | "terra" | "fogo" | "ar" | null;
}

interface UserContextType {
  user: AppUser | null;
  loading: boolean;
  login: (user: AppUser, saveProfile: boolean) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<AppUser>) => void;
  removeProfile: (username: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We no longer auto-login, just finish the loading state.
    setLoading(false);
  }, []);
  
  const refreshUser = async () => {
    if (user) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
        if (data && !error) {
            const appUser: AppUser = { ...data, isProfessor: data.is_professor, profilePicture: data.photo_url };
            setUser(appUser);
        }
    }
  }

  const login = (userToLogin: AppUser, saveProfile: boolean) => {
    setUser(userToLogin);
    if (saveProfile) {
      const savedProfiles: SavedProfile[] = JSON.parse(localStorage.getItem("savedProfiles") || "[]");
      const profileToSave = {
          username: userToLogin.username,
          name: userToLogin.name,
          profilePicture: userToLogin.profilePicture,
          isProfessor: userToLogin.isProfessor,
          element: userToLogin.element,
      };
      const existingProfileIndex = savedProfiles.findIndex(p => p.username === userToLogin.username);
      if (existingProfileIndex > -1) {
          savedProfiles[existingProfileIndex] = profileToSave;
      } else {
          savedProfiles.push(profileToSave);
      }
      localStorage.setItem("savedProfiles", JSON.stringify(savedProfiles));
    }
  };

  const logout = () => {
    setUser(null);
  };

  const removeProfile = (username: string) => {
    const savedProfiles: SavedProfile[] = JSON.parse(localStorage.getItem("savedProfiles") || "[]");
    const updatedProfiles = savedProfiles.filter(p => p.username !== username);
    localStorage.setItem("savedProfiles", JSON.stringify(updatedProfiles));
  };

  const updateUser = (updates: Partial<AppUser>) => {
    if (user) {
      setUser(prevUser => ({ ...prevUser!, ...updates }));
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout, refreshUser, updateUser, removeProfile }}>
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