/* eslint-disable max-len */
/* eslint-disable react/no-unused-state */
/* eslint-disable no-unused-vars */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Grid, Paper, Typography, Divider, IconButton, FormControlLabel, Checkbox, 
  Select, MenuItem, FormControl, InputLabel, Stepper, Step, StepLabel, 
  Button, Collapse, Card, CardContent, Box, Chip, TextField, Tooltip,
} from '@material-ui/core';
import { 
  Save, ArrowBack, ArrowForward, Person, LocationOn, 
  Category, Phone, Assignment, CheckCircle, ExpandMore, ExpandLess,
} from '@material-ui/icons';
import {
  TextInput, NumberInput, journalize, PublishedComponent, FormattedMessage, formatMessage,
} from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { createTicket } from '../actions';
import { EMPTY_STRING, MODULE_NAME } from '../constants';
import GrievantTypePicker from '../pickers/GrievantTypePicker';
import HierarchicalCategoryPicker from '../pickers/HierarchicalCategoryPicker';

const styles = (theme) => ({
  paper: {
    ...theme.paper.paper,
    margin: theme.spacing(2),
  },
  pageTitle: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    marginBottom: theme.spacing(2),
  },
  section: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    cursor: 'pointer',
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  sectionIcon: {
    marginRight: theme.spacing(1),
  },
  item: {
    marginBottom: theme.spacing(2),
  },
  requiredField: {
    '& label::after': {
      content: '" *"',
      color: theme.palette.error.main,
    },
  },
  stepper: {
    padding: theme.spacing(3, 0, 5),
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(3),
  },
  submitButton: {
    marginLeft: theme.spacing(1),
  },
  statusChip: {
    marginLeft: theme.spacing(2),
  },
  helpText: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(1),
  },
  conditionalSection: {
    backgroundColor: theme.palette.action.hover,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(2),
  },
});

const STEPS = [
  'step.reporterInformation',
  'step.locationDetails',
  'step.complaintDetails',
  'step.additionalInformation',
  'step.reviewSubmit',
];

