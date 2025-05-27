import React, { useState } from 'react';
import { useTranslations, Autocomplete, useGraphqlQuery } from '@openimis/fe-core';

function MultiChannelPicker(props) {
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
    `query ChannelPicker {
        grievanceConfig{
          grievanceChannels
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
      placeholder={placeholder ?? formatMessage('ChannelPicker.placeholder')}
      label={label ?? formatMessage('ChannelPicker.label')}
      error={error}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={data?.grievanceConfig?.grievanceChannels ?? []}
      isLoading={isLoading}
      value={parseValue(value)}
      getOptionLabel={(option) => {
        try {
          const translated = formatMessage(`grievance.channel.${option}`);
          return translated !== `grievance.channel.${option}` ? translated : option;
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

export default MultiChannelPicker;