import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  Warning,
  CheckCircle,
  Schedule,
  TrendingUp,
  People,
  Assignment,
  Refresh,
  Speed,
  Error,
} from '@material-ui/icons';
import { useGraphqlQuery, useModulesManager, formatMessage } from '@openimis/fe-core';
import { useIntl, FormattedMessage } from 'react-intl';
import ModernGrievanceFilters from './filters/ModernGrievanceFilters';
import { useDashboardCache } from '../hooks/useDashboardCache';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import debounce from 'lodash/debounce';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(10),
    position: 'relative',
  },
  container: {
    position: 'relative',
  },
  header: {
    marginBottom: theme.spacing(4),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: 700,
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  statCard: {
    height: '100%',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[8],
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      background: (props) => props.color || theme.palette.primary.main,
    },
  },
  statIcon: {
    fontSize: 48,
    opacity: 0.2,
    position: 'absolute',
    right: 16,
    top: 16,
  },
  statValue: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1,
    marginBottom: theme.spacing(1),
  },
  statLabel: {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  statChange: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
    fontSize: '0.875rem',
  },
  chartPaper: {
    padding: theme.spacing(3),
    height: '100%',
    position: 'relative',
  },
  chartTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(2),
  },
  performanceChip: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    fontSize: '0.75rem',
  },
  refreshButton: {
    marginLeft: 'auto',
  },
  priorityHigh: {
    background: '#ff5252',
    color: 'white',
  },
  priorityMedium: {
    background: '#ff9800',
    color: 'white',
  },
  priorityLow: {
    background: '#4caf50',
    color: 'white',
  },
  sensitiveAlert: {
    background: theme.palette.error.light,
    color: theme.palette.error.contrastText,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
}));

// Optimized GraphQL query
const GRIEVANCE_DASHBOARD_QUERY = `
  query GrievanceDashboard($filters: String!) {
    ticketDashboard(filters: $filters) {
      summary {
        totalTickets
        openTickets
        resolvedTickets
        averageResolutionTime
        sensitiveCount
        anonymousCount
      }
      byStatus {
        status
        count
        percentage
      }
      byCategory {
        category
        count
        sensitive
      }
      byChannel {
        channel
        count
      }
      byPriority {
        priority
        count
        averageResolutionTime
      }
      resolutionTrend {
        date
        received
        resolved
        pending
      }
      topCategories {
        category
        count
        trend
      }
    }
  }
`;

