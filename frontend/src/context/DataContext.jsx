import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { clearAllTransactions } from '../api/client';

export const AsyncStorage = {
  setItem: async (key, value) => {
    return Promise.resolve().then(() => {
      localStorage.setItem(key, value);
    });
  },
  getItem: async (key) => {
    return Promise.resolve().then(() => {
      return localStorage.getItem(key);
    });
  },
  removeItem: async (key) => {
    return Promise.resolve().then(() => {
      localStorage.removeItem(key);
    });
  }
};

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [localDataSaved, setLocalDataSaved] = useState(false);

  useEffect(() => {
    const init = async () => {
      const started = await AsyncStorage.getItem('artha_started');
      if (started === 'true') {
        setHasStarted(true);
      }
      setIsReady(true);
    };
    init();
  }, []);

  const getStarted = async () => {
    await AsyncStorage.setItem('artha_started', 'true');
    setHasStarted(true);
  };

  const clearData = async () => {
    try {
      await clearAllTransactions();
    } catch (e) {
      console.error('Failed to clear backend', e);
    }
    await AsyncStorage.removeItem('artha_started');
    await AsyncStorage.removeItem('artha_backup');
    setHasStarted(false);
    setLocalDataSaved(false);
  };

  const backupToLocal = async (data) => {
    await AsyncStorage.setItem('artha_backup', JSON.stringify(data));
    setLocalDataSaved(true);
  };

  return (
    <DataContext.Provider value={{
      isReady,
      hasStarted,
      getStarted,
      clearData,
      backupToLocal,
      localDataSaved
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
