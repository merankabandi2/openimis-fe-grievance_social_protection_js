import React, { useState, useEffect } from 'react';
import {
  Drawer,
  IconButton,
  Typography,
  Box,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Collapse,
  TextField,
  Button,
  Badge,
  Fab,
  Zoom,
  Paper,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Slider,
  Grid,
  Tooltip,
  alpha,
  Radio,
  RadioGroup,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  FilterList,
  Close,
  ExpandMore,
  LocationOn,
  Category,
  ContactPhone,
  CalendarToday,
  Clear,
  Search,
  Refresh,
  CheckCircle,
  RadioButtonUnchecked,
  Flag,
  PriorityHigh,
  Assignment,
  Warning,
  Person,
  Timer,
} from '@material-ui/icons';
import { Autocomplete } from '@material-ui/lab';
import { PublishedComponent, formatMessage } from '@openimis/fe-core';
import { useIntl, FormattedMessage } from 'react-intl';
import CascadingCategoryPicker from '../../pickers/CascadingCategoryPicker';
import MultiChannelPicker from '../../pickers/MultiChannelPicker';

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: 420,
    flexShrink: 0,
  },
  drawerPaper: {
    width: 420,
    background: theme.palette.background.default,
    borderLeft: 'none',
    boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.08)',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2, 2, 2, 3),
    background: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  filterContent: {
    padding: theme.spacing(2),
    paddingBottom: theme.spacing(10), // Space for action buttons
  },
  filterFab: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: 1200,
  },
  filterChips: {
    position: 'fixed',
    top: theme.spacing(9),
    left: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: 1100,
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    padding: theme.spacing(1.5),
    background: alpha(theme.palette.background.paper, 0.95),
    backdropFilter: 'blur(10px)',
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
    maxWidth: 'calc(100vw - 32px)',
    overflowX: 'auto',
    '&::-webkit-scrollbar': {
      height: 4,
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.divider,
      borderRadius: 2,
    },
  },
  chip: {
    borderRadius: theme.shape.borderRadius * 2,
    fontWeight: 500,
    '& .MuiChip-deleteIcon': {
      fontSize: 18,
    },
  },
  accordion: {
    background: theme.palette.background.paper,
    boxShadow: 'none',
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(1.5),
    '&:before': {
      display: 'none',
    },
    '&.Mui-expanded': {
      margin: `0 0 ${theme.spacing(1.5)}px 0`,
    },
  },
  accordionSummary: {
    minHeight: 56,
    '&.Mui-expanded': {
      minHeight: 56,
    },
    '& .MuiAccordionSummary-content': {
      margin: `${theme.spacing(1.5)}px 0`,
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
  },
  accordionDetails: {
    padding: theme.spacing(0, 2, 2),
  },
  sectionIcon: {
    color: theme.palette.primary.main,
  },
  filterCount: {
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontSize: '0.75rem',
    fontWeight: 600,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  statusOption: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(0.5, 0),
  },
  priorityOption: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.08),
    },
  },
  prioritySelected: {
    background: alpha(theme.palette.primary.main, 0.12),
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.16),
    },
  },
  dateContainer: {
    display: 'flex',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  actionButtons: {
    position: 'fixed',
    bottom: 0,
    right: 0,
    width: 420,
    padding: theme.spacing(2),
    background: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    gap: theme.spacing(2),
  },
  applyButton: {
    borderRadius: theme.shape.borderRadius * 2,
    textTransform: 'none',
    fontWeight: 600,
  },
  clearButton: {
    borderRadius: theme.shape.borderRadius * 2,
    textTransform: 'none',
  },
  sensitiveChip: {
    background: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  },
}));

const STATUS_OPTIONS = [
  { value: 'RECEIVED', label: 'Received', color: 'default' },
  { value: 'OPEN', label: 'Open', color: 'info' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'warning' },
  { value: 'RESOLVED', label: 'Resolved', color: 'success' },
  { value: 'CLOSED', label: 'Closed', color: 'default' },
];

const PRIORITY_OPTIONS = [
  { value: 'URGENT', label: 'Urgent', color: '#f44336', icon: '🔴' },
  { value: 'HIGH', label: 'High', color: '#ff9800', icon: '🟠' },
  { value: 'MEDIUM', label: 'Medium', color: '#2196f3', icon: '🔵' },
  { value: 'LOW', label: 'Low', color: '#4caf50', icon: '🟢' },
];

