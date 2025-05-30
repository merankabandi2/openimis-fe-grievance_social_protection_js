import { useState, useEffect, useCallback, useRef } from 'react';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const STALE_WHILE_REVALIDATE = 60 * 1000; // 1 minute

/**
 * Custom hook for cached dashboard data fetching with stale-while-revalidate
 */
export const useDashboardCache = (fetchFunction, cacheKey, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStale, setIsStale] = useState(false);
  
  const cacheRef = useRef({});
  const abortControllerRef = useRef(null);
  
  // Get cache from localStorage and memory
  const getCache = useCallback(() => {
    // First check memory cache
    if (cacheRef.current[cacheKey]) {
      const { data, timestamp } = cacheRef.current[cacheKey];
      const age = Date.now() - timestamp;
      
      if (age < CACHE_DURATION) {
        return { data, isStale: age > STALE_WHILE_REVALIDATE };
      }
    }
    
    // Then check localStorage
    try {
      const cached = localStorage.getItem(`grievance_dashboard_${cacheKey}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        if (age < CACHE_DURATION) {
          // Store in memory cache for faster access
          cacheRef.current[cacheKey] = { data, timestamp };
          return { data, isStale: age > STALE_WHILE_REVALIDATE };
        }
      }
    } catch (e) {
      console.error('Cache read error:', e);
    }
    return null;
  }, [cacheKey]);
  
  // Set cache in both localStorage and memory
  const setCache = useCallback((data) => {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    
    // Memory cache
    cacheRef.current[cacheKey] = cacheData;
    
    // LocalStorage cache
    try {
      localStorage.setItem(`grievance_dashboard_${cacheKey}`, JSON.stringify(cacheData));
    } catch (e) {
      console.error('Cache write error:', e);
    }
  }, [cacheKey]);
  
  // Fetch data with abort support
  const fetchData = useCallback(async (silent = false) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    try {
      if (!silent) setLoading(true);
      
      const result = await fetchFunction({
        signal: abortControllerRef.current.signal
      });
      
      setData(result);
      setCache(result);
      setError(null);
      setIsStale(false);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err);
        console.error('Dashboard fetch error:', err);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [fetchFunction, setCache]);
  
  // Initial load
  useEffect(() => {
    const cached = getCache();
    
    if (cached) {
      setData(cached.data);
      setIsStale(cached.isStale);
      setLoading(false);
      
      // If stale, revalidate in background
      if (cached.isStale) {
        fetchData(true);
      }
    } else {
      fetchData();
    }
    
    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [...dependencies, cacheKey]);
  
  // Manual refresh
  const refresh = useCallback(() => {
    setIsStale(false);
    fetchData();
  }, [fetchData]);
  
  // Prefetch data for next likely interaction
  const prefetch = useCallback((nextCacheKey) => {
    const prefetchKey = `grievance_dashboard_${nextCacheKey}`;
    const cached = localStorage.getItem(prefetchKey);
    
    if (!cached) {
      // Prefetch in background
      fetchFunction().then(data => {
        localStorage.setItem(prefetchKey, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      }).catch(console.error);
    }
  }, [fetchFunction]);
  
  return {
    data,
    loading,
    error,
    isStale,
    refresh,
    prefetch
  };
};

/**
 * Grievance-specific data aggregation utilities
 */
export const aggregateGrievanceData = (rawData) => {
  if (!rawData) return null;
  
  // Calculate resolution rate
  const resolutionRate = rawData.summary ? 
    (rawData.summary.resolvedTickets / rawData.summary.totalTickets * 100).toFixed(1) : 0;
  
  // Calculate average resolution time by category
  const categoryResolutionTimes = rawData.byCategory?.map(cat => ({
    ...cat,
    avgResolutionTime: cat.totalResolutionTime / cat.resolvedCount || 0
  })) || [];
  
  // Identify trending categories (increase > 20% from previous period)
  const trendingCategories = rawData.topCategories?.filter(cat => cat.trend > 20) || [];
  
  return {
    ...rawData,
    aggregated: {
      resolutionRate,
      categoryResolutionTimes,
      trendingCategories,
      lastUpdated: new Date().toISOString()
    }
  };
};

/**
 * Real-time updates using WebSocket
 */
export const useGrievanceRealTimeUpdates = (onUpdate) => {
  useEffect(() => {
    // Check if WebSocket is available
    if (!window.WebSocket) return;
    
    const ws = new WebSocket(process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws/grievance/');
    
    ws.onopen = () => {
      console.log('Connected to grievance WebSocket');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'grievance_update') {
          onUpdate(data.payload);
        }
      } catch (e) {
        console.error('WebSocket message error:', e);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return () => {
      ws.close();
    };
  }, [onUpdate]);
};

/**
 * Service Worker for background sync
 */
export const registerGrievanceServiceWorker = () => {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.register('/grievance-sw.js').then(registration => {
      console.log('Grievance Service Worker registered');
      
      // Register periodic sync
      if ('periodicSync' in registration) {
        registration.periodicSync.register('grievance-dashboard-sync', {
          minInterval: 10 * 60 * 1000 // 10 minutes
        }).catch(console.error);
      }
    }).catch(console.error);
  }
};

/**
 * Export dashboard data as CSV
 */
export const exportDashboardData = (data, filename = 'grievance-dashboard') => {
  if (!data) return;
  
  // Convert data to CSV format
  const csvContent = [
    // Headers
    ['Metric', 'Value', 'Date'],
    // Summary data
    ['Total Tickets', data.summary?.totalTickets || 0, new Date().toISOString()],
    ['Open Tickets', data.summary?.openTickets || 0, new Date().toISOString()],
    ['Resolved Tickets', data.summary?.resolvedTickets || 0, new Date().toISOString()],
    ['Sensitive Cases', data.summary?.sensitiveCount || 0, new Date().toISOString()],
    ['Anonymous Reports', data.summary?.anonymousCount || 0, new Date().toISOString()],
    // Add more rows as needed
  ].map(row => row.join(',')).join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};