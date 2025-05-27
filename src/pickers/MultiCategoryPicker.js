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
    // Convert array to space-separated string
    const stringValue = Array.isArray(newValue) ? newValue.join(' ') : newValue;
    onChange(stringValue, stringValue);
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