class AddTicketPageImproved extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeStep: 0,
      stateEdited: {
        isBeneficiary: false,
        isAnonymous: false,
        isBatwa: false,
        isProjectRelated: true,
        isResolved: false,
        status: 'OPEN',
        priority: 'MEDIUM',
      },
      grievantType: null,
      benefitPlan: null,
      isSaved: false,
      expandedSections: {
        reporter: true,
        location: true,
        complaint: true,
        receiver: false,
      },
      validationErrors: {},
    };
  }

  handleNext = () => {
    const { activeStep } = this.state;
    if (this.validateStep(activeStep)) {
      this.setState({ activeStep: activeStep + 1 });
    }
  };

  handleBack = () => {
    const { activeStep } = this.state;
    this.setState({ activeStep: activeStep - 1 });
  };

  validateStep = (step) => {
    const { stateEdited } = this.state;
    const errors = {};

    switch (step) {
      case 0: // Reporter Information
        if (!stateEdited.isAnonymous && !stateEdited.reporterName) {
          errors.reporterName = <FormattedMessage module={MODULE_NAME} id="ticket.validation.reporterNameRequired" />;
        }
        break;
      case 2: // Complaint Details
        if (!stateEdited.title) {
          errors.title = <FormattedMessage module={MODULE_NAME} id="ticket.validation.titleRequired" />;
        }
        if (!stateEdited.category) {
          errors.category = <FormattedMessage module={MODULE_NAME} id="ticket.validation.categoryRequired" />;
        }
        if (!stateEdited.channel) {
          errors.channel = <FormattedMessage module={MODULE_NAME} id="ticket.validation.channelRequired" />;
        }
        if (!stateEdited.flags) {
          errors.flags = <FormattedMessage module={MODULE_NAME} id="ticket.validation.flagRequired" />;
        }
        break;
      default:
        break;
    }

    this.setState({ validationErrors: errors });
    return Object.keys(errors).length === 0;
  };

  toggleSection = (section) => {
    this.setState((prevState) => ({
      expandedSections: {
        ...prevState.expandedSections,
        [section]: !prevState.expandedSections[section],
      },
    }));
  };

  updateAttribute = (k, v) => {
    this.setState((state) => ({
      stateEdited: { ...state.stateEdited, [k]: v },
      isSaved: false,
    }));
  };

  updateBenefitPlan = (k, v) => {
    this.setState({ benefitPlan: v });
  };

  updateGrievantType = (v) => {
    this.setState({ grievantType: v });
  };

  save = () => {
    if (this.validateStep(this.state.activeStep)) {
      this.props.createTicket(
        this.state.stateEdited,
        this.props.grievanceConfig,
        <FormattedMessage module={MODULE_NAME} id="ticket.created" values={{ title: this.state.stateEdited.title }} />,
      );
      this.setState({ isSaved: true });
    }
  };

  renderReporterSection = () => {
    const { classes } = this.props;
    const { stateEdited, grievantType, benefitPlan, isSaved, expandedSections } = this.state;

    return (
      <Card className={classes.section}>
        <CardContent>
          <div 
            className={classes.sectionTitle}
            onClick={() => this.toggleSection('reporter')}
          >
            <Person className={classes.sectionIcon} />
            <Typography variant="h6">
              <FormattedMessage module={MODULE_NAME} id="ticket.reporterInformation" />
            </Typography>
            {expandedSections.reporter ? <ExpandLess /> : <ExpandMore />}
          </div>
          
          <Collapse in={expandedSections.reporter}>
            <Grid container spacing={2}>
              {/* Reporter Type */}
              <Grid item xs={12} md={4}>
                <GrievantTypePicker
                  value={grievantType}
                  label={<FormattedMessage module={MODULE_NAME} id="ticket.reporterType" />}
                  onChange={this.updateGrievantType}
                  readOnly={isSaved}
                  required
                />
              </Grid>

              {/* Anonymous Complaint */}
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={stateEdited.isAnonymous}
                      onChange={(e) => this.updateAttribute('isAnonymous', e.target.checked)}
                      disabled={isSaved}
                    />
                  }
                  label={<FormattedMessage module={MODULE_NAME} id="ticket.isAnonymous" />}
                />
              </Grid>

              {/* Is Beneficiary */}
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={stateEdited.isBeneficiary}
                      onChange={(e) => this.updateAttribute('isBeneficiary', e.target.checked)}
                      disabled={isSaved}
                    />
                  }
                  label={<FormattedMessage module={MODULE_NAME} id="ticket.isBeneficiary" />}
                />
              </Grid>

              {/* Reporter Name */}
              {!stateEdited.isAnonymous && (
                <Grid item xs={12} md={6}>
                  <TextInput
                    module={MODULE_NAME}
                    label="ticket.reporterName"
                    value={stateEdited.reporterName}
                    onChange={(v) => this.updateAttribute('reporterName', v)}
                    readOnly={isSaved}
                    required
                  />
                </Grid>
              )}

              {/* Phone */}
              <Grid item xs={12} md={6}>
                <TextInput
                  module={MODULE_NAME}
                  label="ticket.reporterPhone"
                  value={stateEdited.reporterPhone}
                  onChange={(v) => this.updateAttribute('reporterPhone', v)}
                  readOnly={isSaved}
                />
              </Grid>

              {/* Gender */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>
                    <FormattedMessage module={MODULE_NAME} id="ticket.gender" />
                  </InputLabel>
                  <Select
                    value={stateEdited.gender || ''}
                    onChange={(e) => this.updateAttribute('gender', e.target.value)}
                    disabled={isSaved}
                  >
                    <MenuItem value="M">
                      <FormattedMessage module={MODULE_NAME} id="ticket.gender.male" />
                    </MenuItem>
                    <MenuItem value="F">
                      <FormattedMessage module={MODULE_NAME} id="ticket.gender.female" />
                    </MenuItem>
                    <MenuItem value="O">
                      <FormattedMessage module={MODULE_NAME} id="ticket.gender.other" />
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* CNI Number */}
              <Grid item xs={12} md={4}>
                <TextInput
                  module={MODULE_NAME}
                  label="ticket.cniNumber"
                  value={stateEdited.cniNumber}
                  onChange={(v) => this.updateAttribute('cniNumber', v)}
                  readOnly={isSaved}
                />
              </Grid>

              {/* Is Batwa */}
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={stateEdited.isBatwa}
                      onChange={(e) => this.updateAttribute('isBatwa', e.target.checked)}
                      disabled={isSaved}
                    />
                  }
                  label={<FormattedMessage module={MODULE_NAME} id="ticket.isBatwa" />}
                />
              </Grid>

              {/* Beneficiary Type if applicable */}
              {stateEdited.isBeneficiary && (
                <Grid item xs={12} md={6}>
                  <TextInput
                    module={MODULE_NAME}
                    label="ticket.beneficiaryType"
                    value={stateEdited.beneficiaryType}
                    onChange={(v) => this.updateAttribute('beneficiaryType', v)}
                    readOnly={isSaved}
                  />
                </Grid>
              )}

              {/* Non-beneficiary details */}
              {!stateEdited.isBeneficiary && (
                <Grid item xs={12}>
                  <TextInput
                    module={MODULE_NAME}
                    label="ticket.nonBeneficiaryDetails"
                    value={stateEdited.nonBeneficiaryDetails}
                    onChange={(v) => this.updateAttribute('nonBeneficiaryDetails', v)}
                    readOnly={isSaved}
                    multiline
                    rows={2}
                  />
                </Grid>
              )}
            </Grid>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  renderLocationSection = () => {
    const { classes } = this.props;
    const { stateEdited, isSaved, expandedSections } = this.state;

    return (
      <Card className={classes.section}>
        <CardContent>
          <div 
            className={classes.sectionTitle}
            onClick={() => this.toggleSection('location')}
          >
            <LocationOn className={classes.sectionIcon} />
            <Typography variant="h6">
              <FormattedMessage module={MODULE_NAME} id="ticket.locationInformation" />
            </Typography>
            {expandedSections.location ? <ExpandLess /> : <ExpandMore />}
          </div>
          
          <Collapse in={expandedSections.location}>
            <Grid container spacing={2}>
              {/* Province */}
              <Grid item xs={12} md={6}>
                <TextInput
                  module={MODULE_NAME}
                  label="ticket.province"
                  value={stateEdited.province}
                  onChange={(v) => this.updateAttribute('province', v)}
                  readOnly={isSaved}
                />
              </Grid>

              {/* Commune */}
              <Grid item xs={12} md={6}>
                <TextInput
                  module={MODULE_NAME}
                  label="ticket.commune"
                  value={stateEdited.commune}
                  onChange={(v) => this.updateAttribute('commune', v)}
                  readOnly={isSaved}
                />
              </Grid>

              {/* Zone */}
              <Grid item xs={12} md={6}>
                <TextInput
                  module={MODULE_NAME}
                  label="ticket.zone"
                  value={stateEdited.zone}
                  onChange={(v) => this.updateAttribute('zone', v)}
                  readOnly={isSaved}
                />
              </Grid>

              {/* Colline */}
              <Grid item xs={12} md={6}>
                <TextInput
                  module={MODULE_NAME}
                  label="ticket.colline"
                  value={stateEdited.colline}
                  onChange={(v) => this.updateAttribute('colline', v)}
                  readOnly={isSaved}
                />
              </Grid>

              {/* GPS Location */}
              <Grid item xs={12}>
                <TextInput
                  module={MODULE_NAME}
                  label="ticket.gpsLocation"
                  value={stateEdited.gpsLocation}
                  onChange={(v) => this.updateAttribute('gpsLocation', v)}
                  readOnly={isSaved}
                />
                <Typography variant="caption" className={classes.helpText}>
                  <FormattedMessage module={MODULE_NAME} id="ticket.gpsLocation.help" />
                </Typography>
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  renderComplaintSection = () => {
    const { classes } = this.props;
    const { stateEdited, isSaved, expandedSections, validationErrors } = this.state;

    return (
      <Card className={classes.section}>
        <CardContent>
          <div 
            className={classes.sectionTitle}
            onClick={() => this.toggleSection('complaint')}
          >
            <Assignment className={classes.sectionIcon} />
            <Typography variant="h6">
              <FormattedMessage module={MODULE_NAME} id="ticket.complaintDetails" />
            </Typography>
            {expandedSections.complaint ? <ExpandLess /> : <ExpandMore />}
          </div>
          
          <Collapse in={expandedSections.complaint}>
            <Grid container spacing={2}>
              {/* Title */}
              <Grid item xs={12}>
                <TextInput
                  module={MODULE_NAME}
                  label="ticket.title"
                  value={stateEdited.title}
                  onChange={(v) => this.updateAttribute('title', v)}
                  readOnly={isSaved}
                  required
                  error={!!validationErrors.title}
                  helperText={validationErrors.title}
                />
              </Grid>

              {/* Hierarchical Category Selection */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  <FormattedMessage module={MODULE_NAME} id="ticket.category" /> *
                </Typography>
                <HierarchicalCategoryPicker
                  value={stateEdited.category}
                  onChange={(v) => this.updateAttribute('category', v)}
                  readOnly={isSaved}
                  required
                  error={!!validationErrors.category}
                />
              </Grid>

              {/* Channel */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!validationErrors.channel}>
                  <InputLabel>
                    <FormattedMessage module={MODULE_NAME} id="ticket.channel" />
                  </InputLabel>
                  <Select
                    value={stateEdited.channel || ''}
                    onChange={(e) => this.updateAttribute('channel', e.target.value)}
                    disabled={isSaved}
                  >
                    <MenuItem value="telephone">
                      <FormattedMessage module={MODULE_NAME} id="ticket.channel.phone" />
                    </MenuItem>
                    <MenuItem value="sms">
                      <FormattedMessage module={MODULE_NAME} id="ticket.channel.sms" />
                    </MenuItem>
                    <MenuItem value="en_personne">
                      <FormattedMessage module={MODULE_NAME} id="ticket.channel.inPerson" />
                    </MenuItem>
                    <MenuItem value="courrier_simple">
                      <FormattedMessage module={MODULE_NAME} id="ticket.channel.regularMail" />
                    </MenuItem>
                    <MenuItem value="courrier_electronique">
                      <FormattedMessage module={MODULE_NAME} id="ticket.channel.email" />
                    </MenuItem>
                    <MenuItem value="ligne_verte">
                      <FormattedMessage module={MODULE_NAME} id="ticket.channel.hotline" />
                    </MenuItem>
                    <MenuItem value="boite_suggestion">
                      <FormattedMessage module={MODULE_NAME} id="ticket.channel.suggestionBox" />
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Priority */}
              <Grid item xs={12} md={6}>
                <PublishedComponent
                  pubRef="grievanceSocialProtection.TicketPriorityPicker"
                  value={stateEdited.priority}
                  onChange={(v) => this.updateAttribute('priority', v)}
                  readOnly={isSaved}
                  required
                />
              </Grid>

              {/* Flags */}
              <Grid item xs={12} md={6}>
                <PublishedComponent
                  pubRef="grievanceSocialProtection.FlagPicker"
                  value={stateEdited.flags}
                  onChange={(v) => this.updateAttribute('flags', v)}
                  readOnly={isSaved}
                  required
                />
              </Grid>

              {/* Date of Incident */}
              <Grid item xs={12} md={6}>
                <PublishedComponent
                  pubRef="core.DatePicker"
                  module={MODULE_NAME}
                  label="ticket.dateOfIncident"
                  value={stateEdited.dateOfIncident}
                  onChange={(v) => this.updateAttribute('dateOfIncident', v)}
                  readOnly={isSaved}
                />
              </Grid>

              {/* Is Project Related */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={stateEdited.isProjectRelated}
                      onChange={(e) => this.updateAttribute('isProjectRelated', e.target.checked)}
                      disabled={isSaved}
                    />
                  }
                  label={<FormattedMessage module={MODULE_NAME} id="ticket.isProjectRelated" />}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextInput
                  module={MODULE_NAME}
                  label="ticket.description"
                  value={stateEdited.description}
                  onChange={(v) => this.updateAttribute('description', v)}
                  readOnly={isSaved}
                  multiline
                  rows={4}
                />
              </Grid>

              {/* Conditional Fields based on Category */}
              {this.renderConditionalFields()}
            </Grid>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  renderConditionalFields = () => {
    const { classes } = this.props;
    const { stateEdited, isSaved } = this.state;

    if (!stateEdited.category) return null;

    const category = stateEdited.category.split(' ')[0];

    // VBG specific fields
    if (category === 'violence_vbg') {
      return (
        <Grid item xs={12}>
          <Box className={classes.conditionalSection}>
            <Typography variant="subtitle2" gutterBottom>
              <FormattedMessage module={MODULE_NAME} id="ticket.vbgDetails" />
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={stateEdited.violHospital}
                      onChange={(e) => this.updateAttribute('violHospital', e.target.checked)}
                      disabled={isSaved}
                    />
                  }
                  label={<FormattedMessage module={MODULE_NAME} id="ticket.violHospital" />}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={stateEdited.violComplaint}
                      onChange={(e) => this.updateAttribute('violComplaint', e.target.checked)}
                      disabled={isSaved}
                    />
                  }
                  label={<FormattedMessage module={MODULE_NAME} id="ticket.violComplaint" />}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={stateEdited.violSupport}
                      onChange={(e) => this.updateAttribute('violSupport', e.target.checked)}
                      disabled={isSaved}
                    />
                  }
                  label={<FormattedMessage module={MODULE_NAME} id="ticket.violSupport" />}
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
      );
    }

    return null;
  };

  renderReceiverSection = () => {
    const { classes } = this.props;
    const { stateEdited, isSaved, expandedSections } = this.state;

    return (
      <Card className={classes.section}>
        <CardContent>
          <div 
            className={classes.sectionTitle}
            onClick={() => this.toggleSection('receiver')}
          >
            <Phone className={classes.sectionIcon} />
            <Typography variant="h6">
              <FormattedMessage module={MODULE_NAME} id="ticket.receiverInformation" />
            </Typography>
            {expandedSections.receiver ? <ExpandLess /> : <ExpandMore />}
          </div>
          
          <Collapse in={expandedSections.receiver}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextInput
                  module={MODULE_NAME}
                  label="ticket.receiverName"
                  value={stateEdited.receiverName}
                  onChange={(v) => this.updateAttribute('receiverName', v)}
                  readOnly={isSaved}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextInput
                  module={MODULE_NAME}
                  label="ticket.receiverFunction"
                  value={stateEdited.receiverFunction}
                  onChange={(v) => this.updateAttribute('receiverFunction', v)}
                  readOnly={isSaved}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextInput
                  module={MODULE_NAME}
                  label="ticket.receiverPhone"
                  value={stateEdited.receiverPhone}
                  onChange={(v) => this.updateAttribute('receiverPhone', v)}
                  readOnly={isSaved}
                />
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  getChannelLabel = (channelValue) => {
    const { intl } = this.props;
    const channelMap = {
      'telephone': 'ticket.channel.phone',
      'sms': 'ticket.channel.sms',
      'en_personne': 'ticket.channel.inPerson',
      'courrier_simple': 'ticket.channel.regularMail',
      'courrier_electronique': 'ticket.channel.email',
      'ligne_verte': 'ticket.channel.hotline',
      'boite_suggestion': 'ticket.channel.suggestionBox',
    };
    const translationKey = channelMap[channelValue];
    return translationKey ? formatMessage(intl, MODULE_NAME, translationKey) : channelValue;
  };

  renderSummary = () => {
    const { classes } = this.props;
    const { stateEdited } = this.state;

    return (
      <Card className={classes.section}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FormattedMessage module={MODULE_NAME} id="ticket.summary" />
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">
                <FormattedMessage module={MODULE_NAME} id="ticket.reporterInformation" />
              </Typography>
              <Box mb={2}>
                {stateEdited.isAnonymous && (
                  <Chip label={<FormattedMessage module={MODULE_NAME} id="ticket.chip.anonymous" />} size="small" color="default" />
                )}
                {stateEdited.isBeneficiary && (
                  <Chip label={<FormattedMessage module={MODULE_NAME} id="ticket.chip.beneficiary" />} size="small" color="primary" />
                )}
                {stateEdited.isBatwa && (
                  <Chip label={<FormattedMessage module={MODULE_NAME} id="ticket.chip.batwa" />} size="small" color="secondary" />
                )}
              </Box>
              {stateEdited.reporterName && (
                <Typography variant="body2"><FormattedMessage module={MODULE_NAME} id="ticket.summary.name" />: {stateEdited.reporterName}</Typography>
              )}
              {stateEdited.reporterPhone && (
                <Typography variant="body2"><FormattedMessage module={MODULE_NAME} id="ticket.summary.phone" />: {stateEdited.reporterPhone}</Typography>
              )}
              {stateEdited.cniNumber && (
                <Typography variant="body2"><FormattedMessage module={MODULE_NAME} id="ticket.summary.cni" />: {stateEdited.cniNumber}</Typography>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">
                <FormattedMessage module={MODULE_NAME} id="ticket.complaintDetails" />
              </Typography>
              <Typography variant="body2"><FormattedMessage module={MODULE_NAME} id="ticket.summary.title" />: {stateEdited.title}</Typography>
              <Typography variant="body2"><FormattedMessage module={MODULE_NAME} id="ticket.summary.category" />: {stateEdited.category}</Typography>
              <Typography variant="body2"><FormattedMessage module={MODULE_NAME} id="ticket.summary.channel" />: {this.getChannelLabel(stateEdited.channel)}</Typography>
              <Typography variant="body2"><FormattedMessage module={MODULE_NAME} id="ticket.summary.priority" />: {stateEdited.priority}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  render() {
    const { classes, submittingMutation, mutation } = this.props;
    const { activeStep, stateEdited, isSaved } = this.state;

    return (
      <div className={classes.page}>
        <Paper className={classes.paper}>
          <div className={classes.pageTitle}>
            <Typography variant="h4">
              <FormattedMessage module={MODULE_NAME} id="ticket.newTicket" />
            </Typography>
          </div>

          <Box p={3}>
            {/* Stepper */}
            <Stepper activeStep={activeStep} className={classes.stepper}>
              {STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>
                    <FormattedMessage module={MODULE_NAME} id={`ticket.${label}`} />
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Content based on active step */}
            {activeStep === 0 && this.renderReporterSection()}
            {activeStep === 1 && this.renderLocationSection()}
            {activeStep === 2 && this.renderComplaintSection()}
            {activeStep === 3 && this.renderReceiverSection()}
            {activeStep === 4 && this.renderSummary()}

            {/* Navigation buttons */}
            <div className={classes.buttons}>
              <Button
                disabled={activeStep === 0}
                onClick={this.handleBack}
                startIcon={<ArrowBack />}
              >
                <FormattedMessage module={MODULE_NAME} id="ticket.back" />
              </Button>
              
              <div>
                {activeStep < STEPS.length - 1 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={this.handleNext}
                    endIcon={<ArrowForward />}
                  >
                    <FormattedMessage module={MODULE_NAME} id="ticket.next" />
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={this.save}
                    disabled={
                      isSaved || 
                      !stateEdited.title || 
                      !stateEdited.category || 
                      !stateEdited.channel || 
                      !stateEdited.flags ||
                      ((!stateEdited.isAnonymous && !stateEdited.reporterName))
                    }
                    startIcon={<Save />}
                    className={classes.submitButton}
                  >
                    <FormattedMessage module={MODULE_NAME} id="ticket.save" />
                  </Button>
                )}
                
                {isSaved && (
                  <Chip
                    icon={<CheckCircle />}
                    label={<FormattedMessage module={MODULE_NAME} id="ticket.chip.saved" />}
                    color="primary"
                    className={classes.statusChip}
                  />
                )}
              </div>
            </div>
          </Box>
        </Paper>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  submittingMutation: state.grievanceSocialProtection.submittingMutation,
  mutation: state.grievanceSocialProtection.mutation,
  grievanceConfig: state.grievanceSocialProtection.grievanceConfig,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ createTicket, journalize }, dispatch);

export default injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(AddTicketPageImproved))));