/* eslint-disable no-return-assign */
/* eslint-disable no-nested-ternary */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/no-unused-state */
/* eslint-disable no-unused-vars */
/* eslint-disable react/destructuring-assignment */
import React, { Component, useRef } from 'react';
import ReactToPrint, { PrintContextConsumer } from 'react-to-print';
import PrintIcon from '@material-ui/icons/Print';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Divider,
  IconButton,
  Button,
  FormControlLabel,
  Checkbox,
  TextField,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  Box,
  Fade,
  Grow,
} from '@material-ui/core';
import {
  journalize,
  TextInput,
  PublishedComponent,
  FormattedMessage,
  SelectInput,
  formatMessage,
  withHistory,
  withModulesManager,
} from '@openimis/fe-core';
import _ from 'lodash';
import { injectIntl } from 'react-intl';
import { 
  Save,
  Person,
  LocationOn,
  Description,
  Phone,
  Assignment,
  CheckCircle,
  Cancel,
  Warning,
  Info,
  PersonPin,
  Wc,
  Group,
  AssignmentInd,
  Room,
  MyLocation,
  RecordVoiceOver,
  AssignmentTurnedIn,
  ContactPhone,
} from '@material-ui/icons';
import { updateTicket, fetchTicket, createTicketComment } from '../actions';
import { EMPTY_STRING, MODULE_NAME } from '../constants';
import TicketPrintTemplate from '../components/TicketPrintTemplate';
import MultiCategoryPicker from '../pickers/MultiCategoryPicker';
import MultiChannelPicker from '../pickers/MultiChannelPicker';

const styles = (theme) => ({
  paper: {
    ...theme.paper.paper,
    marginBottom: theme.spacing(2),
    paddingTop: theme.spacing(20),
  },
  card: {
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(2),
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
    },
  },
  cardHeader: {
    background: theme.palette.grey[50],
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingBottom: theme.spacing(1.5),
  },
  cardContent: {
    paddingTop: theme.spacing(2),
  },
  tableTitle: {
    ...theme.table.title,
    padding: theme.spacing(2),
  },
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
  sectionIcon: {
    color: theme.palette.primary.main,
  },
  saveButton: {
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  infoBox: {
    background: theme.palette.grey[50],
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
  },
  statusChip: {
    fontWeight: 500,
  },
  priorityHigh: {
    backgroundColor: '#ff5252',
    color: 'white',
  },
  priorityMedium: {
    backgroundColor: '#ff9800',
    color: 'white',
  },
  priorityLow: {
    backgroundColor: '#4caf50',
    color: 'white',
  },
  printButton: {
    marginLeft: 'auto',
  },
});

const BENEFICIARY_TYPE_OPTIONS = [
  { value: 'direct', label: 'Direct' },
  { value: 'indirect', label: 'Indirect' },
];

const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'O', label: 'Other' },
];


const VBG_SUBCATEGORY_OPTIONS = [
  { value: 'physical', label: 'Physical Violence' },
  { value: 'sexual', label: 'Sexual Violence' },
  { value: 'psychological', label: 'Psychological Violence' },
  { value: 'economic', label: 'Economic Violence' },
];

const EXCLUSION_SUBCATEGORY_OPTIONS = [
  { value: 'unfair_selection', label: 'Unfair Selection' },
  { value: 'discrimination', label: 'Discrimination' },
  { value: 'incorrect_data', label: 'Incorrect Data' },
];

const PAYMENT_SUBCATEGORY_OPTIONS = [
  { value: 'delay', label: 'Payment Delay' },
  { value: 'incorrect_amount', label: 'Incorrect Amount' },
  { value: 'missing_payment', label: 'Missing Payment' },
];

const PHONE_SUBCATEGORY_OPTIONS = [
  { value: 'wrong_number', label: 'Wrong Number' },
  { value: 'lost_phone', label: 'Lost Phone' },
  { value: 'no_access', label: 'No Access to Phone' },
];

