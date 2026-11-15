import React, { createContext, useContext, useState, useEffect } from 'react';
import { Farmland } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface FarmlandContextType {
  farmlands: Farmland[];
  selectedFarmland: Farmland | null;
  setSelectedFarmland: (farm: Farmland | null) => void;
  isLoading: boolean;
  isSyncingNasa: boolean;
  refreshFarmlands: (overrideUserId?: string) => Promise<void>;
  syncCurrentWithNasa: () => Promise<void>;
}

const FarmlandContext = createContext<FarmlandContextType | undefined>(undefined);

export const FarmlandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [farmlands, setFarmlands] = useState<Farmland[]>([]);
  const [selectedFarmland, setSelectedFarmland] = useState<Farmland | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncingNasa, setIsSyncingNasa] = useState<boolean>(false);

  const refreshFarmlands = async (overrideUserId?: string) => {
    try {
      setIsLoading(true);
      const targetUid = overrideUserId || user?.id;
      let data: Farmland[] = [];
      if (targetUid) {
        data = await api.getFarmlands(targetUid);
      }
      if (data.length === 0) {
        // Fallback to all farmlands if demo account or initial sync
        data = await api.getFarmlands();
      }
      setFarmlands(data);
      if (data.length > 0) {
        if (!selectedFarmland || !data.some(f => f.id === selectedFarmland.id)) {
          setSelectedFarmland(data[0]);
        }
      } else {
        setSelectedFarmland(null);
      }
    } catch (err) {
      console.error('Error fetching farmlands:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const syncCurrentWithNasa = async () => {
    if (!selectedFarmland) return;
    try {
      setIsSyncingNasa(true);
      await api.syncNasaPower(selectedFarmland.id);
      await refreshFarmlands();
    } catch (err) {
      console.error('Error syncing with NASA:', err);
    } finally {
      setIsSyncingNasa(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      refreshFarmlands(user.id);
    } else {
      setFarmlands([]);
      setSelectedFarmland(null);
      setIsLoading(false);
    }
  }, [user?.id]);

  return (
    <FarmlandContext.Provider
      value={{
        farmlands,
        selectedFarmland,
        setSelectedFarmland,
        isLoading,
        isSyncingNasa,
        refreshFarmlands,
        syncCurrentWithNasa,
      }}
    >
      {children}
    </FarmlandContext.Provider>
  );
};

export const useFarmland = () => {
  const context = useContext(FarmlandContext);
  if (!context) {
    throw new Error('useFarmland must be used within a FarmlandProvider');
  }
  return context;
};
