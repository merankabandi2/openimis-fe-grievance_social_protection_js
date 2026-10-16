import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  coreAlert,
  useModulesManager,
  useTranslations,
} from '@openimis/fe-core';
import { fetchGrievanceConfiguration } from '../actions';
import { MODULE_NAME } from '../constants';
import {
  holdsGrievanceConfigurationRights,
  shouldFetchGrievanceConfiguration,
} from '../utils/grievanceConfiguration';

function GrievanceConfigurationDialog({
  rights,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);
  const dispatch = useDispatch();
  const grievanceConfiguration = useSelector((state) => state?.grievanceSocialProtection?.grievanceConfig);
  const fetchedGrievanceConfig = useSelector((state) => state?.grievanceSocialProtection?.fetchedGrievanceConfig);

  const hasRights = holdsGrievanceConfigurationRights(rights);
  const isMatchingConfigObject = (obj) => !(typeof obj !== 'object' || obj === null || Array.isArray(obj));

  const isConfigMissing = (config) => Object.values(config).some((field) => {
    if (Array.isArray(field) && field.length === 0) {
      return true;
    }
    if (typeof field === 'object' && Object.keys(field).length === 0) {
      return true;
    }
    return !field;
  });

  const shouldDisplay = () => grievanceConfiguration
        && hasRights
        && isMatchingConfigObject(grievanceConfiguration)
        && isConfigMissing(grievanceConfiguration);

  useEffect(() => {
    if (shouldDisplay()) {
      const configString = JSON.stringify(grievanceConfiguration);
      dispatch(coreAlert(
        formatMessage('grievanceSocialProtection.dialogs.GrievanceConfigurationDialog.dialogHeader'),
        formatMessageWithValues(
          'grievanceSocialProtection.dialogs.GrievanceConfigurationDialog.dialogBody',
          { configString },
        ),
      ));
    }
  }, [grievanceConfiguration]);

  useEffect(() => {
    if (shouldFetchGrievanceConfiguration(rights, fetchedGrievanceConfig)) {
      dispatch(fetchGrievanceConfiguration());
    }
  }, [fetchedGrievanceConfig, hasRights]);

  return null;
}

export default GrievanceConfigurationDialog;
