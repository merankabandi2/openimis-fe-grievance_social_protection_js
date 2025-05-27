/* eslint-disable max-len */
/* eslint-disable react/no-unused-state */
/* eslint-disable no-unused-vars */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Grid, Paper, Typography, Divider, IconButton, FormControlLabel, Checkbox, Select, MenuItem, FormControl, InputLabel,
} from '@material-ui/core';
import { Save } from '@material-ui/icons';
import {
  TextInput, journalize, PublishedComponent, FormattedMessage,
} from '@openimis/fe-core';
import { createTicket } from '../actions';
import { EMPTY_STRING, MODULE_NAME } from '../constants';
import GrievantTypePicker from '../pickers/GrievantTypePicker';

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
  section: {
    marginTop: theme.spacing(2),
  },
  subSection: {
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(1),
  },
});

class AddTicketPageUpdated extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: {
        isBeneficiary: false,
        isAnonymous: false,
        isBatwa: false,
        isProjectRelated: true,
        isResolved: false,
      },
      grievantType: null,
      benefitPlan: null,
      isSaved: false,
      showSubcategories: {},
    };
  }

  componentDidUpdate(prevPops, prevState, snapshort) {
    if (prevPops.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
    }
  }

  save = () => {
    this.props.createTicket(
      this.state.stateEdited,
      this.props.grievanceConfig,
      `Created Ticket ${this.state.stateEdited.title}`,
    );
    this.setState({ isSaved: true });
  };

  updateAttribute = (k, v) => {
    this.setState((state) => ({
      stateEdited: { ...state.stateEdited, [k]: v },
      isSaved: false,
    }));
    
    // Handle subcategory visibility
    if (k === 'category') {
      const categoryArray = Array.isArray(v) ? v : v?.split(' ') || [];
      const showSubcategories = {};
      
      if (categoryArray.includes('violence_vbg')) showSubcategories.vbg = true;
      if (categoryArray.includes('erreur_exclusion')) showSubcategories.exclusion = true;
      if (categoryArray.includes('paiement')) showSubcategories.payment = true;
      if (categoryArray.includes('telephone')) showSubcategories.phone = true;
      if (categoryArray.includes('compte')) showSubcategories.account = true;
      
      this.setState({ showSubcategories });
    }
  };

  updateTypeOfGrievant = (k, v) => {
    this.setState({ [k]: v, isSaved: false });
    // Set reporterType based on grievantType
    if (v) {
      this.updateAttribute('reporterType', v.replace(/\s+/g, ''));
    }
  };

  updateBenefitPlan = (k, v) => {
    this.setState({ [k]: v, isSaved: false });
  };

  renderLocationFields = () => {
    const { classes } = this.props;
    const { stateEdited, isSaved } = this.state;

    return (
      <>
        <Grid item xs={3} className={classes.item}>
          <TextInput
            label="ticket.province"
            value={stateEdited.province}
            onChange={(v) => this.updateAttribute('province', v)}
            readOnly={isSaved}
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextInput
            label="ticket.commune"
            value={stateEdited.commune}
            onChange={(v) => this.updateAttribute('commune', v)}
            readOnly={isSaved}
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextInput
            label="ticket.zone"
            value={stateEdited.zone}
            onChange={(v) => this.updateAttribute('zone', v)}
            readOnly={isSaved}
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextInput
            label="ticket.colline"
            value={stateEdited.colline}
            onChange={(v) => this.updateAttribute('colline', v)}
            readOnly={isSaved}
          />
        </Grid>
        <Grid item xs={12} className={classes.item}>
          <TextInput
            label="ticket.gps_location"
            value={stateEdited.gpsLocation}
            onChange={(v) => this.updateAttribute('gpsLocation', v)}
            readOnly={isSaved}
          />
        </Grid>
      </>
    );
  };

  renderReporterDetails = () => {
    const { classes } = this.props;
    const { stateEdited, isSaved } = this.state;

    return (
      <>
        <Grid container className={classes.section}>
          <Grid item xs={12}>
            <Typography variant="subtitle1">
              <FormattedMessage module={MODULE_NAME} id="ticket.reporterDetails" />
            </Typography>
            <Divider />
          </Grid>
        </Grid>
        <Grid container className={classes.item}>
          <Grid item xs={3} className={classes.item}>
            <FormControl fullWidth>
              <InputLabel>
                <FormattedMessage module={MODULE_NAME} id="ticket.is_beneficiary" />
              </InputLabel>
              <Select
                value={stateEdited.isBeneficiary ? 'yes' : 'no'}
                onChange={(e) => this.updateAttribute('isBeneficiary', e.target.value === 'yes')}
                disabled={isSaved}
              >
                <MenuItem value="yes">
                  <FormattedMessage module={MODULE_NAME} id="ticket.yes" />
                </MenuItem>
                <MenuItem value="no">
                  <FormattedMessage module={MODULE_NAME} id="ticket.no" />
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={3} className={classes.item}>
            <FormControl fullWidth>
              <InputLabel>
                <FormattedMessage module={MODULE_NAME} id="ticket.is_anonymous" />
              </InputLabel>
              <Select
                value={stateEdited.isAnonymous ? 'yes' : 'no'}
                onChange={(e) => this.updateAttribute('isAnonymous', e.target.value === 'yes')}
                disabled={isSaved}
              >
                <MenuItem value="yes">
                  <FormattedMessage module={MODULE_NAME} id="ticket.yes" />
                </MenuItem>
                <MenuItem value="no">
                  <FormattedMessage module={MODULE_NAME} id="ticket.no" />
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={3} className={classes.item}>
            <FormControl fullWidth>
              <InputLabel>
                <FormattedMessage module={MODULE_NAME} id="ticket.is_batwa" />
              </InputLabel>
              <Select
                value={stateEdited.isBatwa ? 'yes' : 'no'}
                onChange={(e) => this.updateAttribute('isBatwa', e.target.value === 'yes')}
                disabled={isSaved}
              >
                <MenuItem value="yes">
                  <FormattedMessage module={MODULE_NAME} id="ticket.yes" />
                </MenuItem>
                <MenuItem value="no">
                  <FormattedMessage module={MODULE_NAME} id="ticket.no" />
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={3} className={classes.item}>
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
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {!stateEdited.isAnonymous && (
          <Grid container className={classes.item}>
            <Grid item xs={4} className={classes.item}>
              <TextInput
                label="ticket.reporter_name"
                value={stateEdited.reporterName}
                onChange={(v) => this.updateAttribute('reporterName', v)}
                readOnly={isSaved}
              />
            </Grid>
            <Grid item xs={4} className={classes.item}>
              <TextInput
                label="ticket.reporter_phone"
                value={stateEdited.reporterPhone}
                onChange={(v) => this.updateAttribute('reporterPhone', v)}
                readOnly={isSaved}
              />
            </Grid>
            <Grid item xs={4} className={classes.item}>
              <TextInput
                label="ticket.cni_number"
                value={stateEdited.cniNumber}
                onChange={(v) => this.updateAttribute('cniNumber', v)}
                readOnly={isSaved}
              />
            </Grid>
          </Grid>
        )}
        
        {stateEdited.isBeneficiary && (
          <Grid container className={classes.item}>
            <Grid item xs={6} className={classes.item}>
              <FormControl fullWidth>
                <InputLabel>
                  <FormattedMessage module={MODULE_NAME} id="ticket.beneficiary_type" />
                </InputLabel>
                <Select
                  value={stateEdited.beneficiaryType || ''}
                  onChange={(e) => this.updateAttribute('beneficiaryType', e.target.value)}
                  disabled={isSaved}
                >
                  <MenuItem value="direct">Direct</MenuItem>
                  <MenuItem value="indirect">Indirect</MenuItem>
                  <MenuItem value="other">
                    <FormattedMessage module={MODULE_NAME} id="ticket.other" />
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {stateEdited.beneficiaryType === 'other' && (
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="ticket.other_beneficiary_type"
                  value={stateEdited.otherBeneficiaryType}
                  onChange={(v) => this.updateAttribute('otherBeneficiaryType', v)}
                  readOnly={isSaved}
                />
              </Grid>
            )}
          </Grid>
        )}
        
        {!stateEdited.isBeneficiary && (
          <Grid container className={classes.item}>
            <Grid item xs={12} className={classes.item}>
              <TextInput
                label="ticket.non_beneficiary_details"
                value={stateEdited.nonBeneficiaryDetails}
                onChange={(v) => this.updateAttribute('nonBeneficiaryDetails', v)}
                multiline
                rows={3}
                readOnly={isSaved}
              />
            </Grid>
          </Grid>
        )}
      </>
    );
  };

  renderSubcategoryFields = () => {
    const { classes } = this.props;
    const { stateEdited, isSaved, showSubcategories } = this.state;

    return (
      <>
        {showSubcategories.vbg && (
          <Grid container className={classes.subSection}>
            <Grid item xs={12}>
              <Typography variant="subtitle2">
                <FormattedMessage module={MODULE_NAME} id="ticket.vbg_details" />
              </Typography>
            </Grid>
            <Grid item xs={4} className={classes.item}>
              <FormControl fullWidth>
                <InputLabel>
                  <FormattedMessage module={MODULE_NAME} id="ticket.vbg_type" />
                </InputLabel>
                <Select
                  value={stateEdited.vbgType || ''}
                  onChange={(e) => this.updateAttribute('vbgType', e.target.value)}
                  disabled={isSaved}
                >
                  <MenuItem value="viol">Viol</MenuItem>
                  <MenuItem value="mariage_force_precoce">Mariage forcé/précoce</MenuItem>
                  <MenuItem value="violence_abus">Violence/abus</MenuItem>
                  <MenuItem value="sante_maternelle">Santé maternelle</MenuItem>
                  <MenuItem value="autre">Autre</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={8} className={classes.item}>
              <TextInput
                label="ticket.vbg_detail"
                value={stateEdited.vbgDetail}
                onChange={(v) => this.updateAttribute('vbgDetail', v)}
                multiline
                rows={2}
                readOnly={isSaved}
              />
            </Grid>
            <Grid item xs={4} className={classes.item}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={stateEdited.violHospital}
                    onChange={(e) => this.updateAttribute('violHospital', e.target.checked)}
                    disabled={isSaved}
                  />
                }
                label={<FormattedMessage module={MODULE_NAME} id="ticket.viol_hospital" />}
              />
            </Grid>
            <Grid item xs={4} className={classes.item}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={stateEdited.violComplaint}
                    onChange={(e) => this.updateAttribute('violComplaint', e.target.checked)}
                    disabled={isSaved}
                  />
                }
                label={<FormattedMessage module={MODULE_NAME} id="ticket.viol_complaint" />}
              />
            </Grid>
            <Grid item xs={4} className={classes.item}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={stateEdited.violSupport}
                    onChange={(e) => this.updateAttribute('violSupport', e.target.checked)}
                    disabled={isSaved}
                  />
                }
                label={<FormattedMessage module={MODULE_NAME} id="ticket.viol_support" />}
              />
            </Grid>
          </Grid>
        )}

        {showSubcategories.exclusion && (
          <Grid container className={classes.subSection}>
            <Grid item xs={12}>
              <Typography variant="subtitle2">
                <FormattedMessage module={MODULE_NAME} id="ticket.exclusion_details" />
              </Typography>
            </Grid>
            <Grid item xs={4} className={classes.item}>
              <FormControl fullWidth>
                <InputLabel>
                  <FormattedMessage module={MODULE_NAME} id="ticket.exclusion_type" />
                </InputLabel>
                <Select
                  value={stateEdited.exclusionType || ''}
                  onChange={(e) => this.updateAttribute('exclusionType', e.target.value)}
                  disabled={isSaved}
                >
                  <MenuItem value="demande_insertion">Demande d'insertion</MenuItem>
                  <MenuItem value="probleme_identification">Problème d'identification</MenuItem>
                  <MenuItem value="autre">Autre</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={8} className={classes.item}>
              <TextInput
                label="ticket.exclusion_detail"
                value={stateEdited.exclusionDetail}
                onChange={(v) => this.updateAttribute('exclusionDetail', v)}
                multiline
                rows={2}
                readOnly={isSaved}
              />
            </Grid>
          </Grid>
        )}

        {showSubcategories.payment && (
          <Grid container className={classes.subSection}>
            <Grid item xs={12}>
              <Typography variant="subtitle2">
                <FormattedMessage module={MODULE_NAME} id="ticket.payment_details" />
              </Typography>
            </Grid>
            <Grid item xs={4} className={classes.item}>
              <FormControl fullWidth>
                <InputLabel>
                  <FormattedMessage module={MODULE_NAME} id="ticket.payment_type" />
                </InputLabel>
                <Select
                  value={stateEdited.paymentType || ''}
                  onChange={(e) => this.updateAttribute('paymentType', e.target.value)}
                  disabled={isSaved}
                >
                  <MenuItem value="paiement_pas_recu">Paiement pas reçu</MenuItem>
                  <MenuItem value="paiement_en_retard">Paiement en retard</MenuItem>
                  <MenuItem value="paiement_incomplet">Paiement incomplet</MenuItem>
                  <MenuItem value="vole">Volé</MenuItem>
                  <MenuItem value="autre">Autre</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={8} className={classes.item}>
              <TextInput
                label="ticket.payment_detail"
                value={stateEdited.paymentDetail}
                onChange={(v) => this.updateAttribute('paymentDetail', v)}
                multiline
                rows={2}
                readOnly={isSaved}
              />
            </Grid>
          </Grid>
        )}

        {showSubcategories.phone && (
          <Grid container className={classes.subSection}>
            <Grid item xs={12}>
              <Typography variant="subtitle2">
                <FormattedMessage module={MODULE_NAME} id="ticket.phone_details" />
              </Typography>
            </Grid>
            <Grid item xs={4} className={classes.item}>
              <FormControl fullWidth>
                <InputLabel>
                  <FormattedMessage module={MODULE_NAME} id="ticket.phone_type" />
                </InputLabel>
                <Select
                  value={stateEdited.phone_type || ''}
                  onChange={(e) => this.updateAttribute('phone_type', e.target.value)}
                  disabled={isSaved}
                >
                  <MenuItem value="perdu">Perdu</MenuItem>
                  <MenuItem value="pas_de_reseau">Pas de réseau</MenuItem>
                  <MenuItem value="allume_pas_batterie">N'allume pas - batterie</MenuItem>
                  <MenuItem value="recoit_pas_tm">Ne reçoit pas TM</MenuItem>
                  <MenuItem value="mot_de_passe_oublie">Mot de passe oublié</MenuItem>
                  <MenuItem value="autre">Autre</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={8} className={classes.item}>
              <TextInput
                label="ticket.phone_detail"
                value={stateEdited.phone_detail}
                onChange={(v) => this.updateAttribute('phone_detail', v)}
                multiline
                rows={2}
                readOnly={isSaved}
              />
            </Grid>
          </Grid>
        )}

        {showSubcategories.account && (
          <Grid container className={classes.subSection}>
            <Grid item xs={12}>
              <Typography variant="subtitle2">
                <FormattedMessage module={MODULE_NAME} id="ticket.account_details" />
              </Typography>
            </Grid>
            <Grid item xs={4} className={classes.item}>
              <FormControl fullWidth>
                <InputLabel>
                  <FormattedMessage module={MODULE_NAME} id="ticket.account_type" />
                </InputLabel>
                <Select
                  value={stateEdited.account_type || ''}
                  onChange={(e) => this.updateAttribute('account_type', e.target.value)}
                  disabled={isSaved}
                >
                  <MenuItem value="non_active">Non activé</MenuItem>
                  <MenuItem value="bloque">Bloqué</MenuItem>
                  <MenuItem value="autre">Autre</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={8} className={classes.item}>
              <TextInput
                label="ticket.account_detail"
                value={stateEdited.account_detail}
                onChange={(v) => this.updateAttribute('account_detail', v)}
                multiline
                rows={2}
                readOnly={isSaved}
              />
            </Grid>
          </Grid>
        )}
      </>
    );
  };

  renderReceiverDetails = () => {
    const { classes } = this.props;
    const { stateEdited, isSaved } = this.state;

    return (
      <>
        <Grid container className={classes.section}>
          <Grid item xs={12}>
            <Typography variant="subtitle1">
              <FormattedMessage module={MODULE_NAME} id="ticket.receiverDetails" />
            </Typography>
            <Divider />
          </Grid>
        </Grid>
        <Grid container className={classes.item}>
          <Grid item xs={4} className={classes.item}>
            <TextInput
              label="ticket.receiver_name"
              value={stateEdited.receiverName}
              onChange={(v) => this.updateAttribute('receiverName', v)}
              readOnly={isSaved}
            />
          </Grid>
          <Grid item xs={4} className={classes.item}>
            <TextInput
              label="ticket.receiver_function"
              value={stateEdited.receiver_function}
              onChange={(v) => this.updateAttribute('receiver_function', v)}
              readOnly={isSaved}
            />
          </Grid>
          <Grid item xs={4} className={classes.item}>
            <TextInput
              label="ticket.receiver_phone"
              value={stateEdited.receiverPhone}
              onChange={(v) => this.updateAttribute('receiverPhone', v)}
              readOnly={isSaved}
            />
          </Grid>
        </Grid>
      </>
    );
  };

  render() {
    const {
      classes,
      titleone = 'ticket.ComplainantInformation',
      titletwo = 'ticket.DescriptionOfEvents',
      titleParams = { label: EMPTY_STRING },
    } = this.props;

    const {
      stateEdited,
      grievantType,
      benefitPlan,
      isSaved,
    } = this.state;

    return (
      <div className={classes.page}>
        {/* Original Reporter Type Selection */}
        <Grid container>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container className={classes.tableTitle}>
                <Grid item xs={8} className={classes.tableTitle}>
                  <Typography>
                    <FormattedMessage module={MODULE_NAME} id={titleone} values={titleParams} />
                  </Typography>
                </Grid>
              </Grid>
              <Grid container className={classes.item}>
                <Grid item xs={3} className={classes.item}>
                  <GrievantTypePicker
                    module={MODULE_NAME}
                    label="type"
                    readOnly={!!stateEdited.id || isSaved}
                    withNull
                    value={grievantType?.replace(/\s+/g, '') ?? ''}
                    onChange={(v) => this.updateTypeOfGrievant('grievantType', v)}
                    withLabel
                  />
                </Grid>
                {/* Keep existing reporter type selection logic */}
                {grievantType === 'individual' && (
                  <>
                    <Grid item xs={3} className={classes.item}>
                      <PublishedComponent
                        pubRef="socialProtection.BenefitPlanPicker"
                        withNull
                        label="socialProtection.benefitPlan"
                        value={benefitPlan}
                        onChange={(v) => this.updateBenefitPlan('benefitPlan', v)}
                        readOnly={isSaved}
                      />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                      <PublishedComponent
                        pubRef="individual.IndividualPicker"
                        value={stateEdited.reporter}
                        label="Complainant"
                        onChange={(v) => this.updateAttribute('reporter', v)}
                        benefitPlan={benefitPlan}
                        readOnly={isSaved}
                      />
                    </Grid>
                  </>
                )}
                {grievantType === 'beneficiary' && (
                  <>
                    <Grid item xs={3} className={classes.item}>
                      <PublishedComponent
                        pubRef="socialProtection.BenefitPlanPicker"
                        withNull
                        label="socialProtection.benefitPlan"
                        value={benefitPlan}
                        onChange={(v) => this.updateBenefitPlan('benefitPlan', v)}
                        readOnly={isSaved}
                      />
                    </Grid>
                    {benefitPlan && (
                      <Grid item xs={3} className={classes.item}>
                        <PublishedComponent
                          pubRef="socialProtection.BeneficiaryPicker"
                          value={stateEdited.reporter}
                          label="Complainant"
                          onChange={(v) => this.updateAttribute('reporter', v)}
                          benefitPlan={benefitPlan}
                          readOnly={isSaved}
                        />
                      </Grid>
                    )}
                  </>
                )}
                {grievantType === 'user' && (
                  <Grid item xs={6} className={classes.item}>
                    <PublishedComponent
                      pubRef="admin.UserPicker"
                      value={stateEdited.reporter}
                      label="Complainant"
                      onChange={(v) => this.updateAttribute('reporter', v)}
                      benefitPlan={benefitPlan}
                      readOnly={isSaved}
                    />
                  </Grid>
                )}
              </Grid>
              
              {/* New Reporter Details Fields */}
              {this.renderReporterDetails()}
              
              {/* Location Fields */}
              <Grid container className={classes.section}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">
                    <FormattedMessage module={MODULE_NAME} id="ticket.locationDetails" />
                  </Typography>
                  <Divider />
                </Grid>
              </Grid>
              <Grid container className={classes.item}>
                {this.renderLocationFields()}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Description of Events */}
        <Grid container>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container className={classes.tableTitle}>
                <Grid item xs={12} className={classes.tableTitle}>
                  <Typography>
                    <FormattedMessage module={MODULE_NAME} id={titletwo} values={titleParams} />
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="ticket.title"
                    value={stateEdited.title}
                    onChange={(v) => this.updateAttribute('title', v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label="ticket.dateOfIncident"
                    value={stateEdited.dateOfIncident}
                    required={false}
                    onChange={(v) => this.updateAttribute('dateOfIncident', v)}
                    readOnly={isSaved}
                  />
                </Grid>
                
                <Grid item xs={3} className={classes.item}>
                  <FormControl fullWidth>
                    <InputLabel>
                      <FormattedMessage module={MODULE_NAME} id="ticket.is_project_related" />
                    </InputLabel>
                    <Select
                      value={stateEdited.isProjectRelated ? 'yes' : 'no'}
                      onChange={(e) => this.updateAttribute('isProjectRelated', e.target.value === 'yes')}
                      disabled={isSaved}
                    >
                      <MenuItem value="yes">
                        <FormattedMessage module={MODULE_NAME} id="ticket.yes" />
                      </MenuItem>
                      <MenuItem value="no">
                        <FormattedMessage module={MODULE_NAME} id="ticket.no" />
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={3} className={classes.item}>
                  <PublishedComponent
                    pubRef="grievanceSocialProtection.DropDownCategoryPicker"
                    value={stateEdited.category}
                    onChange={(v) => this.updateAttribute('category', v)}
                    required
                    readOnly={isSaved}
                    multiple
                  />
                </Grid>
                <Grid item xs={3} className={classes.item}>
                  <PublishedComponent
                    pubRef="grievanceSocialProtection.FlagPicker"
                    value={stateEdited.flags}
                    onChange={(v) => this.updateAttribute('flags', v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={3} className={classes.item}>
                  <PublishedComponent
                    pubRef="grievanceSocialProtection.ChannelPicker"
                    value={stateEdited.channel}
                    onChange={(v) => this.updateAttribute('channel', v)}
                    required
                    readOnly={isSaved}
                    multiple
                  />
                </Grid>
                
                {stateEdited.channel?.includes('autre') && (
                  <Grid item xs={12} className={classes.item}>
                    <TextInput
                      label="ticket.other_channel"
                      value={stateEdited.otherChannel}
                      onChange={(v) => this.updateAttribute('otherChannel', v)}
                      readOnly={isSaved}
                    />
                  </Grid>
                )}
                
                <Grid item xs={4} className={classes.item}>
                  <PublishedComponent
                    pubRef="grievanceSocialProtection.TicketPriorityPicker"
                    value={stateEdited.priority}
                    onChange={(v) => this.updateAttribute('priority', v)}
                    required={false}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={4} className={classes.item}>
                  <PublishedComponent
                    pubRef="admin.UserPicker"
                    value={stateEdited.attendingStaff}
                    module="core"
                    label="ticket.attendingStaff"
                    onChange={(v) => this.updateAttribute('attendingStaff', v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={4} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label="ticket.dueDate"
                    value={stateEdited.dueDate}
                    required={false}
                    onChange={(v) => this.updateAttribute('dueDate', v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={12} className={classes.item}>
                  <TextInput
                    label="ticket.ticketDescription"
                    value={stateEdited.description}
                    onChange={(v) => this.updateAttribute('description', v)}
                    required={false}
                    multiline
                    rows={4}
                    readOnly={isSaved}
                  />
                </Grid>
              </Grid>
              
              {/* Subcategory Fields */}
              {this.renderSubcategoryFields()}
              
              {/* Receiver Details */}
              {this.renderReceiverDetails()}
              
              {/* Save Button */}
              <Grid container className={classes.item}>
                <Grid item xs={11} className={classes.item} />
                <Grid item xs={1} className={classes.item}>
                  <IconButton
                    variant="contained"
                    component="label"
                    color="primary"
                    onClick={this.save}
                    disabled={
                      (!stateEdited.channel || !stateEdited.flags || !stateEdited.title || isSaved)
                      || ((
                        stateEdited.reporterType === 'individual'
                        || stateEdited.reporterType === 'beneficiary'
                        || stateEdited.reporterType === 'user')
                        && stateEdited.reporter === null
                      )
                    }
                  >
                    <Save />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
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

export default withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(AddTicketPageUpdated)));