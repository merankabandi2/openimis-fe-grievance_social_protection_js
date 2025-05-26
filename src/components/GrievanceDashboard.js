import React, { useEffect, useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
} from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';
import { baseApiUrl, apiHeaders } from '@openimis/fe-core';
import RefreshIcon from '@material-ui/icons/Refresh';
import ReportProblemIcon from '@material-ui/icons/ReportProblem';
import WarningIcon from '@material-ui/icons/Warning';
import InfoIcon from '@material-ui/icons/Info';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import CancelIcon from '@material-ui/icons/Cancel';
import AssignmentIcon from '@material-ui/icons/Assignment';
import PeopleIcon from '@material-ui/icons/People';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import AssessmentIcon from '@material-ui/icons/Assessment';
import FaceIcon from '@material-ui/icons/Face';
import WcIcon from '@material-ui/icons/Wc';
import PhoneIcon from '@material-ui/icons/Phone';
import SmsIcon from '@material-ui/icons/Sms';
import PersonIcon from '@material-ui/icons/Person';
import EmailIcon from '@material-ui/icons/Email';
import ReactApexChart from 'react-apexcharts';

const REQUESTED_WITH = 'webapp';

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
  filterContainer: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    backgroundColor: '#fff',
    borderRadius: theme.spacing(1),
    boxShadow: '0 0 20px rgba(0,0,0,.06)',
  },
  summaryCard: {
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    marginBottom: theme.spacing(3),
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: theme.spacing(3),
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
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 30px rgba(0,0,0,.12)',
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
  statusChip: {
    fontWeight: 600,
  },
  severityChip: {
    fontWeight: 600,
  },
  chartContainer: {
    height: 350,
    marginTop: theme.spacing(2),
  },
  tableContainer: {
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
  channelIcon: {
    marginRight: theme.spacing(0.5),
  },
}));

// Build filter string for GraphQL queries
const buildFilter = (filters) => {
  const filterParts = [];
  
  if (filters.status) {
    filterParts.push(`status: "${filters.status}"`);
  }
  
  if (filters.category) {
    filterParts.push(`category: "${filters.category}"`);
  }
  
  if (filters.startDate) {
    filterParts.push(`dateReceived_Gte: "${filters.startDate}"`);
  }
  
  if (filters.endDate) {
    filterParts.push(`dateReceived_Lte: "${filters.endDate}"`);
  }
  
  if (filters.channel) {
    filterParts.push(`channel: "${filters.channel}"`);
  }
  
  return filterParts.length > 0 ? `(${filterParts.join(', ')})` : '';
};

