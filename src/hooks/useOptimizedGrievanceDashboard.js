/**
 * Hook for Optimized Grievance Dashboard
 * Uses materialized views for high-performance data fetching
 */

import { useGraphqlQuery } from '@openimis/fe-core';
import { useMemo } from 'react';

// GraphQL query for optimized grievance dashboard
const OPTIMIZED_GRIEVANCE_DASHBOARD_QUERY = `
  query OptimizedGrievanceDashboard($filters: DashboardFiltersInput) {
    optimizedGrievanceDashboard(filters: $filters) {
      summary {
        totalTickets
        openTickets
        inProgressTickets
        resolvedTickets
        closedTickets
        sensitiveTickets
        anonymousTickets
        avgResolutionDays
      }
      statusDistribution {
        category
        count
        percentage
      }
      categoryDistribution {
        category
        count
        percentage
      }
      channelDistribution {
        category
        count
        percentage
      }
      priorityDistribution {
        category
        count
        percentage
      }
      genderDistribution {
        category
        count
        percentage
      }
      ageDistribution {
        category
        count
        percentage
      }
      monthlyTrend {
        month
        count
      }
      recentTickets {
        id
        dateOfIncident
        channel
        category
        status
        title
        description
        priority
        flags
        dateCreated
        dateUpdated
        reporterType
        reporterId
        reporterFirstName
        reporterLastName
        reporterTypeName
        gender
      }
      lastUpdated
    }
  }
`;

export const useOptimizedGrievanceDashboard = (filters = {}) => {
  // Prepare filters for GraphQL
  const variables = useMemo(() => {
    const dashboardFilters = {};
    
    if (filters.year) {
      dashboardFilters.year = filters.year;
    }
    if (filters.startDate) {
      dashboardFilters.startDate = filters.startDate;
    }
    if (filters.endDate) {
      dashboardFilters.endDate = filters.endDate;
    }
    if (filters.locationId) {
      dashboardFilters.provinceId = filters.locationId;
    }
    
    return {
      filters: dashboardFilters
    };
  }, [filters]);

  // Execute query
  const { data, isLoading, error, refetch } = useGraphqlQuery(
    OPTIMIZED_GRIEVANCE_DASHBOARD_QUERY,
    variables,
    { skip: false }
  );

  // Process the data
  const processedData = useMemo(() => {
    if (!data?.optimizedGrievanceDashboard) {
      return {
        summary: {
          totalTickets: 0,
          openTickets: 0,
          inProgressTickets: 0,
          resolvedTickets: 0,
          closedTickets: 0,
          sensitiveTickets: 0,
          anonymousTickets: 0,
          avgResolutionDays: 0,
          resolutionRate: 0,
        },
        statusDistribution: [],
        categoryDistribution: [],
        channelDistribution: [],
        priorityDistribution: [],
        genderDistribution: [],
        ageDistribution: [],
        monthlyTrend: [],
        recentTickets: [],
        lastUpdated: null,
      };
    }

    const dashboard = data.optimizedGrievanceDashboard;
    
    // Access camelCase fields from GraphQL
    let summary = {
      totalTickets: dashboard.summary.totalTickets || 0,
      openTickets: dashboard.summary.openTickets || 0,
      inProgressTickets: dashboard.summary.inProgressTickets || 0,
      resolvedTickets: dashboard.summary.resolvedTickets || 0,
      closedTickets: dashboard.summary.closedTickets || 0,
      sensitiveTickets: dashboard.summary.sensitiveTickets || 0,
      anonymousTickets: dashboard.summary.anonymousTickets || 0,
      avgResolutionDays: dashboard.summary.avgResolutionDays || 0,
    };
    
    // Fallback: Calculate from status distribution if summary is incomplete
    if (summary.inProgressTickets === 0 && dashboard.statusDistribution && dashboard.statusDistribution.length > 0) {
      const statusCounts = {};
      dashboard.statusDistribution.forEach(status => {
        statusCounts[status.category] = status.count;
      });
      
      summary = {
        ...summary,
        openTickets: statusCounts['OPEN'] || summary.openTickets || 0,
        inProgressTickets: statusCounts['IN_PROGRESS'] || summary.inProgressTickets || 0,
        resolvedTickets: statusCounts['RESOLVED'] || summary.resolvedTickets || 0,
        closedTickets: statusCounts['CLOSED'] || summary.closedTickets || 0,
      };
    }
    
    // Calculate resolution rate
    const resolutionRate = summary.totalTickets > 0
      ? (summary.resolvedTickets / summary.totalTickets) * 100
      : 0;

    return {
      summary: {
        ...summary,
        resolutionRate: Math.round(resolutionRate),
      },
      statusDistribution: dashboard.statusDistribution || [],
      categoryDistribution: dashboard.categoryDistribution || [],
      channelDistribution: dashboard.channelDistribution || [],
      priorityDistribution: dashboard.priorityDistribution || [],
      genderDistribution: dashboard.genderDistribution || [],
      ageDistribution: dashboard.ageDistribution || [],
      monthlyTrend: dashboard.monthlyTrend || [],
      recentTickets: dashboard.recentTickets || [],
      lastUpdated: dashboard.lastUpdated,
    };
  }, [data]);

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('Optimized Grievance Dashboard:', {
      variables,
      data,
      processedData,
      error,
      isLoading,
      rawSummary: data?.optimizedGrievanceDashboard?.summary
    });
  }

  return {
    ...processedData,
    isLoading,
    error,
    refetch,
  };
};