const ModernGrievanceFilters = ({ 
  onFiltersChange, 
  filterOptions = {}, 
  defaultFilters = {},
  module = "grievanceSocialProtection"
}) => {
  const classes = useStyles();
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState(() => {
    const initialFilters = {
      status: [],
      categories: [],
      channels: [],
      priority: [],
      dateRange: { start: null, end: null },
      flags: [],
      isSensitive: null,
      isAnonymous: null,
      assignedToMe: false,
      provinces: [],
      communes: [],
    };
    
    // Merge with defaultFilters, ensuring arrays remain arrays
    return Object.keys(initialFilters).reduce((acc, key) => {
      if (defaultFilters && defaultFilters[key] !== undefined) {
        // Ensure arrays stay as arrays
        if (Array.isArray(initialFilters[key]) && !Array.isArray(defaultFilters[key])) {
          acc[key] = defaultFilters[key] ? [defaultFilters[key]] : [];
        } else {
          acc[key] = defaultFilters[key];
        }
      } else {
        acc[key] = initialFilters[key];
      }
      return acc;
    }, {});
  });
  const [expandedSections, setExpandedSections] = useState({
    status: true,
    category: false,
    channel: false,
    priority: false,
    location: false,
    temporal: false,
    flags: false,
  });

  // Calculate active filter count
  const activeFilterCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (value === null || value === undefined) return count;
    if (Array.isArray(value) && value.length > 0) return count + value.length;
    if (typeof value === 'object' && value !== null && !Array.isArray(value) && (value.start || value.end)) return count + 1;
    if (typeof value === 'boolean' && value) return count + 1;
    if (value !== false && value !== '' && !Array.isArray(value) && typeof value !== 'object') return count + 1;
    return count;
  }, 0);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(filters);
    setOpen(false);
  };

  const handleClearAll = () => {
    const clearedFilters = {
      status: [],
      categories: [],
      channels: [],
      priority: [],
      dateRange: { start: null, end: null },
      flags: [],
      isSensitive: null,
      isAnonymous: null,
      assignedToMe: false,
      provinces: [],
      communes: [],
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const handleRemoveFilter = (filterType, value) => {
    if (Array.isArray(filters[filterType])) {
      handleFilterChange(
        filterType,
        filters[filterType].filter(v => v !== value)
      );
    } else if (filterType === 'dateRange') {
      handleFilterChange(filterType, { start: null, end: null });
    } else {
      handleFilterChange(filterType, null);
    }
  };

  const renderFilterChips = () => {
    const chips = [];

    // Status chips
    if (Array.isArray(filters.status)) {
      filters.status.forEach(status => {
      const statusOption = STATUS_OPTIONS.find(s => s.value === status);
      chips.push(
        <Chip
          key={`status-${status}`}
          label={formatMessage(intl, module, `grievance.status.${status}`)}
          icon={<Assignment />}
          onDelete={() => handleRemoveFilter('status', status)}
          className={classes.chip}
          color={statusOption?.color || 'default'}
          variant="outlined"
        />
      );
    });
    }

    // Category chips
    if (Array.isArray(filters.categories)) {
      filters.categories.forEach(category => {
      chips.push(
        <Chip
          key={`category-${category}`}
          label={formatMessage(intl, module, `grievance.category.${category}`)}
          icon={<Category />}
          onDelete={() => handleRemoveFilter('categories', category)}
          className={classes.chip}
          color="primary"
          variant="outlined"
        />
      );
    });
    }

    // Channel chips
    if (Array.isArray(filters.channels)) {
      filters.channels.forEach(channel => {
      chips.push(
        <Chip
          key={`channel-${channel}`}
          label={formatMessage(intl, module, `grievance.channel.${channel}`)}
          icon={<ContactPhone />}
          onDelete={() => handleRemoveFilter('channels', channel)}
          className={classes.chip}
          color="secondary"
          variant="outlined"
        />
      );
    });
    }

    // Priority chips
    if (Array.isArray(filters.priority)) {
      filters.priority.forEach(priority => {
      const priorityOption = PRIORITY_OPTIONS.find(p => p.value === priority);
      chips.push(
        <Chip
          key={`priority-${priority}`}
          label={`${priorityOption?.icon} ${formatMessage(intl, module, `grievance.priority.${priority}`)}`}
          onDelete={() => handleRemoveFilter('priority', priority)}
          className={classes.chip}
          style={{ borderColor: priorityOption?.color }}
          variant="outlined"
        />
      );
    });
    }

    // Date range chip
    if (filters.dateRange && (filters.dateRange.start || filters.dateRange.end)) {
      const dateLabel = `${filters.dateRange.start?.toLocaleDateString() || '...'} - ${
        filters.dateRange.end?.toLocaleDateString() || '...'
      }`;
      chips.push(
        <Chip
          key="date-range"
          label={dateLabel}
          icon={<CalendarToday />}
          onDelete={() => handleRemoveFilter('dateRange')}
          className={classes.chip}
          variant="outlined"
        />
      );
    }

    // Sensitive cases chip
    if (filters.isSensitive) {
      chips.push(
        <Chip
          key="sensitive"
          label={formatMessage(intl, module, 'ticket.sensitive')}
          icon={<Warning />}
          onDelete={() => handleRemoveFilter('isSensitive')}
          className={`${classes.chip} ${classes.sensitiveChip}`}
        />
      );
    }

    // Anonymous chip
    if (filters.isAnonymous) {
      chips.push(
        <Chip
          key="anonymous"
          label={formatMessage(intl, module, 'ticket.anonymous')}
          icon={<Person />}
          onDelete={() => handleRemoveFilter('isAnonymous')}
          className={classes.chip}
          variant="outlined"
        />
      );
    }

    return chips;
  };

  return (
    <>
      {/* Filter FAB */}
      <Zoom in={!open}>
        <Fab
          color="primary"
          className={classes.filterFab}
          onClick={() => setOpen(true)}
        >
          <Badge badgeContent={activeFilterCount} color="secondary">
            <FilterList />
          </Badge>
        </Fab>
      </Zoom>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && !open && (
        <Paper className={classes.filterChips} elevation={0}>
          {renderFilterChips()}
          {activeFilterCount > 1 && (
            <Chip
              label={formatMessage(intl, module, 'filter.clearAll')}
              icon={<Clear />}
              onClick={handleClearAll}
              className={classes.chip}
              size="small"
            />
          )}
        </Paper>
      )}

      {/* Filter Drawer */}
      <Drawer
        className={classes.drawer}
        variant="temporary"
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <Typography variant="h6" style={{ flex: 1 }}>
            {formatMessage(intl, module, 'filter.title')}
          </Typography>
          {activeFilterCount > 0 && (
            <Box className={classes.filterCount}>{activeFilterCount}</Box>
          )}
          <IconButton onClick={() => setOpen(false)} size="small">
            <Close />
          </IconButton>
        </div>

        <div className={classes.filterContent}>
          {/* Status Filter */}
          <Accordion
            expanded={expandedSections.status}
            onChange={() => setExpandedSections(prev => ({ ...prev, status: !prev.status }))}
            className={classes.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              className={classes.accordionSummary}
            >
              <Assignment className={classes.sectionIcon} />
              <Typography>
                {formatMessage(intl, module, 'filter.status')}
              </Typography>
              {Array.isArray(filters.status) && filters.status.length > 0 && (
                <Box className={classes.filterCount}>
                  {filters.status.length}
                </Box>
              )}
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <FormGroup>
                {STATUS_OPTIONS.map(status => (
                  <FormControlLabel
                    key={status.value}
                    control={
                      <Checkbox
                        checked={Array.isArray(filters.status) && filters.status.includes(status.value)}
                        onChange={(e) => {
                          const currentStatus = Array.isArray(filters.status) ? filters.status : [];
                          if (e.target.checked) {
                            handleFilterChange('status', [...currentStatus, status.value]);
                          } else {
                            handleFilterChange('status', currentStatus.filter(s => s !== status.value));
                          }
                        }}
                        color="primary"
                      />
                    }
                    label={
                      <Box className={classes.statusOption}>
                        <Chip
                          size="small"
                          label={formatMessage(intl, module, `grievance.status.${status.value}`)}
                          color={status.color}
                        />
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>

          {/* Category Filter */}
          <Accordion
            expanded={expandedSections.category}
            onChange={() => setExpandedSections(prev => ({ ...prev, category: !prev.category }))}
            className={classes.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              className={classes.accordionSummary}
            >
              <Category className={classes.sectionIcon} />
              <Typography>
                {formatMessage(intl, module, 'filter.category')}
              </Typography>
              {Array.isArray(filters.categories) && filters.categories.length > 0 && (
                <Box className={classes.filterCount}>
                  {filters.categories.length}
                </Box>
              )}
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <CascadingCategoryPicker
                value={Array.isArray(filters.categories) ? filters.categories : []}
                onChange={(value) => handleFilterChange('categories', Array.isArray(value) ? value : [])}
                allowMultiple={true}
                maxSelections={10}
              />
            </AccordionDetails>
          </Accordion>

          {/* Channel Filter */}
          <Accordion
            expanded={expandedSections.channel}
            onChange={() => setExpandedSections(prev => ({ ...prev, channel: !prev.channel }))}
            className={classes.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              className={classes.accordionSummary}
            >
              <ContactPhone className={classes.sectionIcon} />
              <Typography>
                {formatMessage(intl, module, 'filter.channel')}
              </Typography>
              {Array.isArray(filters.channels) && filters.channels.length > 0 && (
                <Box className={classes.filterCount}>
                  {filters.channels.length}
                </Box>
              )}
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <MultiChannelPicker
                value={Array.isArray(filters.channels) ? filters.channels : []}
                onChange={(value) => handleFilterChange('channels', value)}
                multiple
                fullWidth
              />
            </AccordionDetails>
          </Accordion>

          {/* Priority Filter */}
          <Accordion
            expanded={expandedSections.priority}
            onChange={() => setExpandedSections(prev => ({ ...prev, priority: !prev.priority }))}
            className={classes.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              className={classes.accordionSummary}
            >
              <PriorityHigh className={classes.sectionIcon} />
              <Typography>
                {formatMessage(intl, module, 'filter.priority')}
              </Typography>
              {Array.isArray(filters.priority) && filters.priority.length > 0 && (
                <Box className={classes.filterCount}>
                  {filters.priority.length}
                </Box>
              )}
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Grid container spacing={1}>
                {PRIORITY_OPTIONS.map(priority => (
                  <Grid item xs={6} key={priority.value}>
                    <Box
                      className={`${classes.priorityOption} ${
                        Array.isArray(filters.priority) && filters.priority.includes(priority.value) ? classes.prioritySelected : ''
                      }`}
                      onClick={() => {
                        const currentPriority = Array.isArray(filters.priority) ? filters.priority : [];
                        if (currentPriority.includes(priority.value)) {
                          handleFilterChange('priority', currentPriority.filter(p => p !== priority.value));
                        } else {
                          handleFilterChange('priority', [...currentPriority, priority.value]);
                        }
                      }}
                      style={{
                        border: `2px solid ${
                          Array.isArray(filters.priority) && filters.priority.includes(priority.value) ? priority.color : 'transparent'
                        }`
                      }}
                    >
                      <Typography variant="h6">{priority.icon}</Typography>
                      <Typography>{formatMessage(intl, module, `grievance.priority.${priority.value}`)}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Temporal Filters */}
          <Accordion
            expanded={expandedSections.temporal}
            onChange={() => setExpandedSections(prev => ({ ...prev, temporal: !prev.temporal }))}
            className={classes.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              className={classes.accordionSummary}
            >
              <CalendarToday className={classes.sectionIcon} />
              <Typography>
                {formatMessage(intl, module, 'filter.dateRange')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <div className={classes.dateContainer}>
                <PublishedComponent
                  pubRef="core.DatePicker"
                  label={formatMessage(intl, module, 'filter.startDate')}
                  value={filters.dateRange?.start || null}
                  onChange={(date) => handleFilterChange('dateRange', { ...(filters.dateRange || {}), start: date })}
                />
                <PublishedComponent
                  pubRef="core.DatePicker"
                  label={formatMessage(intl, module, 'filter.endDate')}
                  value={filters.dateRange?.end || null}
                  onChange={(date) => handleFilterChange('dateRange', { ...(filters.dateRange || {}), end: date })}
                />
              </div>
            </AccordionDetails>
          </Accordion>

          {/* Flags Filter */}
          <Accordion
            expanded={expandedSections.flags}
            onChange={() => setExpandedSections(prev => ({ ...prev, flags: !prev.flags }))}
            className={classes.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              className={classes.accordionSummary}
            >
              <Flag className={classes.sectionIcon} />
              <Typography>
                {formatMessage(intl, module, 'filter.flags')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.isSensitive === true}
                      onChange={(e) => handleFilterChange('isSensitive', e.target.checked ? true : null)}
                      color="secondary"
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Warning color="error" />
                      <Typography>{formatMessage(intl, module, 'filter.sensitiveCases')}</Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.isAnonymous === true}
                      onChange={(e) => handleFilterChange('isAnonymous', e.target.checked ? true : null)}
                      color="primary"
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Person />
                      <Typography>{formatMessage(intl, module, 'filter.anonymousOnly')}</Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.assignedToMe}
                      onChange={(e) => handleFilterChange('assignedToMe', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Person color="primary" />
                      <Typography>{formatMessage(intl, module, 'filter.assignedToMe')}</Typography>
                    </Box>
                  }
                />
              </FormGroup>
            </AccordionDetails>
          </Accordion>
        </div>

        {/* Action Buttons */}
        <div className={classes.actionButtons}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleClearAll}
            className={classes.clearButton}
            disabled={activeFilterCount === 0}
          >
            {formatMessage(intl, module, 'filter.clear')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleApplyFilters}
            className={classes.applyButton}
          >
            {formatMessage(intl, module, 'filter.apply')}
          </Button>
        </div>
      </Drawer>
    </>
  );
};

export default ModernGrievanceFilters;