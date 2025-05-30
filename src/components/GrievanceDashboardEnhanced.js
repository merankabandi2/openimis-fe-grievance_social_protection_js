import React, { useState, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useIntl, FormattedMessage } from 'react-intl';
import {
  Grid,
  Box,
  Typography,
  Fade,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  Badge,
  useTheme,
} from '@material-ui/core';
import {
  Assignment,
  CheckCircle,
  Schedule,
  Warning,
  People,
  TrendingUp,
  ReportProblem,
  Phone,
  Email,
  Sms,
  Person,
} from '@material-ui/icons';
import ReactApexChart from 'react-apexcharts';
import {
  useModulesManager,
  useGraphqlQuery,
  formatMessage,
  PublishedComponent,
} from '@openimis/fe-core';
import BaseDashboard, { StatCard, ChartContainer } from '@openimis/fe-social_protection/src/components./BaseDashboard';
import UnifiedDashboardFilters from '@openimis/fe-social_protection/src/components/dashboard/UnifiedDashboardFilters';
import { fetchTicketDashboard } from '../actions';
import { MODULE_NAME } from '../constants';

// GraphQL Queries
const GRIEVANCE_DASHBOARD_QUERY = `
  query GrievanceDashboard($filters: String) {
    ticketDashboard(filters: $filters) {
      summary {
        total
        received
        open
        inProgress
        resolved
        closed
        sensitiveCount
        anonymousCount
        avgResolutionTime
        changeFromLastMonth
      }
      statusDistribution {
        status
        count
        percentage
      }
      categoryDistribution {
        category
        count
        trend
      }
      channelDistribution {
        channel
        count
        percentage
      }
      monthlyTrends {
        month
        received
        resolved
        pending
      }
      genderDistribution {
        gender
        count
      }
    }
  }
`;

