import React, { useState, useEffect, useMemo } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';
import {
  Container,
  Grid,
  makeStyles,
  ThemeProvider,
  Paper,
  Typography,
  Box,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Fade,
  Card,
  CardContent,
  Avatar,
  Divider,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  CircularProgress,
} from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';
import RefreshIcon from '@material-ui/icons/Refresh';
import ReportProblemIcon from '@material-ui/icons/ReportProblem';
import WarningIcon from '@material-ui/icons/Warning';
import InfoIcon from '@material-ui/icons/Info';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import CancelIcon from '@material-ui/icons/Cancel';
import AssignmentIcon from '@material-ui/icons/Assignment';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import AssessmentIcon from '@material-ui/icons/Assessment';
import SpeedIcon from '@material-ui/icons/Speed';
import PhoneIcon from '@material-ui/icons/Phone';
import SmsIcon from '@material-ui/icons/Sms';
import PersonIcon from '@material-ui/icons/Person';
import EmailIcon from '@material-ui/icons/Email';
import FaceIcon from '@material-ui/icons/Face';
import WcIcon from '@material-ui/icons/Wc';
import ReactApexChart from 'react-apexcharts';

// Import the optimized hook and modern filters
import { useOptimizedGrievanceDashboard } from '../hooks/useOptimizedGrievanceDashboard';
import ModernGrievanceFilters from './filters/ModernGrievanceFilters';

// Create a custom theme
const theme = createTheme({
  typography: {
    fontFamily: '"Titillium Web", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 600,
    fontWeightBold: 700,
  },
  palette: {
    primary: {
      main: '#5a8dee',
    },
    secondary: {
      main: '#ff8f00',
    },
    success: {
      main: '#00d0bd',
    },
    error: {
      main: '#ff5c75',
    },
    warning: {
      main: '#ffb800',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  shape: {
    borderRadius: 12,
  },
});

// Custom styles
const useStyles = makeStyles((theme) => ({
  wrapper: {
    backgroundColor: theme.palette.background.default,
    minHeight: '100vh',
    paddingTop: theme.spacing(3),
  },
  contentArea: {
    padding: theme.spacing(2),
  },
  pageHeader: {
    marginBottom: theme.spacing(3),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: theme.spacing(2),
    },
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  titleIcon: {
    fontSize: '2.5rem',
    color: theme.palette.primary.main,
  },
  performanceChip: {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
    fontWeight: 600,
    fontSize: '0.75rem',
  },
  summaryCard: {
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    marginBottom: theme.spacing(3),
    position: 'relative',
    overflow: 'hidden',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: -50,
      right: -50,
      width: 200,
      height: 200,
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.1)',
    },
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: theme.spacing(3),
    position: 'relative',
    zIndex: 1,
  },
  summaryItem: {
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1,
  },
  summaryLabel: {
    fontSize: '0.875rem',
    opacity: 0.9,
    marginTop: theme.spacing(1),
  },
  statsCard: {
    height: '100%',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 30px rgba(0,0,0,.12)',
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
  statsCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  statsCardTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  statsCardValue: {
    fontSize: '2rem',
    fontWeight: 700,
    color: theme.palette.primary.main,
  },
  chartContainer: {
    height: 350,
    marginTop: theme.spacing(2),
  },
  refreshButton: {
    color: theme.palette.primary.main,
  },
  sensitiveAlert: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffeaa7',
    borderRadius: theme.spacing(1),
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  lastUpdated: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    textAlign: 'right',
    marginTop: theme.spacing(1),
  },
  tableContainer: {
    marginTop: theme.spacing(2),
  },
  channelIcon: {
    marginRight: theme.spacing(0.5),
  },
  statusChip: {
    fontWeight: 600,
  },
  severityChip: {
    fontWeight: 600,
  },
}));

