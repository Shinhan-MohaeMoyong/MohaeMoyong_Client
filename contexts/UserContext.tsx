import React, { createContext, ReactNode, useContext, useState } from 'react';
import { UserEntity } from '../types/entity/UserEntity';

interface UserContextType {
  loggedUser: UserEntity | null;
  setLoggedUser: (user: UserEntity | null) => void;
  isLoggedIn: boolean;
  token: string | null;
  setToken: (token: string | null) => void;
  login: (user: UserEntity, token: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [loggedUser, setLoggedUser] = useState<UserEntity | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const isLoggedIn = loggedUser !== null && token !== null;

  const login = (user: UserEntity, authToken: string) => {
    setLoggedUser(user);
    setToken(authToken);
    console.log('로그인 완료:', { user, token: authToken });
  };

  const logout = () => {
    setLoggedUser(null);
    setToken(null);
    console.log('로그아웃 완료');
  };

  const value: UserContextType = {
    loggedUser,
    setLoggedUser,
    isLoggedIn,
    token,
    setToken,
    login,
    logout,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