const StatCard = ({ icon: Icon, value, label, change, color, loading }) => {
  const classes = useStyles({ color });
  
  if (loading) {
    return (
      <Card className={classes.statCard}>
        <CardContent>
          <Box height={40} width="60%" bgcolor="grey.200" borderRadius={1} mb={1} />
          <Box height={20} width="80%" bgcolor="grey.200" borderRadius={1} />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={classes.statCard}>
      <CardContent>
        <Icon className={classes.statIcon} style={{ color }} />
        <Typography className={classes.statValue} style={{ color }}>
          {value?.toLocaleString() || '0'}
        </Typography>
        <Typography className={classes.statLabel}>
          {label}
        </Typography>
        {change !== undefined && (
          <Box className={classes.statChange}>
            <TrendingUp style={{ 
              color: change >= 0 ? '#4caf50' : '#f44336',
              transform: change < 0 ? 'rotate(180deg)' : 'none'
            }} />
            <Typography style={{ color: change >= 0 ? '#4caf50' : '#f44336' }}>
              {Math.abs(change)}% from last month
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const EnhancedGrievanceDashboard = () => {
  const classes = useStyles();
  const theme = useTheme();
  const intl = useIntl();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const modulesManager = useModulesManager();
  
  const [filters, setFilters] = useState({
    status: [],
    categories: [],
    channels: [],
    priority: [],
    dateRange: { start: null, end: null },
  });
  const [loadTime, setLoadTime] = useState(null);

  // Build GraphQL filter string
  const filterString = useMemo(() => {
    const filterParts = [];
    
    if (Array.isArray(filters.status) && filters.status.length > 0) {
      filterParts.push(`status_In: ${JSON.stringify(filters.status)}`);
    }
    if (Array.isArray(filters.categories) && filters.categories.length > 0) {
      filterParts.push(`category_In: ${JSON.stringify(filters.categories)}`);
    }
    if (Array.isArray(filters.channels) && filters.channels.length > 0) {
      filterParts.push(`channel_In: ${JSON.stringify(filters.channels)}`);
    }
    if (Array.isArray(filters.priority) && filters.priority.length > 0) {
      filterParts.push(`priority_In: ${JSON.stringify(filters.priority)}`);
    }
    if (filters.dateRange?.start) {
      filterParts.push(`dateCreated_Gte: "${filters.dateRange.start.toISOString()}"`);
    }
    if (filters.dateRange?.end) {
      filterParts.push(`dateCreated_Lte: "${filters.dateRange.end.toISOString()}"`);
    }
    
    return filterParts.join(', ');
  }, [filters]);

  // Use cached dashboard data
  const {
    data: dashboardData,
    loading,
    error,
    isStale,
    refresh
  } = useDashboardCache(
    async () => {
      const startTime = Date.now();
      const { data } = await modulesManager.getRef('core.GraphqlClient').query({
        query: GRIEVANCE_DASHBOARD_QUERY,
        variables: { filters: filterString },
        fetchPolicy: 'network-only',
      });
      
      setLoadTime(Date.now() - startTime);
      return data?.ticketDashboard;
    },
    `grievance-dashboard-${filterString}`,
    [filterString]
  );

  // Debounced filter handler
  const handleFiltersChange = useCallback(
    debounce((newFilters) => {
      setFilters(newFilters);
    }, 500),
    []
  );

  // Chart colors
  const COLORS = {
    RECEIVED: '#2196f3',
    OPEN: '#03a9f4',
    IN_PROGRESS: '#ff9800',
    RESOLVED: '#4caf50',
    CLOSED: '#9e9e9e',
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <Grid container spacing={3}>
      {[1, 2, 3, 4].map(i => (
        <Grid item xs={12} sm={6} md={3} key={i}>
          <Paper style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Paper>
        </Grid>
      ))}
      <Grid item xs={12} md={8}>
        <Paper style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Paper>
      </Grid>
    </Grid>
  );

  if (loading && !dashboardData) {
    return (
      <div className={classes.root}>
        <Container maxWidth="xl" className={classes.container}>
          {renderSkeleton()}
        </Container>
      </div>
    );
  }

  const summary = dashboardData?.summary || {};

  return (
    <div className={classes.root}>
      <Container maxWidth="xl" className={classes.container}>
        <Fade in timeout={600}>
          <Box className={classes.header}>
            <Typography variant="h4" className={classes.title}>
              <FormattedMessage id="grievanceSocialProtection.dashboard.title" />
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              {loadTime && (
                <Chip
                  icon={<Speed />}
                  label={`${loadTime}ms`}
                  size="small"
                  className={classes.performanceChip}
                  color={loadTime < 500 ? 'primary' : 'default'}
                />
              )}
              <Tooltip title={formatMessage(intl, 'grievanceSocialProtection', 'dashboard.refresh')}>
                <IconButton
                  onClick={refresh}
                  disabled={loading}
                  className={classes.refreshButton}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Fade>

        {/* Sensitive Cases Alert */}
        {summary.sensitiveCount > 0 && (
          <Fade in timeout={700}>
            <Box className={classes.sensitiveAlert}>
              <Warning />
              <Typography>
                <FormattedMessage 
                  id="grievanceSocialProtection.dashboard.sensitiveAlert"
                  values={{ count: summary.sensitiveCount }}
                />
              </Typography>
            </Box>
          </Fade>
        )}

        {/* Key Metrics */}
        <Grid container spacing={3}>
          <Grow in timeout={800}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={Assignment}
                value={summary.totalTickets}
                label={formatMessage(intl, 'grievanceSocialProtection', 'dashboard.totalTickets')}
                color={theme.palette.primary.main}
                loading={loading}
              />
            </Grid>
          </Grow>
          
          <Grow in timeout={900}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={Schedule}
                value={summary.openTickets}
                label={formatMessage(intl, 'grievanceSocialProtection', 'dashboard.openTickets')}
                color={theme.palette.warning.main}
                loading={loading}
              />
            </Grid>
          </Grow>
          
          <Grow in timeout={1000}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={CheckCircle}
                value={summary.resolvedTickets}
                label={formatMessage(intl, 'grievanceSocialProtection', 'dashboard.resolvedTickets')}
                color={theme.palette.success.main}
                loading={loading}
              />
            </Grid>
          </Grow>
          
          <Grow in timeout={1100}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={People}
                value={summary.anonymousCount}
                label={formatMessage(intl, 'grievanceSocialProtection', 'dashboard.anonymousTickets')}
                color={theme.palette.info.main}
                loading={loading}
              />
            </Grid>
          </Grow>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} style={{ marginTop: theme.spacing(2) }}>
          {/* Status Distribution */}
          <Grow in timeout={1200}>
            <Grid item xs={12} md={8}>
              <Paper className={classes.chartPaper}>
                <Typography variant="h6" className={classes.chartTitle}>
                  <FormattedMessage id="grievanceSocialProtection.dashboard.statusDistribution" />
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={dashboardData?.byStatus || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="status" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatMessage(intl, 'grievanceSocialProtection', `ticket.status.${value}`)}
                    />
                    <YAxis />
                    <ChartTooltip />
                    <Bar dataKey="count" fill={theme.palette.primary.main}>
                      {(dashboardData?.byStatus || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.status] || theme.palette.grey[400]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grow>

          {/* Priority Distribution */}
          <Grow in timeout={1300}>
            <Grid item xs={12} md={4}>
              <Paper className={classes.chartPaper}>
                <Typography variant="h6" className={classes.chartTitle}>
                  <FormattedMessage id="grievanceSocialProtection.dashboard.priorityDistribution" />
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={dashboardData?.byPriority || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.priority}: ${entry.count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(dashboardData?.byPriority || []).map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.priority === 'URGENT' ? '#f44336' :
                            entry.priority === 'HIGH' ? '#ff9800' :
                            entry.priority === 'MEDIUM' ? '#2196f3' :
                            '#4caf50'
                          }
                        />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grow>

          {/* Resolution Trend */}
          <Grow in timeout={1400}>
            <Grid item xs={12}>
              <Paper className={classes.chartPaper}>
                <Typography variant="h6" className={classes.chartTitle}>
                  <FormattedMessage id="grievanceSocialProtection.dashboard.resolutionTrend" />
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData?.resolutionTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="received" 
                      stroke={theme.palette.primary.main}
                      name={formatMessage(intl, 'grievanceSocialProtection', 'dashboard.received')}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="resolved" 
                      stroke={theme.palette.success.main}
                      name={formatMessage(intl, 'grievanceSocialProtection', 'dashboard.resolved')}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pending" 
                      stroke={theme.palette.warning.main}
                      name={formatMessage(intl, 'grievanceSocialProtection', 'dashboard.pending')}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grow>
        </Grid>

        {/* Modern Filter System */}
        <ModernGrievanceFilters
          onFiltersChange={handleFiltersChange}
          defaultFilters={filters}
        />
      </Container>
    </div>
  );
};

export default EnhancedGrievanceDashboard;