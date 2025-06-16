import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withTheme, withStyles } from '@material-ui/core/styles';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Chip,
  Box,
  CircularProgress,
} from '@material-ui/core';
import { formatMessage, withModulesManager } from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { fetchGrievanceConfiguration } from '../actions';

const styles = (theme) => ({
  formControl: {
    width: '100%',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(1),
  },
  chip: {
    margin: 2,
  },
  categoryGroup: {
    fontWeight: 600,
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
    paddingLeft: theme.spacing(1),
  },
  categoryItem: {
    paddingLeft: theme.spacing(4),
  },
  subcategoryItem: {
    paddingLeft: theme.spacing(6),
  },
  selectedPath: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
  },
  flagChip: {
    marginLeft: theme.spacing(1),
    height: 20,
  },
  highPriority: {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  },
  mediumPriority: {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
  },
  lowPriority: {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
  },
});

class DynamicHierarchicalCategoryPicker extends Component {
  state = {
    selectedCategories: [],
    expandedCategories: {},
  };

  componentDidMount() {
    const { fetchGrievanceConfiguration, fetchedGrievanceConfig } = this.props;
    if (!fetchedGrievanceConfig) {
      fetchGrievanceConfiguration();
    }
    this.parseInitialValue(this.props.value);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.parseInitialValue(this.props.value);
    }
  }

  parseInitialValue = (value) => {
    if (!value) {
      this.setState({ selectedCategories: [] });
      return;
    }
    
    // Handle space-separated values
    const categories = typeof value === 'string' ? value.split(' ').filter(Boolean) : [];
    this.setState({ selectedCategories: categories });
  };

  handleCategorySelect = (category, level = 0) => {
    const { onChange, grievanceConfig } = this.props;
    const { selectedCategories } = this.state;
    
    // Update selected categories up to this level
    const newSelectedCategories = [...selectedCategories.slice(0, level), category.fullName || category.name];
    
    // Check if category has default flag
    let flags = [];
    if (category.flag) {
      flags.push(category.flag);
    }
    
    this.setState({ selectedCategories: newSelectedCategories });
    
    // Notify parent component
    if (onChange) {
      const value = newSelectedCategories.join(' ');
      onChange(value, flags.join(' '));
    }
  };

  toggleCategoryExpansion = (categoryName) => {
    this.setState(prevState => ({
      expandedCategories: {
        ...prevState.expandedCategories,
        [categoryName]: !prevState.expandedCategories[categoryName]
      }
    }));
  };

  renderCategoryTree = (categories, level = 0) => {
    const { classes, readOnly } = this.props;
    const { selectedCategories, expandedCategories } = this.state;
    
    if (!categories || categories.length === 0) return null;
    
    return categories.map((category) => {
      const isSelected = selectedCategories[level] === (category.fullName || category.name);
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories[category.name];
      
      return (
        <React.Fragment key={category.name}>
          <MenuItem
            value={category.name}
            onClick={() => !readOnly && this.handleCategorySelect(category, level)}
            selected={isSelected}
            style={{ paddingLeft: 16 + (level * 24) }}
          >
            <Box display="flex" alignItems="center" width="100%">
              <span>{category.name}</span>
              {category.flag && (
                <Chip
                  label={category.flag}
                  size="small"
                  className={`${classes.flagChip} ${this.getPriorityClass(category.priority)}`}
                />
              )}
              {category.priority && (
                <Chip
                  label={category.priority}
                  size="small"
                  className={`${classes.flagChip} ${this.getPriorityClass(category.priority)}`}
                />
              )}
            </Box>
          </MenuItem>
          {hasChildren && isSelected && this.renderCategoryTree(category.children, level + 1)}
        </React.Fragment>
      );
    });
  };

  getPriorityClass = (priority) => {
    const { classes } = this.props;
    switch (priority?.toLowerCase()) {
      case 'critical':
      case 'high':
        return classes.highPriority;
      case 'medium':
        return classes.mediumPriority;
      case 'low':
        return classes.lowPriority;
      default:
        return '';
    }
  };

  getCategoryPath = () => {
    const { grievanceConfig } = this.props;
    const { selectedCategories } = this.state;
    
    if (!grievanceConfig?.grievanceCategories) return [];
    
    const path = [];
    let currentLevel = grievanceConfig.grievanceCategories;
    
    for (const selectedCat of selectedCategories) {
      const category = currentLevel.find(cat => 
        (cat.fullName || cat.name) === selectedCat
      );
      
      if (category) {
        path.push({
          name: category.name,
          flag: category.flag,
          priority: category.priority,
        });
        currentLevel = category.children || [];
      }
    }
    
    return path;
  };

  render() {
    const { classes, required, readOnly, label, intl, grievanceConfig, fetchingGrievanceConfig } = this.props;
    const { selectedCategories } = this.state;
    
    if (fetchingGrievanceConfig) {
      return <CircularProgress />;
    }
    
    const categoryPath = this.getCategoryPath();
    const categories = grievanceConfig?.grievanceCategoriesHierarchical || [];

    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl 
            className={classes.formControl} 
            required={required}
            disabled={readOnly}
          >
            <InputLabel>
              {label || formatMessage(intl, 'grievanceSocialProtection', 'ticket.category')}
            </InputLabel>
            <Select
              value={selectedCategories.join(' ')}
              displayEmpty
            >
              <MenuItem value="">
                <em>{formatMessage(intl, 'grievanceSocialProtection', 'ticket.selectCategory')}</em>
              </MenuItem>
              {this.renderCategoryTree(categories)}
            </Select>
          </FormControl>
        </Grid>

        {categoryPath.length > 0 && (
          <Grid item xs={12}>
            <Box className={classes.selectedPath}>
              <FormHelperText>
                {formatMessage(intl, 'grievanceSocialProtection', 'ticket.selectedCategory')}:
              </FormHelperText>
              <div className={classes.chips}>
                {categoryPath.map((item, index) => (
                  <React.Fragment key={index}>
                    <Chip
                      label={item.name}
                      size="small"
                      color={index === categoryPath.length - 1 ? 'primary' : 'default'}
                    />
                    {item.flag && (
                      <Chip
                        label={item.flag}
                        size="small"
                        className={`${classes.flagChip} ${this.getPriorityClass(item.priority)}`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </Box>
          </Grid>
        )}
      </Grid>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights || [],
  grievanceConfig: state.grievanceSocialProtection?.grievanceConfig,
  fetchingGrievanceConfig: state.grievanceSocialProtection?.fetchingGrievanceConfig,
  fetchedGrievanceConfig: state.grievanceSocialProtection?.fetchedGrievanceConfig,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchGrievanceConfiguration,
}, dispatch);

export default withModulesManager(
  withTheme(
    withStyles(styles)(
      connect(mapStateToProps, mapDispatchToProps)(
        injectIntl(DynamicHierarchicalCategoryPicker)
      )
    )
  )
);