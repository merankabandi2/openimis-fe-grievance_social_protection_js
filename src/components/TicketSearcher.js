/* eslint-disable no-nested-ternary */
/* eslint-disable no-undef */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable class-methods-use-this */
import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { IconButton, Tooltip, Chip } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';
import {
  coreConfirm,
  formatMessageWithValues,
  journalize,
  Searcher,
  withHistory,
  withModulesManager,
  PublishedComponent,
  formatMessage,
  historyPush,
  decodeId,
} from '@openimis/fe-core';
import EditIcon from '@material-ui/icons/Edit';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Chat as ChatIcon,
  Sms as SmsIcon,
  Home as HomeIcon,
  Mail as MailIcon,
  WifiTethering as HotlineIcon,
  Inbox as InboxIcon,
  PriorityHigh as HighPriorityIcon,
  Warning as MediumPriorityIcon,
  Info as LowPriorityIcon,
  Error as UrgentPriorityIcon,
  InfoOutlined as InfoIcon,
} from '@material-ui/icons';
// import AddIcon from '@material-ui/icons/Add';
import { MODULE_NAME, RIGHT_TICKET_EDIT } from '../constants';
import { fetchTicketSummaries, resolveTicket } from '../actions';
import { isEmptyObject } from '../utils/utils';

import TicketFilter from './TicketFilter';
import EnquiryDialog from './EnquiryDialog';

const styles = (theme) => ({
  paper: {
    ...theme.paper.paper,
    margin: 0,
  },
  paperHeader: {
    ...theme.paper.header,
    padding: 10,
  },
  tableTitle: theme.table.title,
  fab: theme.fab,
  button: {
    margin: theme.spacing(1),
  },
  item: {
    padding: theme.spacing(1),
  },
});

