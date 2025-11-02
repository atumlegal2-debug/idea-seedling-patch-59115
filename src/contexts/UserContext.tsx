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
  updated_at: string;
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
            const appUser: AppUser = { 
              ...data, 
              isProfessor: data.is_professor, 
              updated_at: data.updated_at,
              profilePicture: data.photo_url 
                ? `${data.photo_url.split('?')[0]}?t=${new Date(data.updated_at).getTime()}` 
                : null 
            };
            setUser(appUser);
        }
    }
  }

  const login = (userToLogin: AppUser, saveProfile: boolean) => {
    const userWithCacheBustedPic = {
      ...userToLogin,
      profilePicture: userToLogin.profilePicture
        ? `${userToLogin.profilePicture.split('?')[0]}?t=${new Date(userToLogin.updated_at).getTime()}`
        : null,
    };
    setUser(userWithCacheBustedPic);

    if (saveProfile) {
      const savedProfiles: SavedProfile[] = JSON.parse(localStorage.getItem("savedProfiles") || "[]");
      const profileToSave: SavedProfile = {
          username: userWithCacheBustedPic.username,
          name: userWithCacheBustedPic.name,
          profilePicture: userWithCacheBustedPic.profilePicture,
          isProfessor: userWithCacheBustedPic.isProfessor,
          element: userWithCacheBustedPic.element,
      };
      const existingProfileIndex = savedProfiles.findIndex(p => p.username === userWithCacheBustedPic.username);
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
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);

      const savedProfiles: SavedProfile[] = JSON.parse(localStorage.getItem("savedProfiles") || "[]");
      const profileIndex = savedProfiles.findIndex(p => p.username === updatedUser.username);
      
      if (profileIndex > -1) {
        const profileToUpdate = savedProfiles[profileIndex];
        if (updates.profilePicture !== undefined) {
          profileToUpdate.profilePicture = updates.profilePicture;
        }
        if (updates.element !== undefined) {
          profileToUpdate.element = updates.element;
        }
        savedProfiles[profileIndex] = profileToUpdate;
        localStorage.setItem("savedProfiles", JSON.stringify(savedProfiles));
      }
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