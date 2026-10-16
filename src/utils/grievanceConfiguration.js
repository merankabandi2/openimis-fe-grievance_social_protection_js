import {
  RIGHT_TICKET,
  RIGHT_TICKET_ADD,
  RIGHT_TICKET_DELETE,
  RIGHT_TICKET_EDIT,
  RIGHT_TICKET_SEARCH,
  // eslint-disable-next-line import/extensions
} from '../constants.js';

/**
 * Rights GrievanceConfigurationDialog requires: the user must hold all of them to
 * read the grievance configuration and to be warned when it is incomplete.
 */
export const GRIEVANCE_CONFIGURATION_RIGHTS = [
  RIGHT_TICKET,
  RIGHT_TICKET_SEARCH,
  RIGHT_TICKET_ADD,
  RIGHT_TICKET_EDIT,
  RIGHT_TICKET_DELETE,
];

export const holdsGrievanceConfigurationRights = (rights) => Array.isArray(rights)
  && GRIEVANCE_CONFIGURATION_RIGHTS.every((right) => rights.includes(right));

/**
 * True when the configuration is not fetched yet and the user holds the rights:
 * before login the rights are empty and the query would be refused.
 */
export const shouldFetchGrievanceConfiguration = (rights, fetched) => !fetched
  && holdsGrievanceConfigurationRights(rights);