class TicketSearcher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enquiryOpen: false,
      // open: false,
      chfid: null,
      confirmedAction: null,
      reset: 0,
      showHistoryFilter: false,
      displayVersion: false,
    };
    this.rowsPerPageOptions = props.modulesManager.getConf(
      'fe-grievance_social_protection',
      'ticketFilter.rowsPerPageOptions',
      [10, 20, 50, 100],
    );
    this.defaultPageSize = props.modulesManager.getConf(
      'fe-grievance_social_protection',
      'ticketFilter.defaultPageSize',
      10,
    );
  }

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ reset: prevState.reset + 1 });
    } else if (!prevProps.confirmed && this.props.confirmed) {
      this.state.confirmedAction();
    }
  }

  fetch = (prms) => {
    const { showHistoryFilter } = this.state;
    this.setState({ displayVersion: showHistoryFilter });
    this.props.fetchTicketSummaries(
      this.props.modulesManager,
      prms,
    );
  };

  rowIdentifier = (r) => r.uuid;

  isShowHistory = () => this.state.displayVersion;

  filtersToQueryParams = (state) => {
    const prms = Object.keys(state.filters)
      .filter((f) => !!state.filters[f].filter)
      .map((f) => state.filters[f].filter);
    prms.push(`first: ${state.pageSize}`);
    if (state.afterCursor) {
      prms.push(`after: "${state.afterCursor}"`);
    }
    if (state.beforeCursor) {
      prms.push(`before: "${state.beforeCursor}"`);
    }
    if (state.orderBy) {
      prms.push(`orderBy: ["${state.orderBy}"]`);
    }
    return prms;
  };

  headers = () => [
    'tickets.code',
    'tickets.title',
    'tickets.beneficary',
    'tickets.category',
    'tickets.channel',
    'tickets.priority',
    'tickets.status',
    'tickets.isBeneficiary',
    'tickets.isBatwa',
    this.isShowHistory() ? 'tickets.version' : '',
  ];

  sorts = () => [
    ['code', true],
    ['title', true],
    ['reporter_id', true],
    ['category', true],
    ['channel', true],
    ['priority', true],
    ['status', true],
    ['isBeneficiary', false],
    ['isBatwa', false],
    ['version', true],
  ];

  getChannelIcon = (channel) => {
    const iconMap = {
      'telephone': PhoneIcon,
      'phone': PhoneIcon,
      'sms': SmsIcon,
      'email': EmailIcon,
      'courrier_electronique': EmailIcon,
      'en_personne': PersonIcon,
      'walk_in': PersonIcon,
      'courrier_simple': MailIcon,
      'letter': MailIcon,
      'ligne_verte': HotlineIcon,
      'hotline': HotlineIcon,
      'boite_suggestion': InboxIcon,
      'suggestion_box': InboxIcon,
      'web': ChatIcon,
      'social_media': ChatIcon,
    };
    return iconMap[channel?.toLowerCase()] || ChatIcon;
  };

  getPriorityIcon = (priority) => {
    const iconMap = {
      'URGENT': UrgentPriorityIcon,
      'HIGH': HighPriorityIcon,
      'MEDIUM': MediumPriorityIcon,
      'LOW': LowPriorityIcon,
    };
    return iconMap[priority] || InfoIcon;
  };

  getPriorityColor = (priority) => {
    const colorMap = {
      'URGENT': 'error',
      'HIGH': 'error',
      'MEDIUM': 'default',
      'LOW': 'primary',
    };
    return colorMap[priority] || 'default';
  };

  getStatusColor = (status) => {
    const colorMap = {
      'OPEN': 'primary',
      'IN_PROGRESS': 'default',
      'RESOLVED': 'primary',
      'CLOSED': 'default',
      'ESCALATED': 'secondary',
    };
    return colorMap[status] || 'default';
  };

  formatCategoryValue = (category) => {
    const { intl } = this.props;
    
    // Handle array of categories
    if (Array.isArray(category)) {
      return category.map(cat => {
        const key = `ticket.category.${cat}`;
        const translated = formatMessage(intl, MODULE_NAME, key);
        return translated === key ? cat : translated;
      }).join(', ');
    }
    
    // Handle space-separated string
    if (typeof category === 'string' && category.includes(' ')) {
      return category.split(' ').map(cat => {
        const key = `ticket.category.${cat}`;
        const translated = formatMessage(intl, MODULE_NAME, key);
        return translated === key ? cat : translated;
      }).join(', ');
    }
    
    // Handle single category
    const key = `ticket.category.${category}`;
    const translated = formatMessage(intl, MODULE_NAME, key);
    return translated === key ? category : translated;
  };

  formatChannelValue = (channel) => {
    const { intl } = this.props;
    
    // Handle array of channels
    if (Array.isArray(channel)) {
      return channel.map(ch => {
        const key = `ticket.channel.${ch}`;
        const translated = formatMessage(intl, MODULE_NAME, key);
        return translated === key ? ch : translated;
      }).join(', ');
    }
    
    // Handle single channel
    const key = `ticket.channel.${channel}`;
    const translated = formatMessage(intl, MODULE_NAME, key);
    return translated === key ? channel : translated;
  };

  itemFormatters = () => {
    const formatters = [
      (ticket) => ticket.code,
      (ticket) => ticket.title,
      (ticket) => {
        const reporter = typeof ticket.reporter === 'object'
          ? ticket.reporter : JSON.parse(JSON.parse(ticket.reporter || '{}') || '{}');
        let picker = '';
        if (ticket.reporterTypeName === 'individual') {
          picker = (
            <PublishedComponent
              pubRef="individual.IndividualPicker"
              readOnly
              withNull
              label="ticket.reporter"
              required
              value={
                reporter !== undefined
                && reporter !== null ? (isEmptyObject(reporter)
                    ? null : reporter) : null
              }
            />
          );
        }
        if (ticket.reporterTypeName === 'beneficiary') {
          picker = (
            <PublishedComponent
              pubRef="socialProtection.BeneficiaryPicker"
              readOnly
              withNull
              label="ticket.reporter"
              required
              value={
                {
                  individual: {
                    firstName: ticket.reporterFirstName,
                    lastName: ticket.reporterLastName,
                    dob: ticket.reporterDob,
                  },
                }
              }
            />
          );
        }
        if (ticket.reporterTypeName === 'user') {
          picker = (
            <PublishedComponent
              pubRef="admin.UserPicker"
              readOnly
              value={
                reporter !== undefined
                && reporter !== null ? (isEmptyObject(reporter)
                    ? null : reporter) : null
              }
              module="core"
              label="ticket.reporter"
            />
          );
        }
        if (ticket.reporterTypeName === null) {
          picker = `${formatMessage(this.props.intl, MODULE_NAME, 'anonymousUser')}`;
        }
        return picker;
      },
      (ticket) => {
        let categoryValue = ticket.category;
        // Handle JSON stringified arrays
        if (typeof categoryValue === 'string' && categoryValue.startsWith('[')) {
          try {
            categoryValue = JSON.parse(categoryValue);
          } catch (e) {
            // If parsing fails, use as is
          }
        }
        return this.formatCategoryValue(categoryValue);
      },
      (ticket) => {
        let channelValue = ticket.channel;
        // Handle JSON stringified arrays
        if (typeof channelValue === 'string' && channelValue.startsWith('[')) {
          try {
            channelValue = JSON.parse(channelValue);
          } catch (e) {
            // If parsing fails, use as is
          }
        }
        
        const channels = Array.isArray(channelValue) ? channelValue : [channelValue];
        const Icon = this.getChannelIcon(channels[0]);
        const label = this.formatChannelValue(channelValue);
        
        return (
          <Tooltip title={label}>
            <Icon color="action" fontSize="small" />
          </Tooltip>
        );
      },
      (ticket) => {
        const Icon = this.getPriorityIcon(ticket.priority);
        const color = this.getPriorityColor(ticket.priority);
        const label = formatMessage(this.props.intl, MODULE_NAME, `ticket.priority.${ticket.priority}`);
        
        return (
          <Tooltip title={label}>
            <Icon color={color} fontSize="small" />
          </Tooltip>
        );
      },
      (ticket) => {
        const label = formatMessage(this.props.intl, MODULE_NAME, `ticket.status.${ticket.status}`);
        const color = this.getStatusColor(ticket.status);
        
        return (
          <Chip 
            label={label}
            color={color}
            size="small"
          />
        );
      },
      (ticket) => ticket.isBeneficiary ? (
        <Tooltip title={formatMessage(this.props.intl, MODULE_NAME, 'yes')}>
          <CheckCircleIcon color="primary" fontSize="small" />
        </Tooltip>
      ) : (
        <Tooltip title={formatMessage(this.props.intl, MODULE_NAME, 'no')}>
          <CancelIcon color="disabled" fontSize="small" />
        </Tooltip>
      ),
      (ticket) => ticket.isBatwa ? (
        <Tooltip title={formatMessage(this.props.intl, MODULE_NAME, 'yes')}>
          <CheckCircleIcon color="primary" fontSize="small" />
        </Tooltip>
      ) : (
        <Tooltip title={formatMessage(this.props.intl, MODULE_NAME, 'no')}>
          <CancelIcon color="disabled" fontSize="small" />
        </Tooltip>
      ),
      (ticket) => (this.isShowHistory() ? ticket?.version : null),
    ];

    if (this.props.rights.includes(RIGHT_TICKET_EDIT)) {
      formatters.push((ticket) => (
        <Tooltip title={formatMessage(this.props.intl, MODULE_NAME, 'editButtonTooltip')}>
          <IconButton
            disabled={ticket?.isHistory}
            onClick={() => {
              historyPush(
                this.props.modulesManager,
                this.props.history,
                'grievanceSocialProtection.route.ticket',
                [decodeId(ticket.id)],
                false,
              );
            }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
      ));
    }
    return formatters;
  };

  rowDisabled = (selection, i) => !!i.validityTo;

  rowLocked = (selection, i) => !!i.clientMutationId;

  render() {
    const {
      intl,
      tickets, ticketsPageInfo, fetchingTickets, fetchedTickets, errorTickets,
      filterPaneContributionsKey, cacheFiltersKey, onDoubleClick,
    } = this.props;

    const count = ticketsPageInfo.totalCount;

    const filterPane = ({ filters, onChangeFilters }) => (
      <TicketFilter
        filters={filters}
        onChangeFilters={onChangeFilters}
        setShowHistoryFilter={(showHistoryFilter) => this.setState({ showHistoryFilter })}
      />
    );

    return (
      <>
        <EnquiryDialog
          open={this.state.enquiryOpen}
          chfid={this.state.chfid}
          onClose={() => {
            this.setState({ enquiryOpen: false, chfid: null });
          }}
        />
        <Searcher
          module={MODULE_NAME}
          cacheFiltersKey={cacheFiltersKey}
          FilterPane={filterPane}
          filterPaneContributionsKey={filterPaneContributionsKey}
          items={tickets}
          itemsPageInfo={ticketsPageInfo}
          fetchingItems={fetchingTickets}
          fetchedItems={fetchedTickets}
          errorItems={errorTickets}
          tableTitle={formatMessageWithValues(intl, MODULE_NAME, 'ticketSummaries', { count })}
          rowsPerPageOptions={this.rowsPerPageOptions}
          defaultPageSize={this.defaultPageSize}
          fetch={this.fetch}
          rowIdentifier={this.rowIdentifier}
          filtersToQueryParams={this.filtersToQueryParams}
          defaultOrderBy="-dateCreated"
          headers={this.headers}
          itemFormatters={this.itemFormatters}
          sorts={this.sorts}
          rowDisabled={this.rowDisabled}
          rowLocked={this.rowLocked}
          onDoubleClick={(i) => !i.clientMutationId && onDoubleClick(i)}
          reset={this.state.reset}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  tickets: state.grievanceSocialProtection.tickets,
  ticketsPageInfo: state.grievanceSocialProtection.ticketsPageInfo,
  fetchingTickets: state.grievanceSocialProtection.fetchingTickets,
  fetchedTickets: state.grievanceSocialProtection.fetchedTickets,
  errorTickets: state.grievanceSocialProtection.errorTickets,
  submittingMutation: state.grievanceSocialProtection.submittingMutation,
  mutation: state.grievanceSocialProtection.mutation,
  confirmed: state.core.confirmed,
});

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchTicketSummaries, resolveTicket, journalize, coreConfirm,
  },
  dispatch,
);

export default withModulesManager(
  withHistory(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(TicketSearcher)))),
  ),
);