const ACCOUNT_SUBCATEGORY_OPTIONS = [
  { value: 'no_account', label: 'No Account' },
  { value: 'wrong_account', label: 'Wrong Account' },
  { value: 'blocked_account', label: 'Blocked Account' },
];

class EditTicketPageUpdated extends Component {
  constructor(props) {
    super(props);
    console.log('EditTicketPageUpdated constructor called with props:', props);
    this.state = {
      stateEdited: props.ticket || {},
      comments: props.comments || [],
      reporter: {},
      grievanceConfig: {},
      showSubcategories: {
        vbg: false,
        exclusion: false,
        payment: false,
        phone: false,
        account: false,
      },
    };
  }

  getTranslatedOptions = (options) => {
    const { intl } = this.props;
    return options.map(option => ({
      value: option.value,
      label: option.labelKey ? formatMessage(intl, MODULE_NAME, option.labelKey) : option.label
    }));
  };

  componentDidMount() {
    const { edited_id, ticket_uuid, modulesManager, match } = this.props;
    
    // Try to get ticket UUID from various sources
    const ticketId = edited_id || ticket_uuid || match?.params?.ticket_uuid || this.props.history?.location?.state?.ticket_uuid;
    
    console.log('EditTicketPageUpdated mounted with:', { 
      edited_id, 
      ticket_uuid, 
      matchParams: match?.params,
      ticketId,
      props: this.props 
    });
    
    if (ticketId) {
      // Fetch the ticket data with proper filter format
      const filters = [`id: "${ticketId}"`];
      console.log('Fetching ticket with filters:', filters);
      this.props.fetchTicket(modulesManager, filters);
    } else {
      console.error('No ticket ID found!');
    }
  }

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
    }
    
    // Update state when ticket data is loaded
    if (!prevProps.ticket && this.props.ticket && this.props.ticket.id) {
      console.log('Ticket loaded:', this.props.ticket);
      this.setState({ 
        stateEdited: this.props.ticket,
        grievanceConfig: this.props.grievanceConfig 
      });
      
      if (this.props.ticket.reporter) {
        try {
          const reporterData = typeof this.props.ticket.reporter === 'string' 
            ? JSON.parse(this.props.ticket.reporter) 
            : this.props.ticket.reporter;
          this.setState({ reporter: reporterData });
        } catch (e) {
          console.error('Error parsing reporter data:', e);
        }
      }
      
      // Initialize subcategory visibility based on existing categories
      if (this.props.ticket.category) {
        this.updateSubcategoryVisibility(this.props.ticket.category);
      }
    }
    
    // Also check if the ticket changed (e.g., different ticket selected)
    if (prevProps.ticket?.id !== this.props.ticket?.id && this.props.ticket?.id) {
      console.log('Ticket changed:', this.props.ticket);
      this.setState({ 
        stateEdited: this.props.ticket,
        grievanceConfig: this.props.grievanceConfig 
      });
    }
  }

  save = () => {
    this.props.updateTicket(
      this.state.stateEdited,
      formatMessage(this.props.intl, MODULE_NAME, 'ticket.updated', { title: this.state.stateEdited.code }),
    );
  };

  updateAttribute = (k, v) => {
    this.setState((state) => ({
      stateEdited: { ...state.stateEdited, [k]: v },
    }));

    // Handle subcategory visibility
    if (k === 'category') {
      this.updateSubcategoryVisibility(v);
    }
  };

  updateSubcategoryVisibility = (categoryValue) => {
    const categoryArray = Array.isArray(categoryValue) 
      ? categoryValue 
      : categoryValue?.split(' ') || [];
    
    const showSubcategories = {
      vbg: categoryArray.includes('violence_vbg'),
      exclusion: categoryArray.includes('erreur_exclusion'),
      payment: categoryArray.includes('paiement'),
      phone: categoryArray.includes('telephone'),
      account: categoryArray.includes('compte'),
    };
    
    this.setState({ showSubcategories });
  };

  extractFieldFromJsonExt = (reporter, field) => {
    if (reporter) {
      if (reporter.jsonExt) {
        return reporter.jsonExt[field] || '';
      }
      return '';
    }
    return '';
  };

  doesTicketChange = () => {
    const { ticket } = this.props;
    const { stateEdited } = this.state;
    return !_.isEqual(ticket, stateEdited);
  };

  render() {
    const {
      classes,
      titleone = ' Ticket.ComplainantInformation',
      titletwo = ' Ticket.DescriptionOfEvents',
      titlethree = ' Ticket.Resolution',
      titleParams = { label: EMPTY_STRING },
      grievanceConfig,
      intl,
      fetchingTicket,
    } = this.props;

    const propsReadOnly = this.props.readOnly;

    const {
      stateEdited, reporter, comments, showSubcategories,
    } = this.state;
    
    // Debug: log current state
    console.log('Render state:', { 
      stateEdited, 
      ticket: this.props.ticket,
      fetchingTicket,
      fetchedTicket: this.props.fetchedTicket,
      errorTicket: this.props.errorTicket,
      ticket_uuid: this.props.ticket_uuid,
      edited_id: this.props.edited_id
    });
    
    // Show loading state while fetching ticket
    if (fetchingTicket) {
      return (
        <div className={classes.page}>
          <Typography>Loading...</Typography>
        </div>
      );
    }
    
    // Ensure stateEdited is not null
    if (!stateEdited) {
      return (
        <div className={classes.page}>
          <Typography>No ticket data available</Typography>
        </div>
      );
    }
    
    return (
      <div className={classes.page}>
        <Fade in={true} timeout={600}>
          <Grid container>
            <Grid item xs={12}>
              <Card className={classes.card}>
                <CardHeader
                  className={classes.cardHeader}
                  avatar={
                    <Avatar className={classes.sectionIcon}>
                      <Person />
                    </Avatar>
                  }
                  title={
                    <Typography variant="h6">
                      <FormattedMessage module={MODULE_NAME} id={titleone} values={titleParams} />
                    </Typography>
                  }
                  subheader={
                    <Box display="flex" alignItems="center" mt={1}>
                      {stateEdited.code && (
                        <Chip 
                          size="small" 
                          label={`Code: ${stateEdited.code}`}
                          icon={<Assignment />}
                          className={classes.chip}
                        />
                      )}
                      {stateEdited.status && (
                        <Chip 
                          size="small" 
                          label={formatMessage(intl, MODULE_NAME, `ticket.status.${stateEdited.status}`)}
                          color={stateEdited.status === 'RESOLVED' ? 'primary' : 'default'}
                          className={classes.chip}
                        />
                      )}
                      {stateEdited.priority && (
                        <Chip 
                          size="small" 
                          label={formatMessage(intl, MODULE_NAME, `ticket.priority.${stateEdited.priority}`)}
                          className={`${classes.chip} ${classes.statusChip} ${
                            stateEdited.priority === 'HIGH' || stateEdited.priority === 'URGENT' ? classes.priorityHigh :
                            stateEdited.priority === 'MEDIUM' ? classes.priorityMedium :
                            classes.priorityLow
                          }`}
                        />
                      )}
                    </Box>
                  }
                />
                <CardContent className={classes.cardContent}>
                  <Grid container spacing={2}>
                    {/* Reporter Identity */}
                    <Grid item xs={12}>
                      <Box className={classes.sectionTitle}>
                        <PersonPin />
                        <Typography variant="subtitle1">
                          <FormattedMessage module={MODULE_NAME} id="ticket.reporterIdentity" />
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box display="flex" alignItems="flex-end">
                        <Person style={{ marginRight: 8, marginBottom: 4, color: 'rgba(0, 0, 0, 0.54)' }} />
                        <TextInput
                          module={MODULE_NAME}
                          label="ticket.reporterName"
                          value={stateEdited.reporterName}
                          onChange={(v) => this.updateAttribute('reporterName', v)}
                          readOnly={propsReadOnly}
                          fullWidth
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box display="flex" alignItems="flex-end">
                        <Phone style={{ marginRight: 8, marginBottom: 4, color: 'rgba(0, 0, 0, 0.54)' }} />
                        <TextInput
                          module={MODULE_NAME}
                          label="ticket.reporterPhone"
                          value={stateEdited.reporterPhone}
                          onChange={(v) => this.updateAttribute('reporterPhone', v)}
                          readOnly={propsReadOnly}
                          fullWidth
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box display="flex" alignItems="flex-end">
                        <AssignmentInd style={{ marginRight: 8, marginBottom: 4, color: 'rgba(0, 0, 0, 0.54)' }} />
                        <TextInput
                          module={MODULE_NAME}
                          label="ticket.cniNumber"
                          value={stateEdited.cniNumber}
                          onChange={(v) => this.updateAttribute('cniNumber', v)}
                          readOnly={propsReadOnly}
                          fullWidth
                        />
                      </Box>
                    </Grid>
                
                    {/* Reporter Characteristics */}
                    <Grid item xs={12}>
                      <Box className={classes.sectionTitle}>
                        <Group />
                        <Typography variant="subtitle1">
                          <FormattedMessage module={MODULE_NAME} id="ticket.reporterCharacteristics" />
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box display="flex" alignItems="flex-end">
                        <Wc style={{ marginRight: 8, marginBottom: 4, color: 'rgba(0, 0, 0, 0.54)' }} />
                        <SelectInput
                          module={MODULE_NAME}
                          label="ticket.gender"
                          options={this.getTranslatedOptions(GENDER_OPTIONS)}
                          value={stateEdited.gender}
                          onChange={(v) => this.updateAttribute('gender', v)}
                          readOnly={propsReadOnly}
                          fullWidth
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={9}>
                      <Box display="flex" alignItems="center" flexWrap="wrap">
                        <Chip
                          icon={stateEdited.isBeneficiary ? <CheckCircle /> : <Cancel />}
                          label={formatMessage(intl, MODULE_NAME, 'ticket.isBeneficiary')}
                          onClick={() => !propsReadOnly && this.updateAttribute('isBeneficiary', !stateEdited.isBeneficiary)}
                          color={stateEdited.isBeneficiary ? 'primary' : 'default'}
                          variant={stateEdited.isBeneficiary ? 'default' : 'outlined'}
                          className={classes.chip}
                          disabled={propsReadOnly}
                        />
                        <Chip
                          icon={stateEdited.isBatwa ? <CheckCircle /> : <Cancel />}
                          label={formatMessage(intl, MODULE_NAME, 'ticket.isBatwa')}
                          onClick={() => !propsReadOnly && this.updateAttribute('isBatwa', !stateEdited.isBatwa)}
                          color={stateEdited.isBatwa ? 'primary' : 'default'}
                          variant={stateEdited.isBatwa ? 'default' : 'outlined'}
                          className={classes.chip}
                          disabled={propsReadOnly}
                        />
                        <Chip
                          icon={stateEdited.isAnonymous ? <CheckCircle /> : <Cancel />}
                          label={formatMessage(intl, MODULE_NAME, 'ticket.isAnonymous')}
                          onClick={() => !propsReadOnly && this.updateAttribute('isAnonymous', !stateEdited.isAnonymous)}
                          color={stateEdited.isAnonymous ? 'secondary' : 'default'}
                          variant={stateEdited.isAnonymous ? 'default' : 'outlined'}
                          className={classes.chip}
                          disabled={propsReadOnly}
                        />
                      </Box>
                    </Grid>
                
                {/* Beneficiary Type - Conditional */}
                {stateEdited.isBeneficiary && (
                  <Grid item xs={6} className={classes.item}>
                    <SelectInput
                      module={MODULE_NAME}
                      label="ticket.beneficiaryType"
                      options={this.getTranslatedOptions(BENEFICIARY_TYPE_OPTIONS)}
                      value={stateEdited.beneficiaryType}
                      onChange={(v) => this.updateAttribute('beneficiaryType', v)}
                      readOnly={propsReadOnly}
                    />
                  </Grid>
                )}
                    {!stateEdited.isBeneficiary && stateEdited.reporterName && (
                      <Grid item xs={12}>
                        <Box className={classes.infoBox}>
                          <Box display="flex" alignItems="center" mb={1}>
                            <Info style={{ marginRight: 8, color: theme.palette.info.main }} />
                            <Typography variant="subtitle2" color="textSecondary">
                              <FormattedMessage module={MODULE_NAME} id="ticket.nonBeneficiaryInfo" />
                            </Typography>
                          </Box>
                          <TextInput
                            module={MODULE_NAME}
                            label="ticket.nonBeneficiaryDetails"
                            value={stateEdited.nonBeneficiaryDetails}
                            onChange={(v) => this.updateAttribute('nonBeneficiaryDetails', v)}
                            multiline
                            rows={2}
                            readOnly={propsReadOnly}
                            fullWidth
                          />
                        </Box>
                      </Grid>
                    )}
              </Grid>
                    <Grid item xs={12}>
                      <Divider style={{ margin: '16px 0' }} />
                    </Grid>
                    
                    {/* Location Information */}
                    <Grid item xs={12}>
                      <Box className={classes.sectionTitle}>
                        <LocationOn />
                        <Typography variant="subtitle1">
                          <FormattedMessage module={MODULE_NAME} id="ticket.locationInformation" />
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="flex-end">
                        <Room style={{ marginRight: 8, marginBottom: 4, color: 'rgba(0, 0, 0, 0.54)' }} />
                        <TextInput
                          module={MODULE_NAME}
                          label="ticket.colline"
                          value={stateEdited.colline}
                          onChange={(v) => this.updateAttribute('colline', v)}
                          readOnly={propsReadOnly}
                          fullWidth
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="flex-end">
                        <MyLocation style={{ marginRight: 8, marginBottom: 4, color: 'rgba(0, 0, 0, 0.54)' }} />
                        <TextInput
                          module={MODULE_NAME}
                          label="ticket.gpsLocation"
                          value={stateEdited.gpsLocation}
                          onChange={(v) => this.updateAttribute('gpsLocation', v)}
                          placeholder="-3.3731, 29.3646"
                          readOnly={propsReadOnly}
                          fullWidth
                        />
                      </Box>
                    </Grid>
        
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>

        <Grow in={true} timeout={800}>
          <Grid container>
            <Grid item xs={12}>
              <Card className={classes.card}>
                <CardHeader
                  className={classes.cardHeader}
                  avatar={
                    <Avatar className={classes.sectionIcon}>
                      <Description />
                    </Avatar>
                  }
                  title={
                    <Typography variant="h6">
                      <FormattedMessage
                        module={MODULE_NAME}
                        id={titletwo}
                        values={titleParams}
                      />
                    </Typography>
                  }
                  action={
                    <ReactToPrint content={() => this.componentRef}>
                      <PrintContextConsumer>
                        {({ handlePrint }) => (
                          <IconButton
                            onClick={handlePrint}
                            className={classes.printButton}
                          >
                            <PrintIcon />
                          </IconButton>
                        )}
                      </PrintContextConsumer>
                    </ReactToPrint>
                  }
                />
                <CardContent className={classes.cardContent}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextInput
                        module={MODULE_NAME}
                        label="ticket.title"
                        value={stateEdited.title}
                        onChange={(v) => this.updateAttribute('title', v)}
                        required
                        readOnly={propsReadOnly}
                        fullWidth
                      />
                    </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label="ticket.dateOfIncident"
                    value={stateEdited.dateOfIncident}
                    required={false}
                    onChange={(v) => this.updateAttribute('dateOfIncident', v)}
                    readOnly={propsReadOnly}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <MultiCategoryPicker
                    value={stateEdited.category}
                    onChange={(v) => this.updateAttribute('category', v)}
                    required
                    readOnly={propsReadOnly}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <MultiChannelPicker
                    value={stateEdited.channel}
                    onChange={(v) => this.updateAttribute('channel', v)}
                    required
                    readOnly={propsReadOnly}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="grievanceSocialProtection.FlagPicker"
                    value={stateEdited.flags}
                    onChange={(v) => this.updateAttribute('flags', v)}
                    readOnly={propsReadOnly}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="grievanceSocialProtection.TicketPriorityPicker"
                    value={stateEdited.priority}
                    onChange={(v) => this.updateAttribute('priority', v)}
                    required={false}
                    readOnly={propsReadOnly}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="admin.UserPicker"
                    value={stateEdited.attendingStaff}
                    module="core"
                    onChange={(v) => this.updateAttribute('attendingStaff', v)}
                    readOnly={propsReadOnly}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="grievanceSocialProtection.TicketStatusPicker"
                    value={stateEdited.status}
                    onChange={(v) => this.updateAttribute('status', v)}
                    required={false}
                    readOnly={propsReadOnly}
                  />
                </Grid>
                <Grid item xs={12} className={classes.item}>
                  <TextInput
                    label="ticket.description"
                    value={stateEdited.description}
                    onChange={(v) => this.updateAttribute('description', v)}
                    required={false}
                    readOnly={propsReadOnly}
                  />
                </Grid>
              </Grid>
              
              {/* Subcategory sections based on selected categories */}
              {showSubcategories.vbg && (
                <>
                  <Divider />
                  <Typography variant="h6" className={classes.tableTitle}>
                    <FormattedMessage module={MODULE_NAME} id="ticket.vbgDetails" />
                  </Typography>
                  <Grid container className={classes.item}>
                    <Grid item xs={6} className={classes.item}>
                      <SelectInput
                        module={MODULE_NAME}
                        label="ticket.vbgType"
                        options={this.getTranslatedOptions(VBG_SUBCATEGORY_OPTIONS)}
                        value={stateEdited.vbgType}
                        onChange={(v) => this.updateAttribute('vbgType', v)}
                        readOnly={propsReadOnly}
                      />
                    </Grid>
                    <Grid item xs={6} className={classes.item}>
                      <TextInput
                        module={MODULE_NAME}
                        label="ticket.vbgDetail"
                        value={stateEdited.vbgDetail}
                        onChange={(v) => this.updateAttribute('vbgDetail', v)}
                        readOnly={propsReadOnly}
                      />
                    </Grid>
                  </Grid>
                </>
              )}

              {showSubcategories.exclusion && (
                <>
                  <Divider />
                  <Typography variant="h6" className={classes.tableTitle}>
                    <FormattedMessage module={MODULE_NAME} id="ticket.exclusionDetails" />
                  </Typography>
                  <Grid container className={classes.item}>
                    <Grid item xs={6} className={classes.item}>
                      <SelectInput
                        module={MODULE_NAME}
                        label="ticket.exclusionType"
                        options={this.getTranslatedOptions(EXCLUSION_SUBCATEGORY_OPTIONS)}
                        value={stateEdited.exclusionType}
                        onChange={(v) => this.updateAttribute('exclusionType', v)}
                        readOnly={propsReadOnly}
                      />
                    </Grid>
                    <Grid item xs={6} className={classes.item}>
                      <TextInput
                        module={MODULE_NAME}
                        label="ticket.exclusionDetail"
                        value={stateEdited.exclusionDetail}
                        onChange={(v) => this.updateAttribute('exclusionDetail', v)}
                        readOnly={propsReadOnly}
                      />
                    </Grid>
                  </Grid>
                </>
              )}

              {showSubcategories.payment && (
                <>
                  <Divider />
                  <Typography variant="h6" className={classes.tableTitle}>
                    <FormattedMessage module={MODULE_NAME} id="ticket.paymentDetails" />
                  </Typography>
                  <Grid container className={classes.item}>
                    <Grid item xs={6} className={classes.item}>
                      <SelectInput
                        module={MODULE_NAME}
                        label="ticket.paymentType"
                        options={this.getTranslatedOptions(PAYMENT_SUBCATEGORY_OPTIONS)}
                        value={stateEdited.paymentType}
                        onChange={(v) => this.updateAttribute('paymentType', v)}
                        readOnly={propsReadOnly}
                      />
                    </Grid>
                    <Grid item xs={6} className={classes.item}>
                      <TextInput
                        module={MODULE_NAME}
                        label="ticket.paymentDetail"
                        value={stateEdited.paymentDetail}
                        onChange={(v) => this.updateAttribute('paymentDetail', v)}
                        readOnly={propsReadOnly}
                      />
                    </Grid>
                  </Grid>
                </>
              )}

              {showSubcategories.phone && (
                <>
                  <Divider />
                  <Typography variant="h6" className={classes.tableTitle}>
                    <FormattedMessage module={MODULE_NAME} id="ticket.phoneDetails" />
                  </Typography>
                  <Grid container className={classes.item}>
                    <Grid item xs={6} className={classes.item}>
                      <SelectInput
                        module={MODULE_NAME}
                        label="ticket.phoneType"
                        options={this.getTranslatedOptions(PHONE_SUBCATEGORY_OPTIONS)}
                        value={stateEdited.phoneType}
                        onChange={(v) => this.updateAttribute('phoneType', v)}
                        readOnly={propsReadOnly}
                      />
                    </Grid>
                    <Grid item xs={6} className={classes.item}>
                      <TextInput
                        module={MODULE_NAME}
                        label="ticket.phoneDetail"
                        value={stateEdited.phoneDetail}
                        onChange={(v) => this.updateAttribute('phoneDetail', v)}
                        readOnly={propsReadOnly}
                      />
                    </Grid>
                  </Grid>
                </>
              )}

              {showSubcategories.account && (
                <>
                  <Divider />
                  <Typography variant="h6" className={classes.tableTitle}>
                    <FormattedMessage module={MODULE_NAME} id="ticket.accountDetails" />
                  </Typography>
                  <Grid container className={classes.item}>
                    <Grid item xs={6} className={classes.item}>
                      <SelectInput
                        module={MODULE_NAME}
                        label="ticket.accountType"
                        options={this.getTranslatedOptions(ACCOUNT_SUBCATEGORY_OPTIONS)}
                        value={stateEdited.accountType}
                        onChange={(v) => this.updateAttribute('accountType', v)}
                        readOnly={propsReadOnly}
                      />
                    </Grid>
                    <Grid item xs={6} className={classes.item}>
                      <TextInput
                        module={MODULE_NAME}
                        label="ticket.accountDetail"
                        value={stateEdited.accountDetail}
                        onChange={(v) => this.updateAttribute('accountDetail', v)}
                        readOnly={propsReadOnly}
                      />
                    </Grid>
                  </Grid>
                </>
              )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grow>

        <Grow in={true} timeout={1000}>
          <Grid container>
            <Grid item xs={12}>
              <Card className={classes.card}>
                <CardHeader
                  className={classes.cardHeader}
                  avatar={
                    <Avatar className={classes.sectionIcon}>
                      <RecordVoiceOver />
                    </Avatar>
                  }
                  title={
                    <Typography variant="h6">
                      <FormattedMessage module={MODULE_NAME} id="ticket.receiverInformation" />
                    </Typography>
                  }
                />
                <CardContent className={classes.cardContent}>
              <Grid container className={classes.item}>
                <Grid item xs={4} className={classes.item}>
                  <TextInput
                    module={MODULE_NAME}
                    label="ticket.receiverName"
                    value={stateEdited.receiverName}
                    onChange={(v) => this.updateAttribute('receiverName', v)}
                    readOnly={propsReadOnly}
                  />
                </Grid>
                <Grid item xs={4} className={classes.item}>
                  <TextInput
                    module={MODULE_NAME}
                    label="ticket.receiverFunction"
                    value={stateEdited.receiverFunction}
                    onChange={(v) => this.updateAttribute('receiverFunction', v)}
                    readOnly={propsReadOnly}
                  />
                </Grid>
                <Grid item xs={4} className={classes.item}>
                  <TextInput
                    module={MODULE_NAME}
                    label="ticket.receiverPhone"
                    value={stateEdited.receiverPhone}
                    onChange={(v) => this.updateAttribute('receiverPhone', v)}
                    readOnly={propsReadOnly}
                  />
                </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grow>

        <Grow in={true} timeout={1200}>
          <Grid container>
            <Grid item xs={12}>
              <Card className={classes.card}>
                <CardHeader
                  className={classes.cardHeader}
                  avatar={
                    <Avatar className={classes.sectionIcon}>
                      <AssignmentTurnedIn />
                    </Avatar>
                  }
                  title={
                    <Typography variant="h6">
                      <FormattedMessage
                        module={MODULE_NAME}
                        id={titlethree}
                        values={titleParams}
                      />
                    </Typography>
                  }
                />
                <CardContent className={classes.cardContent}>
              <Grid container className={classes.item} spacing={2}>
                <Grid item xs={6} className={classes.item}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={stateEdited.isResolved || false}
                        onChange={(e) => this.updateAttribute('isResolved', e.target.checked)}
                        disabled={propsReadOnly}
                      />
                    }
                    label={<FormattedMessage module={MODULE_NAME} id="ticket.isResolved" />}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    module={MODULE_NAME}
                    label="ticket.resolution"
                    value={stateEdited.resolution}
                    onChange={(v) => this.updateAttribute('resolution', v)}
                    readOnly={propsReadOnly}
                  />
                </Grid>
                <Grid item xs={12} className={classes.item}>
                  <TextInput
                    module={MODULE_NAME}
                    label="ticket.resolutionDetails"
                    value={stateEdited.resolutionDetails}
                    onChange={(v) => this.updateAttribute('resolutionDetails', v)}
                    multiline
                    rows={3}
                    readOnly={propsReadOnly}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    module={MODULE_NAME}
                    label="ticket.resolverName"
                    value={stateEdited.resolverName}
                    onChange={(v) => this.updateAttribute('resolverName', v)}
                    readOnly={propsReadOnly}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    module={MODULE_NAME}
                    label="ticket.resolverFunction"
                    value={stateEdited.resolverFunction}
                    onChange={(v) => this.updateAttribute('resolverFunction', v)}
                    readOnly={propsReadOnly}
                  />
                </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grow>
        
        {/* Floating Save Button */}
        <Button
          variant="contained"
          color="primary"
          className={classes.saveButton}
          onClick={this.save}
          disabled={propsReadOnly || !this.doesTicketChange()}
          startIcon={<Save />}
        >
          <FormattedMessage module={MODULE_NAME} id="ticket.save" />
        </Button>
        
        <div style={{ display: 'none' }}>
          <TicketPrintTemplate
            ref={(el) => (this.componentRef = el)}
            ticket={stateEdited}
            reporter={reporter}
            comments={comments}
          />
        </div>
      </div>
    );
  }
}