// Load grievances data from backend
const loadGrievancesData = async (filters = {}) => {
  const csrfToken = localStorage.getItem('csrfToken');
  const baseHeaders = apiHeaders();
  const filterString = buildFilter(filters);

  const response = await fetch(`${baseApiUrl}/graphql`, {
    method: 'post',
    headers: { ...baseHeaders, 'X-Requested-With': REQUESTED_WITH, 'X-CSRFToken': csrfToken },
    body: JSON.stringify({
      query: `
        {
          tickets${filterString ? filterString.slice(0, -1) + ', first: 1000)' : '(first: 1000)'} {
            edges {
              node {
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
                reporter
              }
            }
            totalCount
          }
        }
      `,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch grievances data');
  }

  const { data } = await response.json();
  return data;
};

// Load aggregation data from backend
const loadAggregationData = async (filters = {}) => {
  const csrfToken = localStorage.getItem('csrfToken');
  const baseHeaders = apiHeaders();
  
  // Build filter parameters for aggregation
  const filterParams = [];
  if (filters.status) filterParams.push(`status: "${filters.status}"`);
  if (filters.category) filterParams.push(`category: "${filters.category}"`);
  if (filters.channel) filterParams.push(`channel: "${filters.channel}"`);
  if (filters.startDate) filterParams.push(`dateReceivedGte: "${filters.startDate}"`);
  if (filters.endDate) filterParams.push(`dateReceivedLte: "${filters.endDate}"`);
  
  const filterString = filterParams.length > 0 ? `(${filterParams.join(', ')})` : '';

  const response = await fetch(`${baseApiUrl}/graphql`, {
    method: 'post',
    headers: { ...baseHeaders, 'X-Requested-With': REQUESTED_WITH, 'X-CSRFToken': csrfToken },
    body: JSON.stringify({
      query: `
        {
          ticketsAggregation${filterString} {
            totalCount
            openCount
            pendingCount
            inProgressCount
            resolvedCount
            closedCount
            sensitiveCount
            avgResolutionDays
            statusDistribution {
              status
              count
            }
            categoryDistribution {
              category
              count
            }
            channelDistribution {
              channel
              count
            }
            priorityDistribution {
              priority
              count
            }
            monthlyDistribution {
              month
              count
            }
            genderDistribution {
              gender
              count
            }
          }
        }
      `,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch aggregation data');
  }

  const { data } = await response.json();
  return data;
};

// Get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'OPEN':
      return 'warning';
    case 'IN_PROGRESS':
      return 'primary';
    case 'RESOLVED':
      return 'primary';
    case 'CLOSED':
      return 'default';
    default:
      return 'default';
  }
};

// Get status icon
const getStatusIcon = (status) => {
  switch (status) {
    case 'OPEN':
      return <AssignmentIcon />;
    case 'IN_PROGRESS':
      return <HourglassEmptyIcon />;
    case 'RESOLVED':
      return <CheckCircleIcon />;
    case 'CLOSED':
      return <CancelIcon />;
    default:
      return null;
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

// Get category severity
const getCategorySeverity = (category) => {
  if (!category) return 'default';
  
  // Parse category if it's a JSON array string
  let categoryValue = category;
  try {
    if (typeof categoryValue === 'string' && categoryValue.startsWith('[')) {
      const parsed = JSON.parse(categoryValue);
      categoryValue = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : categoryValue;
    }
  } catch (e) {
    // If parsing fails, use original value
  }
  
  // Check for sensitive categories
  const sensitiveCategories = ['violence_vbg', 'corruption', 'accident_negligence', 'discrimination_ethnie_religion'];
  const specialCategories = ['erreur_exclusion', 'erreur_inclusion', 'maladie_mentale'];
  
  if (categoryValue === 'cas_sensibles' || sensitiveCategories.includes(categoryValue)) {
    return 'error';
  }
  if (categoryValue === 'cas_speciaux' || specialCategories.includes(categoryValue)) {
    return 'warning';
  }
  return 'default';
};

// Dashboard component
function GrievanceDashboard() {
  const intl = useIntl();
  const [data, setData] = useState({
    tickets: [],
    totalCount: 0,
  });
  const [aggregationData, setAggregationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    startDate: '',
    endDate: '',
    channel: '',
  });
  const classes = useStyles();

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch aggregation data first
      const aggResult = await loadAggregationData(filters);
      setAggregationData(aggResult.ticketsAggregation);
      
      // Then fetch just the most recent tickets for the table (limit to 50)
      const recentTicketsFilter = { ...filters };
      const filterString = buildFilter(recentTicketsFilter);
      
      const csrfToken = localStorage.getItem('csrfToken');
      const baseHeaders = apiHeaders();
      
      const recentResponse = await fetch(`${baseApiUrl}/graphql`, {
        method: 'post',
        headers: { ...baseHeaders, 'X-Requested-With': REQUESTED_WITH, 'X-CSRFToken': csrfToken },
        body: JSON.stringify({
          query: `
            {
              tickets${filterString ? filterString.slice(0, -1) + ', first: 50, orderBy: "-date_created")' : '(first: 50, orderBy: "-date_created")'} {
                edges {
                  node {
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
                    reporter
                  }
                }
                totalCount
              }
            }
          `,
        }),
      });
      
      if (recentResponse.ok) {
        const { data: ticketResult } = await recentResponse.json();
        
        // Process tickets to extract reporter info from JSON
        const processedTickets = ticketResult.tickets?.edges?.map(edge => {
          const ticket = edge.node;
          const reporterData = ticket.reporter ? JSON.parse(ticket.reporter) : null;
          return {
            ...ticket,
            isBeneficiary: ticket.reporterTypeName === 'beneficiary',
            gender: reporterData?.gender || reporterData?.individual?.gender || null,
          };
        }) || [];
        
        setData({
          tickets: processedTickets,
          totalCount: aggResult.ticketsAggregation?.totalCount || ticketResult.tickets?.totalCount || 0,
        });
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: '',
      category: '',
      startDate: '',
      endDate: '',
      channel: '',
    });
  };

  // Calculate summary statistics
  const calculateStats = () => {
    // Use aggregation data if available
    if (aggregationData) {
      return {
        total: aggregationData.totalCount,
        open: aggregationData.openCount,
        pending: aggregationData.pendingCount,
        inProgress: aggregationData.inProgressCount,
        resolved: aggregationData.resolvedCount,
        closed: aggregationData.closedCount,
        sensitive: aggregationData.sensitiveCount,
        avgResolutionDays: Math.round(aggregationData.avgResolutionDays || 0),
        
        // Extract category counts
        casSensibles: aggregationData.categoryDistribution.find(c => c.category === 'cas_sensibles')?.count || 0,
        casSpeciaux: aggregationData.categoryDistribution.find(c => c.category === 'cas_speciaux')?.count || 0,
        casNonSensibles: aggregationData.categoryDistribution.find(c => c.category === 'cas_non_sensibles')?.count || 0,
        noCategory: aggregationData.categoryDistribution.find(c => c.category === 'no_category')?.count || 0,
        
        // Extract channel counts
        telephone: aggregationData.channelDistribution.find(c => c.channel === 'telephone')?.count || 0,
        sms: aggregationData.channelDistribution.find(c => c.channel === 'sms')?.count || 0,
        enPersonne: aggregationData.channelDistribution.find(c => c.channel === 'en_personne')?.count || 0,
        email: aggregationData.channelDistribution.find(c => c.channel === 'courrier_electronique')?.count || 0,
        
        // Extract priority counts
        high: aggregationData.priorityDistribution.find(p => p.priority === 'HIGH')?.count || 0,
        medium: aggregationData.priorityDistribution.find(p => p.priority === 'MEDIUM')?.count || 0,
        low: aggregationData.priorityDistribution.find(p => p.priority === 'LOW')?.count || 0,
        
        // Extract gender counts
        male: aggregationData.genderDistribution.find(g => g.gender === 'M')?.count || 0,
        female: aggregationData.genderDistribution.find(g => g.gender === 'F')?.count || 0,
      };
    }
    
    // Fallback to client-side calculation
    const stats = {
      total: data.tickets.length,
      open: data.tickets.filter(t => t.status === 'OPEN').length,
      pending: data.tickets.filter(t => t.status === 'PENDING').length,
      inProgress: data.tickets.filter(t => t.status === 'IN_PROGRESS').length,
      resolved: data.tickets.filter(t => t.status === 'RESOLVED').length,
      closed: data.tickets.filter(t => t.status === 'CLOSED').length,
      
      // Check if ticket has sensitive flags
      sensitive: data.tickets.filter(t => {
        let cat = t.category;
        try {
          if (typeof cat === 'string' && cat.startsWith('[')) {
            const parsed = JSON.parse(cat);
            cat = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : cat;
          }
        } catch (e) {}
        return t.flags?.includes('SENSITIVE') || cat === 'cas_sensibles';
      }).length,
      
      // Categories
      casSensibles: data.tickets.filter(t => {
        let cat = t.category;
        try {
          if (typeof cat === 'string' && cat.startsWith('[')) {
            const parsed = JSON.parse(cat);
            cat = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : cat;
          }
        } catch (e) {}
        return cat === 'cas_sensibles';
      }).length,
      casSpeciaux: data.tickets.filter(t => {
        let cat = t.category;
        try {
          if (typeof cat === 'string' && cat.startsWith('[')) {
            const parsed = JSON.parse(cat);
            cat = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : cat;
          }
        } catch (e) {}
        return cat === 'cas_speciaux';
      }).length,
      casNonSensibles: data.tickets.filter(t => {
        let cat = t.category;
        try {
          if (typeof cat === 'string' && cat.startsWith('[')) {
            const parsed = JSON.parse(cat);
            cat = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : cat;
          }
        } catch (e) {}
        return cat === 'cas_non_sensibles';
      }).length,
      noCategory: data.tickets.filter(t => !t.category || t.category === '[]' || t.category === '').length,
      
      // Channels
      telephone: data.tickets.filter(t => t.channel === 'telephone').length,
      sms: data.tickets.filter(t => t.channel === 'sms').length,
      enPersonne: data.tickets.filter(t => t.channel === 'en_personne').length,
      email: data.tickets.filter(t => t.channel === 'courrier_electronique').length,
      
      // Priority levels
      high: data.tickets.filter(t => t.priority === 'HIGH').length,
      medium: data.tickets.filter(t => t.priority === 'MEDIUM').length,
      low: data.tickets.filter(t => t.priority === 'LOW').length,
      
      // Gender split
      male: data.tickets.filter(t => t.gender === 'M' || t.gender === 'homme').length,
      female: data.tickets.filter(t => t.gender === 'F' || t.gender === 'femme').length,
      
      // Resolution time
      avgResolutionDays: 0,
    };

    // Calculate average resolution time
    const resolvedTickets = data.tickets.filter(t => t.status === 'RESOLVED' && t.dateUpdated);
    if (resolvedTickets.length > 0) {
      const totalDays = resolvedTickets.reduce((sum, t) => {
        const created = new Date(t.dateCreated);
        const resolved = new Date(t.dateUpdated);
        const days = (resolved - created) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0);
      stats.avgResolutionDays = Math.round(totalDays / resolvedTickets.length);
    }

    return stats;
  };

  const stats = calculateStats();

  // Prepare chart data
  const prepareChartData = () => {
    // Use aggregation data if available
    if (aggregationData) {
      // Status distribution from aggregation
      const statusData = aggregationData.statusDistribution || [];
      const statusMap = {
        'OPEN': 'Ouvert',
        'PENDING': 'En attente',
        'IN_PROGRESS': 'En cours',
        'RESOLVED': 'Résolu',
        'CLOSED': 'Fermé'
      };
      
      const statusDistribution = {
        series: statusData.map(s => s.count),
        labels: statusData.map(s => statusMap[s.status] || s.status)
      };
      
      // Category distribution from aggregation
      const categoryData = aggregationData.categoryDistribution || [];
      
      const categoryDistribution = {
        series: [{
          name: 'Plaintes',
          data: categoryData.map(c => c.count)
        }],
        categories: categoryData.map(c => {
          try {
            const translated = intl.formatMessage({ id: `grievance.category.${c.category}` });
            return translated !== `grievance.category.${c.category}` ? translated : c.category;
          } catch (e) {
            return c.category;
          }
        })
      };
      
      // Channel distribution from aggregation
      const channelData = aggregationData.channelDistribution || [];
      
      const channelDistribution = {
        series: channelData.map(c => c.count),
        labels: channelData.map(c => {
          try {
            const translated = intl.formatMessage({ id: `grievance.channel.${c.channel}` });
            return translated !== `grievance.channel.${c.channel}` ? translated : c.channel;
          } catch (e) {
            return c.channel;
          }
        })
      };
      
      // Monthly distribution from aggregation
      const monthlyData = aggregationData.monthlyDistribution || [];
      const monthlyDistribution = {
        series: [{
          name: 'Plaintes',
          data: monthlyData.map(m => m.count)
        }],
        categories: monthlyData.map(m => {
          const [year, month] = m.month.split('-');
          return new Date(year, month - 1).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        })
      };
      
      return { statusDistribution, categoryDistribution, channelDistribution, monthlyData: monthlyDistribution };
    }
    
    // Fallback to client-side calculation
    const statusDistribution = {
      series: [stats.pending, stats.inProgress, stats.resolved, stats.closed],
      labels: ['En attente', 'En cours', 'Résolu', 'Fermé']
    };

    // Category distribution
    const categoryDistribution = {
      series: [{
        name: 'Plaintes',
        data: [stats.casSensibles, stats.casSpeciaux, stats.casNonSensibles, stats.noCategory]
      }],
      categories: ['Cas Sensibles', 'Cas Spéciaux', 'Cas Non-Sensibles', 'Sans Catégorie']
    };

    // Channel distribution
    const channelDistribution = {
      series: [stats.telephone, stats.sms, stats.enPersonne, stats.email],
      labels: ['Téléphone', 'SMS', 'En personne', 'Email']
    };

    // Tickets by month
    const ticketsByMonth = {};
    data.tickets.forEach(ticket => {
      const date = new Date(ticket.dateCreated);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      ticketsByMonth[monthKey] = (ticketsByMonth[monthKey] || 0) + 1;
    });

    const sortedMonths = Object.keys(ticketsByMonth).sort();
    const monthlyData = {
      series: [{
        name: 'Plaintes',
        data: sortedMonths.map(month => ticketsByMonth[month])
      }],
      categories: sortedMonths.map(month => {
        const [year, monthNum] = month.split('-');
        const monthName = new Date(year, monthNum - 1).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        return monthName;
      })
    };

    return { statusDistribution, categoryDistribution, channelDistribution, monthlyData };
  };

  const chartData = prepareChartData();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderGrievancesTable = () => {
    // Sort by date and take recent tickets based on tab
    let filteredTickets = [...data.tickets];
    
    if (activeTab === 1) {
      // Sensitive cases only
      filteredTickets = filteredTickets.filter(t => {
        let cat = t.category;
        try {
          if (typeof cat === 'string' && cat.startsWith('[')) {
            const parsed = JSON.parse(cat);
            cat = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : cat;
          }
        } catch (e) {}
        return t.flags?.includes('SENSITIVE') || cat === 'cas_sensibles';
      });
    } else if (activeTab === 2) {
      // Pending cases only
      filteredTickets = filteredTickets.filter(t => t.status === 'PENDING');
    }
    
    const recentTickets = filteredTickets
      .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
      .slice(0, 10);

    return (
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Titre</TableCell>
              <TableCell>Canal</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell>Rapporteur</TableCell>
              <TableCell align="center">Type</TableCell>
              <TableCell align="center">Priorité</TableCell>
              <TableCell align="center">Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentTickets.map((ticket) => (
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
                          // Try to get translation
                          const translated = intl.formatMessage({ id: `grievance.channel.${ticket.channel}` });
                          // If translation exists and is different from the key, return it
                          if (translated && translated !== `grievance.channel.${ticket.channel}`) {
                            return translated;
                          }
                        } catch (e) {
                          // If translation fails, continue to fallback
                        }
                        // Fallback: clean up the channel string
                        let cleanChannel = ticket.channel;
                        if (cleanChannel.startsWith('[') && cleanChannel.endsWith(']')) {
                          cleanChannel = cleanChannel.slice(1, -1);
                        }
                        if (cleanChannel.startsWith('"') && cleanChannel.endsWith('"')) {
                          cleanChannel = cleanChannel.slice(1, -1);
                        }
                        return cleanChannel
                          .replace(/_/g, ' ')
                          .toLowerCase()
                          .replace(/\b\w/g, l => l.toUpperCase());
                      })()}
                    </span>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={(() => {
                      if (!ticket.category || ticket.category === '[]' || ticket.category === '') {
                        return 'Sans catégorie';
                      }
                      try {
                        // Parse category if it's a JSON array string
                        let categoryValue = ticket.category;
                        if (typeof categoryValue === 'string' && categoryValue.startsWith('[')) {
                          const parsed = JSON.parse(categoryValue);
                          categoryValue = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
                          if (!categoryValue) {
                            return 'Sans catégorie';
                          }
                        }
                        
                        // Try to get translation
                        const translated = intl.formatMessage({ id: `grievance.category.${categoryValue}` });
                        // If translation exists and is different from the key, return it
                        if (translated && translated !== `grievance.category.${categoryValue}`) {
                          return translated;
                        }
                        
                        // Fallback: clean up and format the category
                        return categoryValue
                          .replace(/_/g, ' ')
                          .toLowerCase()
                          .replace(/\b\w/g, l => l.toUpperCase());
                      } catch (e) {
                        // If parsing or translation fails, show raw value
                        return ticket.category || 'Sans catégorie';
                      }
                    })()}
                    color={getCategorySeverity(ticket.category)}
                    size="small"
                    variant={!ticket.category || ticket.category === '[]' || ticket.category === '' ? 'outlined' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {ticket.gender === 'M' || ticket.gender === 'homme' ? <FaceIcon fontSize="small" /> : 
                     ticket.gender === 'F' || ticket.gender === 'femme' ? <WcIcon fontSize="small" /> : null}
                    {ticket.reporterFirstName || ticket.reporterLastName ? 
                      `${ticket.reporterFirstName || ''} ${ticket.reporterLastName || ''}`.trim() : 
                      '-'
                    }
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={ticket.isBeneficiary ? 'Bénéficiaire' : 'Non-bénéficiaire'}
                    color={ticket.isBeneficiary ? 'primary' : 'default'}
                    size="small"
                  />
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
                        // Try to get translation
                        const translated = intl.formatMessage({ id: `grievance.status.${ticket.status}` });
                        // If translation exists and is different from the key, return it
                        if (translated && translated !== `grievance.status.${ticket.status}`) {
                          return translated;
                        }
                      } catch (e) {
                        // If translation fails, continue to fallback
                      }
                      // Fallback: clean up the status string
                      let cleanStatus = ticket.status;
                      if (cleanStatus.startsWith('[') && cleanStatus.endsWith(']')) {
                        cleanStatus = cleanStatus.slice(1, -1);
                      }
                      if (cleanStatus.startsWith('"') && cleanStatus.endsWith('"')) {
                        cleanStatus = cleanStatus.slice(1, -1);
                      }
                      // Replace underscores with spaces and capitalize
                      return cleanStatus
                        .replace(/_/g, ' ')
                        .toLowerCase()
                        .replace(/\b\w/g, l => l.toUpperCase());
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
    );
  };

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
            <Tooltip title="Actualiser les données">
              <IconButton 
                className={classes.refreshButton}
                onClick={loadData}
                disabled={isLoading}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </div>

          {/* Alert for sensitive cases */}
          {stats.sensitive > 0 && (
            <Box className={classes.sensitiveAlert}>
              <WarningIcon color="error" />
              <Typography variant="body2">
                <strong>{stats.sensitive} cas sensibles</strong> nécessitent une attention immédiate
              </Typography>
            </Box>
          )}

          {/* Filters */}
          <Paper className={classes.filterContainer}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl variant="outlined" fullWidth size="small">
                  <InputLabel id="status-label">Statut</InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    label="Statut"
                  >
                    <MenuItem value="">
                      <em>Tous les statuts</em>
                    </MenuItem>
                    <MenuItem value="PENDING">En attente</MenuItem>
                    <MenuItem value="IN_PROGRESS">En cours</MenuItem>
                    <MenuItem value="RESOLVED">Résolu</MenuItem>
                    <MenuItem value="CLOSED">Fermé</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl variant="outlined" fullWidth size="small">
                  <InputLabel id="category-label">Catégorie</InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    label="Catégorie"
                  >
                    <MenuItem value="">
                      <em>Toutes les catégories</em>
                    </MenuItem>
                    <MenuItem value="cas_sensibles">Cas Sensibles</MenuItem>
                    <MenuItem value="cas_speciaux">Cas Spéciaux</MenuItem>
                    <MenuItem value="cas_non_sensibles">Cas Non-Sensibles</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl variant="outlined" fullWidth size="small">
                  <InputLabel id="channel-label">Canal</InputLabel>
                  <Select
                    labelId="channel-label"
                    name="channel"
                    value={filters.channel}
                    onChange={handleFilterChange}
                    label="Canal"
                  >
                    <MenuItem value="">
                      <em>Tous les canaux</em>
                    </MenuItem>
                    <MenuItem value="telephone">Téléphone</MenuItem>
                    <MenuItem value="sms">SMS</MenuItem>
                    <MenuItem value="en_personne">En personne</MenuItem>
                    <MenuItem value="courrier_electronique">Email</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Date début"
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Date fin"
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={12} md={2}>
                <Button 
                  variant="outlined" 
                  onClick={handleResetFilters}
                  fullWidth
                >
                  Réinitialiser
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Summary Card */}
          <Fade in={!isLoading}>
            <Paper className={classes.summaryCard}>
              <div className={classes.summaryGrid}>
                <div className={classes.summaryItem}>
                  <Typography className={classes.summaryValue}>
                    {data.totalCount || stats.total}
                  </Typography>
                  <Typography className={classes.summaryLabel}>
                    Total des Plaintes
                  </Typography>
                </div>
                <div className={classes.summaryItem}>
                  <Typography className={classes.summaryValue}>
                    {stats.pending}
                  </Typography>
                  <Typography className={classes.summaryLabel}>
                    En Attente
                  </Typography>
                </div>
                <div className={classes.summaryItem}>
                  <Typography className={classes.summaryValue}>
                    {Math.round((stats.resolved / stats.total) * 100) || 0}%
                  </Typography>
                  <Typography className={classes.summaryLabel}>
                    Taux de Résolution
                  </Typography>
                </div>
                <div className={classes.summaryItem}>
                  <Typography className={classes.summaryValue}>
                    {stats.avgResolutionDays}j
                  </Typography>
                  <Typography className={classes.summaryLabel}>
                    Temps Moyen de Résolution
                  </Typography>
                </div>
              </div>
            </Paper>
          </Fade>

          {/* Statistics Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card className={classes.statsCard}>
                <CardContent>
                  <div className={classes.statsCardHeader}>
                    <Typography className={classes.statsCardTitle}>
                      Cas Sensibles
                    </Typography>
                    <Avatar style={{ backgroundColor: '#ff5c75' }}>
                      <WarningIcon />
                    </Avatar>
                  </div>
                  <Typography className={classes.statsCardValue}>
                    {stats.casSensibles}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Violence, corruption, discrimination
                  </Typography>
                  <Box mt={2}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats.casSensibles / stats.total) * 100 || 0}
                      style={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card className={classes.statsCard}>
                <CardContent>
                  <div className={classes.statsCardHeader}>
                    <Typography className={classes.statsCardTitle}>
                      Cas Spéciaux
                    </Typography>
                    <Avatar style={{ backgroundColor: '#ffb800' }}>
                      <InfoIcon />
                    </Avatar>
                  </div>
                  <Typography className={classes.statsCardValue}>
                    {stats.casSpeciaux}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Erreurs d'inclusion/exclusion
                  </Typography>
                  <Box mt={2}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats.casSpeciaux / stats.total) * 100 || 0}
                      style={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card className={classes.statsCard}>
                <CardContent>
                  <div className={classes.statsCardHeader}>
                    <Typography className={classes.statsCardTitle}>
                      Cas Non-Sensibles
                    </Typography>
                    <Avatar style={{ backgroundColor: '#00d0bd' }}>
                      <AssessmentIcon />
                    </Avatar>
                  </div>
                  <Typography className={classes.statsCardValue}>
                    {stats.casNonSensibles}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Paiements, téléphone, assistance
                  </Typography>
                  <Box mt={2}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats.casNonSensibles / stats.total) * 100 || 0}
                      style={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts */}
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
                      labels: chartData.statusDistribution.labels,
                      colors: ['#ffb800', '#ff8f00', '#00d0bd', '#6c757d'],
                      legend: { position: 'bottom' },
                      dataLabels: { enabled: true },
                    }}
                    series={chartData.statusDistribution.series}
                    type="donut"
                    height="100%"
                  />
                </div>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper style={{ padding: 24 }}>
                <Typography variant="h6" gutterBottom>
                  Plaintes par Canal
                </Typography>
                <div className={classes.chartContainer}>
                  <ReactApexChart
                    options={{
                      chart: { type: 'pie' },
                      labels: chartData.channelDistribution.labels,
                      colors: ['#5a8dee', '#ff5c75', '#00d0bd', '#ffb800'],
                      legend: { position: 'bottom' },
                    }}
                    series={chartData.channelDistribution.series}
                    type="pie"
                    height="100%"
                  />
                </div>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper style={{ padding: 24 }}>
                <Typography variant="h6" gutterBottom>
                  Plaintes par Catégorie
                </Typography>
                <div className={classes.chartContainer}>
                  <ReactApexChart
                    options={{
                      chart: { type: 'bar' },
                      xaxis: { categories: chartData.categoryDistribution.categories },
                      colors: ['#ff5c75'],
                      plotOptions: {
                        bar: {
                          borderRadius: 4,
                          horizontal: true,
                        }
                      },
                    }}
                    series={chartData.categoryDistribution.series}
                    type="bar"
                    height="100%"
                  />
                </div>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper style={{ padding: 24 }}>
                <Typography variant="h6" gutterBottom>
                  Évolution Mensuelle
                </Typography>
                <div className={classes.chartContainer}>
                  <ReactApexChart
                    options={{
                      chart: { type: 'area' },
                      xaxis: { categories: chartData.monthlyData.categories },
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
                    series={chartData.monthlyData.series}
                    type="area"
                    height="100%"
                  />
                </div>
              </Paper>
            </Grid>
          </Grid>

          {/* Recent Grievances Table */}
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
          </Box>

          <Paper>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab 
                label={
                  <Badge badgeContent={stats.total} color="primary">
                    Tous les Plaintes
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={stats.sensitive} color="error">
                    Cas Sensibles
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={stats.pending} color="warning">
                    En Attente
                  </Badge>
                } 
              />
            </Tabs>
            
            <Box p={3}>
              {renderGrievancesTable()}
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
        </Container>
      </div>
    </ThemeProvider>
  );
}

// Add missing import
import { TextField } from '@material-ui/core';

const mapStateToProps = () => ({});
const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(GrievanceDashboard);