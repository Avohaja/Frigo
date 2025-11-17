import { createContext, useContext, useEffect, useState } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [dbData, setDbData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllTables = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/export-all');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setDbData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTables();
  }, []);

  return (
    <DataContext.Provider value={{ dbData, isLoading }}>
      {children}
    </DataContext.Provider>
  );
};