// eslint-disable-next-line no-unused-vars
const mapStateToProps = (state, props) => {
  // Extract ticket_uuid from props (React Router)
  const ticket_uuid = props.match?.params?.ticket_uuid || props.ticket_uuid;
  console.log('MapStateToProps - props:', props);
  console.log('MapStateToProps - ticket_uuid:', ticket_uuid);
  
  return {
    submittingMutation: state.grievanceSocialProtection.submittingMutation,
    mutation: state.grievanceSocialProtection.mutation,
    fetchingTicket: state.grievanceSocialProtection.fetchingTicket,
    errorTicket: state.grievanceSocialProtection.errorTicket,
    fetchedTicket: state.grievanceSocialProtection.fetchedTicket,
    ticket: state.grievanceSocialProtection.ticket,
    grievanceConfig: state.grievanceSocialProtection.grievanceConfig,
    comments: state.grievanceSocialProtection.ticketComments,
    ticket_uuid: ticket_uuid,
    edited_id: ticket_uuid,
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchTicket, updateTicket, createTicketComment, journalize,
  },
  dispatch,
);

export default injectIntl(
  withRouter(
    withModulesManager(
      withHistory(
        withTheme(
          withStyles(styles)(
            connect(mapStateToProps, mapDispatchToProps)(EditTicketPageUpdated),
          ),
        ),
      ),
    ),
  ),
);