import React, { useState } from 'react';
import { useTranslations, Autocomplete, useGraphqlQuery } from '@openimis/fe-core';

function MultiCategoryPicker(props) {
  const {
    onChange,
    readOnly,
    required,
    withLabel = true,
    withPlaceholder,
    value,
    label,
    filterOptions,
    filterSelectedOptions,
    placeholder,
  } = props;
  const [searchString, setSearchString] = useState(null);
  const { formatMessage } = useTranslations('grievanceSocialProtection', 'ticket');

  const { isLoading, data, error } = useGraphqlQuery(
    `query CategoryPicker {
        grievanceConfig{
          grievanceTypes
        }
    }`,
    { searchString, first: 20 },
    { skip: true },
  );

  // Parse value if it's a space-separated string
  const parseValue = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      // Check if it's JSON array format
      if (val.startsWith('[')) {
        try {
          return JSON.parse(val);
        } catch (e) {
          return val.split(' ').filter(v => v);
        }
      }
      return val.split(' ').filter(v => v);
    }
    return [];
  };

  const handleChange = (newValue) => {
    // Pass the array directly to the parent component
    onChange(Array.isArray(newValue) ? newValue : []);
  };

  return (
    <Autocomplete
      multiple
      required={required}
      placeholder={placeholder ?? formatMessage('CategoryPicker.placeholder')}
      label={label ?? formatMessage('CategoryPicker.label')}
      error={error}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={data?.grievanceConfig?.grievanceTypes ?? []}
      isLoading={isLoading}
      value={parseValue(value)}
      getOptionLabel={(option) => {
        try {
          // For hierarchical categories with pipe separators, try to translate the full path first
          if (typeof option === 'string' && option.includes('|')) {
            // First try to translate the full hierarchical path
            const fullPathTranslated = formatMessage(`grievance.category.${option}`);
            if (fullPathTranslated !== `grievance.category.${option}`) {
              return fullPathTranslated;
            }
            
            // If full path translation not found, build it from parts
            const parts = option.split('|').map(part => part.trim());
            const translatedParts = parts.map(part => {
              const translated = formatMessage(`grievance.category.${part}`);
              return translated !== `grievance.category.${part}` ? translated : part;
            });
            
            return translatedParts.join(' | ');
          }
          
          // For simple categories, translate directly
          const translated = formatMessage(`grievance.category.${option}`);
          return translated !== `grievance.category.${option}` ? translated : option;
        } catch (e) {
          return option;
        }
      }}
      onChange={(options) => handleChange(options)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
}

export default MultiCategoryPicker;