const GrievanceDashboardEnhanced = ({ rights }) => {
  const theme = useTheme();
  const intl = useIntl();
  const modulesManager = useModulesManager();
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    status: [],
    categories: [],
    channels: [],
    priority: [],
    dateRange: { start: null, end: null },
    isSensitive: null,
    isAnonymous: null,
  });

  // Filter configuration for UnifiedDashboardFilters
  const filterConfig = {
    status: {
      filterType: 'status',
      component: 'multiSelect',
      type: 'array',
      options: [
        { value: 'RECEIVED', labelKey: 'ticket.status.RECEIVED' },
        { value: 'OPEN', labelKey: 'ticket.status.OPEN' },
        { value: 'IN_PROGRESS', labelKey: 'ticket.status.IN_PROGRESS' },
        { value: 'RESOLVED', labelKey: 'ticket.status.RESOLVED' },
        { value: 'CLOSED', labelKey: 'ticket.status.CLOSED' },
      ],
    },
    categories: {
      filterType: 'category',
      component: 'custom',
      type: 'array',
      renderComponent: (value, onChange) => (
        <PublishedComponent
          pubRef="grievanceSocialProtection.MultiCategoryPicker"
          value={value}
          onChange={onChange}
          multiple
          fullWidth
        />
      ),
    },
    channels: {
      filterType: 'channel',
      component: 'custom',
      type: 'array',
      renderComponent: (value, onChange) => (
        <PublishedComponent
          pubRef="grievanceSocialProtection.MultiChannelPicker"
          value={value}
          onChange={onChange}
          multiple
          fullWidth
        />
      ),
    },
    priority: {
      filterType: 'priority',
      component: 'priority',
      type: 'array',
      options: [
        { value: 'URGENT', icon: '🔴', color: '#f44336', labelKey: 'ticket.priority.URGENT' },
        { value: 'HIGH', icon: '🟠', color: '#ff9800', labelKey: 'ticket.priority.HIGH' },
        { value: 'MEDIUM', icon: '🔵', color: '#2196f3', labelKey: 'ticket.priority.MEDIUM' },
        { value: 'LOW', icon: '🟢', color: '#4caf50', labelKey: 'ticket.priority.LOW' },
      ],
    },
    dateRange: {
      filterType: 'dateRange',
      component: 'dateRange',
      type: 'object',
      default: { start: null, end: null },
    },
    isSensitive: {
      filterType: 'boolean',
      component: 'boolean',
      type: 'boolean',
      chipColor: 'error',
    },
    isAnonymous: {
      filterType: 'boolean',
      component: 'boolean',
      type: 'boolean',
    },
  };

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
    if (filters.isSensitive === true) {
      filterParts.push(`isSensitive: true`);
    }
    if (filters.isAnonymous === true) {
      filterParts.push(`isAnonymous: true`);
    }

    // Apply tab filters
    if (tabValue === 1) { // Sensitive tab
      filterParts.push(`isSensitive: true`);
    } else if (tabValue === 2) { // Pending tab
      filterParts.push(`status_In: ["RECEIVED", "OPEN", "IN_PROGRESS"]`);
    }

    return filterParts.join(', ');
  }, [filters, tabValue]);

  // Fetch dashboard data
  const { data, loading, error, refetch } = useGraphqlQuery(
    GRIEVANCE_DASHBOARD_QUERY,
    { filters: filterString },
    {
      fetchPolicy: 'cache-and-network',
      pollInterval: 300000, // Refresh every 5 minutes
    }
  );

  const dashboardData = data?.ticketDashboard;
  const summary = dashboardData?.summary || {};

  // Chart options
  const getDonutChartOptions = (title) => ({
    chart: {
      type: 'donut',
      fontFamily: theme.typography.fontFamily,
    },
    title: {
      text: title,
      align: 'center',
      style: {
        fontSize: '16px',
        fontWeight: 600,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        return opts.w.config.series[opts.seriesIndex];
      },
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: formatMessage(intl, MODULE_NAME, 'dashboard.total'),
              fontSize: '16px',
              fontWeight: 600,
            },
          },
        },
      },
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 300
        },
        legend: {
          position: 'bottom'
        }
      }
    }],
  });

  const getAreaChartOptions = () => ({
    chart: {
      type: 'area',
      height: 350,
      fontFamily: theme.typography.fontFamily,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    xaxis: {
      categories: dashboardData?.monthlyTrends?.map(t => t.month) || [],
    },
    yaxis: {
      title: {
        text: formatMessage(intl, MODULE_NAME, 'dashboard.tickets'),
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100, 100, 100]
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " " + formatMessage(intl, MODULE_NAME, 'dashboard.tickets');
        },
      },
    },
  });

  // Handle export
  const handleExport = () => {
    const exportData = {
      summary,
      statusDistribution: dashboardData?.statusDistribution,
      categoryDistribution: dashboardData?.categoryDistribution,
      channelDistribution: dashboardData?.channelDistribution,
      monthlyTrends: dashboardData?.monthlyTrends,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grievance-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Status colors
  const statusColors = {
    RECEIVED: theme.palette.info.main,
    OPEN: theme.palette.info.light,
    IN_PROGRESS: theme.palette.warning.main,
    RESOLVED: theme.palette.success.main,
    CLOSED: theme.palette.grey[500],
  };

  // Channel icons
  const channelIcons = {
    phone: <Phone />,
    email: <Email />,
    sms: <Sms />,
    in_person: <Person />,
  };

  return (
    <BaseDashboard
      title={<FormattedMessage id="grievanceSocialProtection.dashboard.title" />}
      subtitle={<FormattedMessage id="grievanceSocialProtection.dashboard.subtitle" />}
      module={MODULE_NAME}
      loading={loading}
      error={error}
      onRefresh={refetch}
      onExport={handleExport}
      onPrint={handlePrint}
      filters={filters}
      onFiltersChange={setFilters}
      FilterComponent={UnifiedDashboardFilters}
      filterConfig={filterConfig}
      rights={rights}
      requiredRights={['160001', '160002']} // View rights
    >
      {/* Sensitive Cases Alert */}
      {summary.sensitiveCount > 0 && (
        <Fade in timeout={700}>
          <Alert
            severity="warning"
            icon={<Warning />}
            style={{ marginBottom: theme.spacing(3) }}
          >
            <AlertTitle>
              <FormattedMessage id="grievanceSocialProtection.dashboard.sensitiveCasesAlert" />
            </AlertTitle>
            <FormattedMessage
              id="grievanceSocialProtection.dashboard.sensitiveCasesCount"
              values={{ count: summary.sensitiveCount }}
            />
          </Alert>
        </Fade>
      )}

      {/* Tabs */}
      <Box marginBottom={3}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            label={<FormattedMessage id="grievanceSocialProtection.dashboard.allTickets" />}
          />
          <Tab
            label={
              <Badge badgeContent={summary.sensitiveCount} color="error">
                <FormattedMessage id="grievanceSocialProtection.dashboard.sensitiveTickets" />
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={summary.open + summary.inProgress + summary.received} color="primary">
                <FormattedMessage id="grievanceSocialProtection.dashboard.pendingTickets" />
              </Badge>
            }
          />
        </Tabs>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} style={{ marginBottom: theme.spacing(3) }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={Assignment}
            value={summary.total}
            label={formatMessage(intl, MODULE_NAME, 'dashboard.totalTickets')}
            change={summary.changeFromLastMonth}
            color={theme.palette.primary.main}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={Schedule}
            value={summary.open + summary.inProgress}
            label={formatMessage(intl, MODULE_NAME, 'dashboard.activeTickets')}
            color={theme.palette.warning.main}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={CheckCircle}
            value={summary.resolved}
            label={formatMessage(intl, MODULE_NAME, 'dashboard.resolvedTickets')}
            color={theme.palette.success.main}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={ReportProblem}
            value={summary.sensitiveCount}
            label={formatMessage(intl, MODULE_NAME, 'dashboard.sensitiveTickets')}
            color={theme.palette.error.main}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Status Distribution */}
        <Grid item xs={12} md={4}>
          <ChartContainer
            title={formatMessage(intl, MODULE_NAME, 'dashboard.statusDistribution')}
            loading={loading}
          >
            <ReactApexChart
              options={{
                ...getDonutChartOptions(formatMessage(intl, MODULE_NAME, 'dashboard.byStatus')),
                labels: dashboardData?.statusDistribution?.map(d =>
                  formatMessage(intl, MODULE_NAME, `ticket.status.${d.status}`)
                ) || [],
                colors: dashboardData?.statusDistribution?.map(d => statusColors[d.status]) || [],
              }}
              series={dashboardData?.statusDistribution?.map(d => d.count) || []}
              type="donut"
              height={350}
            />
          </ChartContainer>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={4}>
          <ChartContainer
            title={formatMessage(intl, MODULE_NAME, 'dashboard.categoryDistribution')}
            loading={loading}
          >
            <ReactApexChart
              options={{
                chart: {
                  type: 'bar',
                  fontFamily: theme.typography.fontFamily,
                },
                plotOptions: {
                  bar: {
                    horizontal: true,
                    dataLabels: {
                      position: 'top',
                    },
                  }
                },
                dataLabels: {
                  enabled: true,
                  offsetX: -6,
                  style: {
                    fontSize: '12px',
                    colors: ['#fff']
                  }
                },
                xaxis: {
                  categories: dashboardData?.categoryDistribution?.map(d =>
                    formatMessage(intl, MODULE_NAME, `ticket.category.${d.category}`)
                  ) || [],
                },
                colors: [theme.palette.primary.main],
              }}
              series={[{
                name: formatMessage(intl, MODULE_NAME, 'dashboard.tickets'),
                data: dashboardData?.categoryDistribution?.map(d => d.count) || []
              }]}
              type="bar"
              height={350}
            />
          </ChartContainer>
        </Grid>

        {/* Channel Distribution */}
        <Grid item xs={12} md={4}>
          <ChartContainer
            title={formatMessage(intl, MODULE_NAME, 'dashboard.channelDistribution')}
            loading={loading}
          >
            <ReactApexChart
              options={{
                ...getDonutChartOptions(formatMessage(intl, MODULE_NAME, 'dashboard.byChannel')),
                labels: dashboardData?.channelDistribution?.map(d =>
                  formatMessage(intl, MODULE_NAME, `ticket.channel.${d.channel}`)
                ) || [],
              }}
              series={dashboardData?.channelDistribution?.map(d => d.count) || []}
              type="donut"
              height={350}
            />
          </ChartContainer>
        </Grid>

        {/* Monthly Trends */}
        <Grid item xs={12}>
          <ChartContainer
            title={formatMessage(intl, MODULE_NAME, 'dashboard.monthlyTrends')}
            loading={loading}
          >
            <ReactApexChart
              options={getAreaChartOptions()}
              series={[
                {
                  name: formatMessage(intl, MODULE_NAME, 'dashboard.received'),
                  data: dashboardData?.monthlyTrends?.map(t => t.received) || []
                },
                {
                  name: formatMessage(intl, MODULE_NAME, 'dashboard.resolved'),
                  data: dashboardData?.monthlyTrends?.map(t => t.resolved) || []
                },
                {
                  name: formatMessage(intl, MODULE_NAME, 'dashboard.pending'),
                  data: dashboardData?.monthlyTrends?.map(t => t.pending) || []
                }
              ]}
              type="area"
              height={350}
            />
          </ChartContainer>
        </Grid>

        {/* Gender Distribution */}
        <Grid item xs={12} md={6}>
          <ChartContainer
            title={formatMessage(intl, MODULE_NAME, 'dashboard.genderDistribution')}
            loading={loading}
          >
            <ReactApexChart
              options={{
                chart: {
                  type: 'pie',
                  fontFamily: theme.typography.fontFamily,
                },
                labels: dashboardData?.genderDistribution?.map(d =>
                  formatMessage(intl, MODULE_NAME, `gender.${d.gender}`)
                ) || [],
                colors: ['#2196f3', '#e91e63', '#9e9e9e'],
                legend: {
                  position: 'bottom',
                },
              }}
              series={dashboardData?.genderDistribution?.map(d => d.count) || []}
              type="pie"
              height={350}
            />
          </ChartContainer>
        </Grid>
      </Grid>
    </BaseDashboard>
  );
};

const mapStateToProps = (state) => ({
  rights: state.core.user?.i_user?.rights || [],
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchTicketDashboard,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(GrievanceDashboardEnhanced);