import React, { useState, useMemo, useEffect } from 'react';
import { useTranslations, useGraphqlQuery } from '@openimis/fe-core';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Box,
  Typography,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Fade,
  Collapse
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  Delete,
  Add,
  ExpandMore,
  ExpandLess,
  Category,
  Clear
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  selectContainer: {
    marginBottom: theme.spacing(2),
  },
  selectedCategories: {
    marginTop: theme.spacing(2),
  },
  categoryChip: {
    margin: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius * 2,
  },
  categoryPaper: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(1),
    background: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
  },
  categoryPath: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    background: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
  stepArrow: {
    color: theme.palette.text.secondary,
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    cursor: 'pointer',
    borderRadius: theme.shape.borderRadius,
    border: `1px dashed ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
    '&:hover': {
      background: theme.palette.primary.main + '08',
    },
  },
  levelSelect: {
    marginBottom: theme.spacing(1),
  },
  emptyState: {
    padding: theme.spacing(3),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  categoryLevel: {
    fontWeight: 600,
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
  },
  expandIcon: {
    transition: 'transform 0.3s ease',
  },
  expandIconOpen: {
    transform: 'rotate(180deg)',
  },
}));

function CascadingCategoryPicker({ 
  value = [], 
  onChange, 
  readOnly = false, 
  required = false,
  label,
  placeholder,
  allowMultiple = true,
  maxSelections = 5,
  showSelectedPath = true
}) {
  const classes = useStyles();
  const { formatMessage } = useTranslations('grievanceSocialProtection', 'ticket');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [currentSelection, setCurrentSelection] = useState({
    level1: '',
    level2: '',
    level3: ''
  });

  const { isLoading, data, error } = useGraphqlQuery(
    `query CategoryPicker {
        grievanceConfig{
          grievanceCategoriesHierarchical {
            name
            fullName
            priority
            permissions
            defaultFlags
            children {
              name
              fullName
              priority
              permissions
              defaultFlags
              children {
                name
                fullName
                priority
                permissions
                defaultFlags
              }
            }
          }
          accessibleCategories
        }
    }`,
    {},
    { skip: false }
  );

  // Use the hierarchical structure from GraphQL
  const categoryHierarchy = useMemo(() => {
    const categories = data?.grievanceConfig?.grievanceCategoriesHierarchical ?? [];
    const accessibleCategories = data?.grievanceConfig?.accessibleCategories ?? [];
    const hierarchy = {};
    
    categories.forEach(category => {
      // Check if category is accessible based on accessibleCategories list
      const isAccessible = accessibleCategories.includes(category.name);
      if (isAccessible) {
        hierarchy[category.name] = {
          ...category,
          children: {}
        };
        
        if (category.children) {
          category.children.forEach(child => {
            const isChildAccessible = accessibleCategories.includes(child.name);
            if (isChildAccessible) {
              hierarchy[category.name].children[child.name] = {
                ...child,
                children: {}
              };
              
              if (child.children) {
                child.children.forEach(grandchild => {
                  const isGrandchildAccessible = accessibleCategories.includes(grandchild.name);
                  if (isGrandchildAccessible) {
                    hierarchy[category.name].children[child.name].children[grandchild.name] = grandchild;
                  }
                });
              }
            }
          });
        }
      }
    });
    
    return hierarchy;
  }, [data]);

  // Get available options for each level
  const level1Options = Object.keys(categoryHierarchy);
  const level2Options = currentSelection.level1 ? 
    Object.keys(categoryHierarchy[currentSelection.level1]?.children || {}) : [];
  const level3Options = currentSelection.level1 && currentSelection.level2 ? 
    Object.keys(categoryHierarchy[currentSelection.level1].children[currentSelection.level2]?.children || {}) : [];

  // Ensure value is always an array
  const selectedCategories = useMemo(() => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value.split(' ').filter(v => v.trim());
    }
    return [];
  }, [value]);

  // Debug: log the add button visibility condition
  const canShowAddButton = !readOnly && (allowMultiple ? selectedCategories.length < maxSelections : selectedCategories.length === 0) && !isAddingCategory;
  console.log('CascadingCategoryPicker Debug:', {
    readOnly,
    allowMultiple,
    selectedCategoriesLength: selectedCategories.length,
    maxSelections,
    isAddingCategory,
    canShowAddButton
  });

  // Reset lower levels when higher level changes
  const handleLevelChange = (level, selectedValue) => {
    const newSelection = { ...currentSelection };
    
    if (level === 'level1') {
      newSelection.level1 = selectedValue;
      newSelection.level2 = '';
      newSelection.level3 = '';
    } else if (level === 'level2') {
      newSelection.level2 = selectedValue;
      newSelection.level3 = '';
    } else {
      newSelection.level3 = selectedValue;
    }
    
    setCurrentSelection(newSelection);
  };

  // Build the full category path
  const buildCategoryPath = (selection = currentSelection) => {
    const parts = [];
    if (selection.level1) parts.push(selection.level1);
    if (selection.level2) parts.push(selection.level2);
    if (selection.level3) parts.push(selection.level3);
    return parts.join('|');
  };

  // Add selected category to the list
  const handleAddCategory = () => {
    const categoryPath = buildCategoryPath();
    if (!categoryPath || selectedCategories.includes(categoryPath)) return;
    
    if (!allowMultiple) {
      onChange([categoryPath]);
    } else if (selectedCategories.length < maxSelections) {
      onChange([...selectedCategories, categoryPath]);
    }
    
    // Reset selection
    setCurrentSelection({ level1: '', level2: '', level3: '' });
    setIsAddingCategory(false);
  };

  // Remove category from the list
  const handleRemoveCategory = (categoryToRemove) => {
    onChange(selectedCategories.filter(cat => cat !== categoryToRemove));
  };

  // Clear all selections
  const handleClearAll = () => {
    onChange([]);
    setCurrentSelection({ level1: '', level2: '', level3: '' });
    setIsAddingCategory(false);
  };

  // Translate category name
  const translateCategory = (categoryPath) => {
    const translated = formatMessage(`grievance.category.${categoryPath}`);
    return translated !== `grievance.category.${categoryPath}` ? translated : categoryPath;
  };

  // Get translated label for individual parts
  const getPartLabel = (part) => {
    const translated = formatMessage(`grievance.category.${part}`);
    return translated !== `grievance.category.${part}` ? translated : part;
  };

  // Check if current selection is valid for adding
  const canAddCurrentSelection = () => {
    const path = buildCategoryPath();
    return path && !selectedCategories.includes(path) && 
           (allowMultiple ? selectedCategories.length < maxSelections : selectedCategories.length === 0);
  };

  if (isLoading) {
    return (
      <Box className={classes.emptyState}>
        <Typography>Loading categories...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={classes.emptyState}>
        <Typography color="error">Error loading categories</Typography>
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      {/* Selected Categories Display */}
      {selectedCategories.length > 0 && (
        <Paper className={classes.categoryPaper} elevation={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2" className={classes.categoryLevel}>
              {allowMultiple 
                ? `Selected Categories (${selectedCategories.length}/${maxSelections})`
                : 'Selected Category'
              }
            </Typography>
            <IconButton size="small" onClick={handleClearAll} disabled={readOnly}>
              <Clear />
            </IconButton>
          </Box>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {selectedCategories.map((category, index) => {
              const translatedLabel = translateCategory(category);
              return (
                <Chip
                  key={`${category}-${index}`}
                  label={translatedLabel}
                  onDelete={readOnly ? undefined : () => handleRemoveCategory(category)}
                  className={classes.categoryChip}
                  color="primary"
                  variant="outlined"
                  icon={<Category />}
                />
              );
            })}
          </Box>
        </Paper>
      )}

      {/* Add Category Button */}
      {!readOnly && (allowMultiple ? selectedCategories.length < maxSelections : selectedCategories.length === 0) && !isAddingCategory && (
        <Box 
          className={classes.addButton}
          onClick={() => setIsAddingCategory(true)}
        >
          <Add />
          <Typography>
            {selectedCategories.length === 0 ? formatMessage('cascading.addCategory') : formatMessage('cascading.addAnother')}
          </Typography>
        </Box>
      )}

      {/* Category Selection Interface */}
      <Collapse in={isAddingCategory} timeout={300}>
        <Paper className={classes.categoryPaper} elevation={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle2" className={classes.categoryLevel}>
              Select Category
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => {
                setIsAddingCategory(false);
                setCurrentSelection({ level1: '', level2: '', level3: '' });
              }}
            >
              <Clear />
            </IconButton>
          </Box>

          <Grid container spacing={2}>
            {/* Level 1 - Main Category */}
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" className={classes.levelSelect}>
                <InputLabel>{formatMessage('cascading.mainCategory')}</InputLabel>
                <Select
                  value={currentSelection.level1}
                  onChange={(e) => handleLevelChange('level1', e.target.value)}
                  label={formatMessage('cascading.mainCategory')}
                  disabled={readOnly}
                >
                  <MenuItem value="">
                    <em>{formatMessage('cascading.selectMainCategory')}</em>
                  </MenuItem>
                  {level1Options.map(option => (
                    <MenuItem key={option} value={option}>
                      {getPartLabel(option)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Level 2 - Subcategory */}
            {currentSelection.level1 && level2Options.length > 0 && (
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined" className={classes.levelSelect}>
                  <InputLabel>{formatMessage('cascading.subcategory')}</InputLabel>
                  <Select
                    value={currentSelection.level2}
                    onChange={(e) => handleLevelChange('level2', e.target.value)}
                    label={formatMessage('cascading.subcategory')}
                    disabled={readOnly}
                  >
                    <MenuItem value="">
                      <em>{formatMessage('cascading.selectSubcategory')}</em>
                    </MenuItem>
                    {level2Options.map(option => (
                      <MenuItem key={option} value={option}>
                        {getPartLabel(option)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Level 3 - Details */}
            {currentSelection.level1 && currentSelection.level2 && level3Options.length > 0 && (
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined" className={classes.levelSelect}>
                  <InputLabel>{formatMessage('cascading.details')}</InputLabel>
                  <Select
                    value={currentSelection.level3}
                    onChange={(e) => handleLevelChange('level3', e.target.value)}
                    label={formatMessage('cascading.details')}
                    disabled={readOnly}
                  >
                    <MenuItem value="">
                      <em>{formatMessage('cascading.selectDetails')}</em>
                    </MenuItem>
                    {level3Options.map(option => (
                      <MenuItem key={option} value={option}>
                        {getPartLabel(option)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Current Selection Path */}
            {currentSelection.level1 && (
              <Grid item xs={12}>
                <Box className={classes.categoryPath}>
                  <Typography variant="caption" color="textSecondary">
                    {formatMessage('cascading.selected')}:
                  </Typography>
                  <Typography variant="body2" style={{ flex: 1 }}>
                    {translateCategory(buildCategoryPath())}
                  </Typography>
                  {canAddCurrentSelection() && (
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={handleAddCategory}
                      disabled={!currentSelection.level1}
                    >
                      <Add />
                    </IconButton>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Collapse>
    </Box>
  );
}

export default CascadingCategoryPicker;