// Status color mapping
const getStatusColor = (status) => {
  const statusMap = {
    'OPEN': 'warning',
    'IN_PROGRESS': 'primary',
    'RESOLVED': 'success',
    'CLOSED': 'default',
  };
  return statusMap[status] || 'default';
};

// Category severity mapping
const getCategorySeverity = (category) => {
  if (category === 'cas_sensibles') return 'error';
  if (category === 'cas_speciaux') return 'warning';
  return 'default';
};

// Get status icon
const getStatusIcon = (status) => {
  switch (status) {
    case 'OPEN': return <AssignmentIcon fontSize="small" />;
    case 'IN_PROGRESS': return <HourglassEmptyIcon fontSize="small" />;
    case 'RESOLVED': return <CheckCircleIcon fontSize="small" />;
    case 'CLOSED': return <CancelIcon fontSize="small" />;
    default: return null;
  }
};

// Get channel icon
const getChannelIcon = (channel) => {
  switch (channel) {
    case 'telephone': return <PhoneIcon fontSize="small" />;
    case 'sms': return <SmsIcon fontSize="small" />;
    case 'en_personne': return <PersonIcon fontSize="small" />;
    case 'courrier_electronique': return <EmailIcon fontSize="small" />;
    default: return null;
  }
};

// StatsCard component
const StatsCard = ({ title, value, icon: Icon, color, subtitle, loading, classes }) => {
  const cardClasses = useStyles({ color });
  
  if (loading) {
    return (
      <Card className={cardClasses.statsCard}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" height={100}>
            <CircularProgress size={40} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cardClasses.statsCard}>
      <CardContent>
        <div className={cardClasses.statsCardHeader}>
          <Typography className={cardClasses.statsCardTitle}>
            {title}
          </Typography>
          <Avatar style={{ backgroundColor: color, width: 40, height: 40 }}>
            <Icon style={{ fontSize: 20 }} />
          </Avatar>
        </div>
        <Typography className={cardClasses.statsCardValue} style={{ color }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="textSecondary">
            {subtitle}
          </Typography>
        )}
        <Box mt={2}>
          <LinearProgress 
            variant="determinate" 
            value={100}
            style={{ height: 4, borderRadius: 2, backgroundColor: color + '20' }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

// Main component
function GrievanceDashboardOptimized() {
  const intl = useIntl();
  const classes = useStyles();
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    startDate: '',
    endDate: '',
    channel: '',
    year: new Date().getFullYear(),
  });
  const [loadTime, setLoadTime] = useState(null);

  // Use the optimized hook
  const {
    summary,
    statusDistribution,
    categoryDistribution,
    channelDistribution,
    priorityDistribution,
    monthlyTrend,
    recentTickets,
    genderDistribution,
    ageDistribution,
    lastUpdated,
    isLoading,
    error,
    refetch,
  } = useOptimizedGrievanceDashboard(filters);

  // Track load time
  useEffect(() => {
    if (!isLoading && summary.totalTickets > 0) {
      setLoadTime(new Date().getTime());
    }
  }, [isLoading, summary.totalTickets]);

  // Calculate performance metrics
  const performanceTime = loadTime ? `${(new Date().getTime() - loadTime) / 1000}s` : null;

  // Helper function to get sensitive cases count
  const getSensitiveCasesCount = () => {
    // Debug: Log the data structures to understand what we're getting
    console.log('Debug - Summary:', summary);
    console.log('Debug - Category Distribution:', categoryDistribution);
    console.log('Debug - Recent Tickets Sample:', recentTickets?.slice(0, 5));
    
    // Use summary.sensitiveTickets as primary source since it's calculated by the backend
    if (summary.sensitiveTickets && summary.sensitiveTickets > 0) {
      return summary.sensitiveTickets;
    }
    
    // Try to find from category distribution as fallback
    const fromCategory = categoryDistribution.find(c => c.category === 'cas_sensibles')?.count || 0;
    
    // If still 0, count from recent tickets if available
    if (fromCategory === 0 && recentTickets && recentTickets.length > 0) {
      const countFromTickets = recentTickets.filter(ticket => 
        ticket.flags?.includes('SENSITIVE') || 
        ticket.category === 'cas_sensibles'
      ).length;
      
      // This is just a sample, so return an estimate
      if (countFromTickets > 0 && summary.totalTickets > 0) {
        // Estimate based on sample ratio
        const ratio = countFromTickets / Math.min(recentTickets.length, 10);
        return Math.ceil(ratio * summary.totalTickets);
      }
    }
    
    return fromCategory;
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setLoadTime(new Date().getTime());
  };

  const handleRefresh = () => {
    setLoadTime(new Date().getTime());
    refetch();
  };

  // Prepare chart data
  const prepareChartData = () => {
    // Status distribution chart
    const statusChart = {
      series: statusDistribution.map(s => s.count),
      labels: statusDistribution.map(s => {
        try {
          const translated = intl.formatMessage({ id: `grievance.status.${s.category}` });
          return translated !== `grievance.status.${s.category}` ? translated : s.category;
        } catch {
          return s.category;
        }
      }),
    };

    // Category distribution chart
    const categoryChart = {
      series: [{
        name: 'Plaintes',
        data: categoryDistribution.map(c => c.count)
      }],
      categories: categoryDistribution.map(c => {
        // Map category groups to French labels
        const categoryGroupLabels = {
          'cas_sensibles': 'Cas Sensibles',
          'cas_speciaux': 'Cas Spéciaux',
          'cas_non_sensibles': 'Cas Non Sensibles',
          'uncategorized': 'Non Catégorisé'
        };
        
        // First check if it's a category group
        if (categoryGroupLabels[c.category]) {
          return categoryGroupLabels[c.category];
        }
        
        // Otherwise try translation
        try {
          const translated = intl.formatMessage({ id: `grievance.category.${c.category}` });
          return translated !== `grievance.category.${c.category}` ? translated : c.category;
        } catch {
          return c.category;
        }
      }),
    };

    // Channel distribution chart
    const channelChart = {
      series: channelDistribution.map(c => c.count),
      labels: channelDistribution.map(c => {
        try {
          const translated = intl.formatMessage({ id: `grievance.channel.${c.category}` });
          return translated !== `grievance.channel.${c.category}` ? translated : c.category;
        } catch {
          return c.category;
        }
      }),
    };

    // Priority distribution chart
    const priorityChart = {
      series: priorityDistribution.map(p => p.percentage || Math.round((p.count / summary.totalTickets) * 100)),
      labels: priorityDistribution.map(p => {
        const priorityMap = {
          'HIGH': 'Haute',
          'MEDIUM': 'Moyenne',
          'LOW': 'Faible'
        };
        return priorityMap[p.category] || p.category;
      }),
    };

    // Monthly trend chart
    const monthlyChart = {
      series: [{
        name: 'Plaintes',
        data: (monthlyTrend || []).map(m => m.count)
      }],
      categories: (monthlyTrend || []).map(m => {
        const date = new Date(m.month);
        return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      })
    };

    return { statusChart, categoryChart, channelChart, priorityChart, monthlyChart };
  };

  const chartData = prepareChartData();

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.wrapper}>
        <Container maxWidth={false} className={classes.contentArea}>
          {/* Page Header */}
          <div className={classes.pageHeader}>
            <Typography className={classes.pageTitle}>
              <ReportProblemIcon className={classes.titleIcon} />
              Tableau de Bord - Gestion des Plaintes
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              {performanceTime && (
                <Chip
                  icon={<SpeedIcon />}
                  label={`Chargé en ${performanceTime}`}
                  className={classes.performanceChip}
                  size="small"
                />
              )}
              <Tooltip title="Actualiser les données">
                <IconButton 
                  className={classes.refreshButton}
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </div>

          {/* Alert for sensitive cases */}
          {getSensitiveCasesCount() > 0 && (
            <Box className={classes.sensitiveAlert}>
              <WarningIcon color="error" />
              <Typography variant="body2">
                <strong>{getSensitiveCasesCount()} cas sensibles</strong> nécessitent une attention immédiate
              </Typography>
            </Box>
          )}

          {/* Modern Filters */}
          <ModernGrievanceFilters 
            onFilterChange={handleFilterChange}
            defaultFilters={filters}
          />

          {/* Loading State */}
          {isLoading && (
            <Box className={classes.loadingContainer}>
              <CircularProgress size={60} />
            </Box>
          )}

          {/* Summary Card */}
          {!isLoading && (
            <Fade in={!isLoading}>
              <Paper className={classes.summaryCard}>
                <div className={classes.summaryGrid}>
                  <div className={classes.summaryItem}>
                    <Typography className={classes.summaryValue}>
                      {summary.totalTickets}
                    </Typography>
                    <Typography className={classes.summaryLabel}>
                      Total des Plaintes
                    </Typography>
                  </div>
                  <div className={classes.summaryItem}>
                    <Typography className={classes.summaryValue}>
                      {summary.openTickets}
                    </Typography>
                    <Typography className={classes.summaryLabel}>
                      En Attente
                    </Typography>
                  </div>
                  <div className={classes.summaryItem}>
                    <Typography className={classes.summaryValue}>
                      {summary.resolutionRate}%
                    </Typography>
                    <Typography className={classes.summaryLabel}>
                      Taux de Résolution
                    </Typography>
                  </div>
                  <div className={classes.summaryItem}>
                    <Typography className={classes.summaryValue}>
                      {Math.round(summary.avgResolutionDays)}j
                    </Typography>
                    <Typography className={classes.summaryLabel}>
                      Temps Moyen de Résolution
                    </Typography>
                  </div>
                </div>
              </Paper>
            </Fade>
          )}

          {/* Statistics Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <StatsCard
                title="Cas Sensibles"
                value={getSensitiveCasesCount()}
                icon={WarningIcon}
                color="#ff5c75"
                subtitle="Violence, corruption, discrimination"
                loading={isLoading}
                classes={classes}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatsCard
                title="Cas Spéciaux"
                value={categoryDistribution.find(c => c.category === 'cas_speciaux')?.count || 0}
                icon={InfoIcon}
                color="#ffb800"
                subtitle="Erreurs d'inclusion/exclusion"
                loading={isLoading}
                classes={classes}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <StatsCard
                title="Cas Non-Sensibles"
                value={categoryDistribution.find(c => c.category === 'cas_non_sensibles')?.count || 0}
                icon={AssessmentIcon}
                color="#00d0bd"
                subtitle="Paiements, téléphone, assistance"
                loading={isLoading}
                classes={classes}
              />
            </Grid>

          </Grid>

          {/* Charts */}
          {!isLoading && (
            <Grid container spacing={3} style={{ marginTop: 24 }}>
              <Grid item xs={12} md={6}>
                <Paper style={{ padding: 24 }}>
                  <Typography variant="h6" gutterBottom>
                    Distribution par Statut
                  </Typography>
                  <div className={classes.chartContainer}>
                    <ReactApexChart
                      options={{
                        chart: { type: 'donut' },
                        labels: chartData.statusChart.labels,
                        colors: ['#ffb800', '#5a8dee', '#00d0bd', '#6c757d'],
                        legend: { position: 'bottom' },
                        dataLabels: { enabled: true },
                      }}
                      series={chartData.statusChart.series}
                      type="donut"
                      height="100%"
                    />
                  </div>
                </Paper>
              </Grid>

              {channelDistribution.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Paper style={{ padding: 24 }}>
                    <Typography variant="h6" gutterBottom>
                      Plaintes par Canal
                    </Typography>
                    <div className={classes.chartContainer}>
                      <ReactApexChart
                        options={{
                          chart: { type: 'pie' },
                          labels: chartData.channelChart.labels,
                          colors: ['#5a8dee', '#ff5c75', '#00d0bd', '#ffb800'],
                          legend: { position: 'bottom' },
                        }}
                        series={chartData.channelChart.series}
                        type="pie"
                        height="100%"
                      />
                    </div>
                  </Paper>
                </Grid>
              )}

              <Grid item xs={12} md={6}>
                <Paper style={{ padding: 24 }}>
                  <Typography variant="h6" gutterBottom>
                    Plaintes par Catégorie
                  </Typography>
                  <div className={classes.chartContainer}>
                    <ReactApexChart
                      options={{
                        chart: { type: 'bar' },
                        xaxis: { categories: chartData.categoryChart.categories },
                        colors: ['#ff5c75'],
                        plotOptions: {
                          bar: {
                            borderRadius: 4,
                            horizontal: true,
                          }
                        },
                      }}
                      series={chartData.categoryChart.series}
                      type="bar"
                      height="100%"
                    />
                  </div>
                </Paper>
              </Grid>

              {priorityDistribution.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Paper style={{ padding: 24 }}>
                    <Typography variant="h6" gutterBottom>
                      Distribution par Priorité
                    </Typography>
                    <div className={classes.chartContainer}>
                      <ReactApexChart
                        options={{
                          chart: { type: 'radialBar' },
                          labels: chartData.priorityChart.labels,
                          colors: ['#ff5252', '#ff9800', '#4caf50'],
                          plotOptions: {
                            radialBar: {
                              dataLabels: {
                                show: true,
                                value: {
                                  formatter: function (val) {
                                    return parseInt(val) + '%';
                                  }
                                }
                              }
                            }
                          },
                        }}
                        series={chartData.priorityChart.series}
                        type="radialBar"
                        height="100%"
                      />
                    </div>
                  </Paper>
                </Grid>
              )}

              {monthlyTrend && monthlyTrend.length > 0 && (
                <Grid item xs={12}>
                  <Paper style={{ padding: 24 }}>
                    <Typography variant="h6" gutterBottom>
                      Évolution Mensuelle
                    </Typography>
                    <div className={classes.chartContainer}>
                      <ReactApexChart
                        options={{
                          chart: { type: 'area' },
                          xaxis: { categories: chartData.monthlyChart.categories },
                          colors: ['#5a8dee'],
                          stroke: { curve: 'smooth' },
                          fill: {
                            type: 'gradient',
                            gradient: {
                              shadeIntensity: 1,
                              opacityFrom: 0.7,
                              opacityTo: 0.3,
                            }
                          },
                        }}
                        series={chartData.monthlyChart.series}
                        type="area"
                        height="100%"
                      />
                    </div>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}

          {/* Recent Grievances Table */}
          {!isLoading && recentTickets && recentTickets.length > 0 && (
            <Box mt={6} mb={4}>
              <Divider />
              <Typography 
                variant="h5" 
                align="center" 
                style={{ 
                  marginTop: theme.spacing(4), 
                  marginBottom: theme.spacing(2),
                  fontWeight: 600,
                  color: theme.palette.text.primary
                }}
              >
                <AssignmentIcon style={{ verticalAlign: 'middle', marginRight: theme.spacing(1), color: theme.palette.primary.main }} />
                Plaintes Récents
              </Typography>

              <Paper>
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="fullWidth"
                >
                  <Tab 
                    label={
                      <Badge badgeContent={summary.totalTickets} color="primary">
                        Tous les Plaintes
                      </Badge>
                    } 
                  />
                  <Tab 
                    label={
                      <Badge badgeContent={summary.sensitiveTickets} color="error">
                        Cas Sensibles
                      </Badge>
                    } 
                  />
                  <Tab 
                    label={
                      <Badge badgeContent={summary.openTickets} color="warning">
                        En Attente
                      </Badge>
                    } 
                  />
                </Tabs>
                
                <Box p={3}>
                  <TableContainer component={Paper} className={classes.tableContainer}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Titre</TableCell>
                          <TableCell>Canal</TableCell>
                          <TableCell>Catégorie</TableCell>
                          <TableCell>Rapporteur</TableCell>
                          <TableCell align="center">Priorité</TableCell>
                          <TableCell align="center">Statut</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentTickets
                          .filter(ticket => {
                            if (activeTab === 0) return true;
                            if (activeTab === 1) return ticket.flags?.includes('SENSITIVE') || ticket.category === 'cas_sensibles';
                            if (activeTab === 2) return ticket.status === 'OPEN';
                            return true;
                          })
                          .slice(0, 10)
                          .map((ticket) => (
                            <TableRow key={ticket.id}>
                              <TableCell>{new Date(ticket.dateCreated).toLocaleDateString('fr-FR')}</TableCell>
                              <TableCell>{ticket.title || '-'}</TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center">
                                  {getChannelIcon(ticket.channel)}
                                  <span className={classes.channelIcon}>
                                    {(() => {
                                      if (!ticket.channel) return '-';
                                      try {
                                        const translated = intl.formatMessage({ id: `grievance.channel.${ticket.channel}` });
                                        if (translated && translated !== `grievance.channel.${ticket.channel}`) {
                                          return translated;
                                        }
                                      } catch (e) {}
                                      return ticket.channel.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                                    })()}
                                  </span>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={(() => {
                                    if (!ticket.category) return 'Sans catégorie';
                                    try {
                                      const translated = intl.formatMessage({ id: `grievance.category.${ticket.category}` });
                                      if (translated && translated !== `grievance.category.${ticket.category}`) {
                                        return translated;
                                      }
                                    } catch (e) {}
                                    return ticket.category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                                  })()}
                                  color={getCategorySeverity(ticket.category)}
                                  size="small"
                                  className={classes.severityChip}
                                />
                              </TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                  {ticket.gender === 'M' ? <FaceIcon fontSize="small" /> : 
                                   ticket.gender === 'F' ? <WcIcon fontSize="small" /> : null}
                                  {ticket.reporterFirstName || ticket.reporterLastName ? 
                                    `${ticket.reporterFirstName || ''} ${ticket.reporterLastName || ''}`.trim() : 
                                    '-'
                                  }
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                {ticket.priority && (
                                  <Chip 
                                    label={ticket.priority}
                                    color={ticket.priority === 'HIGH' ? 'error' : ticket.priority === 'MEDIUM' ? 'warning' : 'default'}
                                    size="small"
                                  />
                                )}
                              </TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={(() => {
                                    if (!ticket.status) return '-';
                                    try {
                                      const translated = intl.formatMessage({ id: `grievance.status.${ticket.status}` });
                                      if (translated && translated !== `grievance.status.${ticket.status}`) {
                                        return translated;
                                      }
                                    } catch (e) {}
                                    return ticket.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                                  })()}
                                  color={getStatusColor(ticket.status)}
                                  size="small"
                                  icon={getStatusIcon(ticket.status)}
                                  className={classes.statusChip}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography 
                    variant="caption" 
                    color="textSecondary" 
                    align="center" 
                    display="block"
                    style={{ marginTop: theme.spacing(2) }}
                  >
                    Affichage des 10 plaintes les plus récents
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}

          {/* Last Updated */}
          {lastUpdated && (
            <Typography className={classes.lastUpdated}>
              Dernière mise à jour: {new Date(lastUpdated).toLocaleString('fr-FR')}
            </Typography>
          )}
        </Container>
      </div>
    </ThemeProvider>
  );
}

const mapStateToProps = () => ({});
const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(GrievanceDashboardOptimized);