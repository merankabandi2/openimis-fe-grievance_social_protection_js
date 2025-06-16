// Disable due to core architecture
/* eslint-disable camelcase */
/* eslint-disable import/prefer-default-export */
import React from 'react';
import { ListAlt, AddCircleOutline, Dashboard } from '@material-ui/icons';
import { FormattedMessage } from '@openimis/fe-core';
import messages_en from './translations/en.json';
import reducer from './reducer';
import GrievanceMainMenu from './menu/GrievanceMainMenu';
import TicketsPage from './pages/TicketsPage';
import TicketPage from './pages/TicketPage';
import AddTicketPageUpdated from './pages/AddTicketPageUpdated';
import AddTicketPageImproved from './pages/AddTicketPageImproved';
import EditTicketPageUpdated from './pages/EditTicketPageUpdated';
import TicketSearcher from './components/TicketSearcher';
import TicketPriorityPicker from './pickers/TicketPriorityPicker';
import TicketStatusPicker from './pickers/TicketStatusPicker';
import CategoryPicker from './pickers/CategoryPicker';
import MultiCategoryPicker from './pickers/MultiCategoryPicker';
import CascadingCategoryPicker from './pickers/CascadingCategoryPicker';
import HierarchicalCategoryPicker from './pickers/HierarchicalCategoryPicker';
import DynamicHierarchicalCategoryPicker from './pickers/DynamicHierarchicalCategoryPicker';
import GrievanceConfigurationDialog from './dialogs/GrievanceConfigurationDialog';
import ChannelPicker from './pickers/ChannelPicker';
import MultiChannelPicker from './pickers/MultiChannelPicker';
import FlagPicker from './pickers/FlagsPicker';
import GrievanceDashboard from './components/GrievanceDashboard';
import EnhancedGrievanceDashboard from './components/EnhancedGrievanceDashboard';
import GrievanceDashboardOptimized from './components/GrievanceDashboardOptimized';

import {
  MODULE_NAME,
  RIGHT_TICKET_ADD,
  RIGHT_TICKET_SEARCH,
} from './constants';

const ROUTE_TICKET_TICKETS = 'grievance/tickets';
const ROUTE_TICKET_TICKET = 'grievance/ticket';
const ROUTE_TICKET_NEW_TICKET = 'grievance/newTicket';
const ROUTE_GRIEVANCE_DASHBOARD = 'grievance/dashboard';
const ROUTE_GRIEVANCE_DASHBOARD_OPTIMIZED = 'grievance/dashboard-optimized';

const DEFAULT_CONFIG = {
  translations: [{ key: 'en', messages: messages_en }],
  reducers: [{ key: 'grievanceSocialProtection', reducer }],

  refs: [
    { key: 'grievanceSocialProtection.route.tickets', ref: ROUTE_TICKET_TICKETS },
    { key: 'grievanceSocialProtection.route.ticket', ref: ROUTE_TICKET_TICKET },
    { key: 'grievanceSocialProtection.route.dashboard', ref: ROUTE_GRIEVANCE_DASHBOARD },
    { key: 'grievanceSocialProtection.route.dashboardOptimized', ref: ROUTE_GRIEVANCE_DASHBOARD_OPTIMIZED },

    { key: 'grievanceSocialProtection.route.ticketSearcher', ref: TicketSearcher },
    { key: 'grievanceSocialProtection.GrievanceDashboard', ref: GrievanceDashboardOptimized },
    { key: 'grievanceSocialProtection.GrievanceDashboardOriginal', ref: GrievanceDashboard },
    { key: 'grievanceSocialProtection.EnhancedGrievanceDashboard', ref: EnhancedGrievanceDashboard },
    { key: 'grievanceSocialProtection.AddTicketPageUpdated', ref: AddTicketPageUpdated },
    { key: 'grievanceSocialProtection.EditTicketPageUpdated', ref: EditTicketPageUpdated },

    { key: 'grievanceSocialProtection.TicketStatusPicker', ref: TicketStatusPicker },
    { key: 'grievanceSocialProtection.TicketPriorityPicker', ref: TicketPriorityPicker },
    { key: 'grievanceSocialProtection.DropDownCategoryPicker', ref: CategoryPicker },
    { key: 'grievanceSocialProtection.CategoryPicker', ref: CategoryPicker },
    { key: 'grievanceSocialProtection.MultiCategoryPicker', ref: MultiCategoryPicker },
    { key: 'grievanceSocialProtection.CascadingCategoryPicker', ref: CascadingCategoryPicker },
    { key: 'grievanceSocialProtection.HierarchicalCategoryPicker', ref: HierarchicalCategoryPicker },
    { key: 'grievanceSocialProtection.DynamicHierarchicalCategoryPicker', ref: DynamicHierarchicalCategoryPicker },
    { key: 'grievanceSocialProtection.FlagPicker', ref: FlagPicker },
    { key: 'grievanceSocialProtection.ChannelPicker', ref: ChannelPicker },
    { key: 'grievanceSocialProtection.MultiChannelPicker', ref: MultiChannelPicker },
    { key: 'grievanceSocialProtection.GrievanceConfigurationDialog', ref: GrievanceConfigurationDialog },

  ],
  'core.Router': [
    { path: ROUTE_TICKET_TICKETS, component: TicketsPage },
    { path: `${ROUTE_TICKET_TICKET}/:ticket_uuid?/:version?`, component: EditTicketPageUpdated },
    { path: `${ROUTE_TICKET_NEW_TICKET}`, component: AddTicketPageImproved },
    { path: ROUTE_GRIEVANCE_DASHBOARD, component: GrievanceDashboardOptimized },
    { path: ROUTE_GRIEVANCE_DASHBOARD_OPTIMIZED, component: GrievanceDashboardOptimized },
  ],
  'core.MainMenu': [{ name: 'GrievanceMainMenu', component: GrievanceMainMenu }],
  'grievance.MainMenu': [
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.grievance.dashboard" />,
      icon: <Dashboard />,
      route: `/${ROUTE_GRIEVANCE_DASHBOARD}`,
      filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
      id: 'grievance.dashboard',
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.grievance.grievances" />,
      icon: <ListAlt />,
      route: `/${ROUTE_TICKET_TICKETS}`,
      filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
      id: 'grievance.grievances',
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.grievance.add" />,
      icon: <AddCircleOutline />,
      route: `/${ROUTE_TICKET_NEW_TICKET}`,
      filter: (rights) => rights.includes(RIGHT_TICKET_ADD),
      id: 'grievance.add',
    },
  ],

};

export const GrievanceSocialProtectionModule = (cfg) => ({ ...DEFAULT_CONFIG, ...cfg });
