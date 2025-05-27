import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTheme, withStyles } from '@material-ui/core/styles';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Chip,
  Box,
} from '@material-ui/core';
import { formatMessage, withModulesManager } from '@openimis/fe-core';
import { injectIntl } from 'react-intl';

const styles = (theme) => ({
  formControl: {
    width: '100%',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(1),
  },
  chip: {
    margin: 2,
  },
  categoryGroup: {
    fontWeight: 600,
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
    paddingLeft: theme.spacing(1),
  },
  categoryItem: {
    paddingLeft: theme.spacing(4),
  },
  selectedPath: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
  },
});

// Define the category hierarchy
const CATEGORY_HIERARCHY = {
  types_beneficiaires: {
    label: 'Types de bénéficiaires',
    children: {
      ordinaire: 'Ordinaire',
      securite_alimentaire_cerc: 'Sécurité alimentaire (CERC)',
      chocs_climatiques: 'Chocs climatiques',
      autre: 'Autre',
    },
  },
  cas_sensibles: {
    label: 'Cas sensibles',
    children: {
      violence_vbg: 'Violence / VBG',
      corruption: 'Détournement de fonds / corruption',
      accident_negligence: 'Accident grave ou négligence professionnelle',
      discrimination_ethnie_religion: "Discrimination des bénéficiaires sur la base de l'ethnie ou de la religion",
      autre: 'Autre (à préciser)',
    },
  },
  cas_speciaux: {
    label: 'Cas spéciaux',
    children: {
      erreur_exclusion: "Erreur d'exclusion potentiel (y inclus problème d'identification)",
      erreur_inclusion: "Erreur d'inclusion potentiel",
      maladie_mentale: 'Maladie mentale',
      autre: 'Autre (à préciser)',
    },
  },
  cas_non_sensibles: {
    label: 'Cas non sensibles',
    children: {
      paiement: 'Problèmes de paiement (y inclus téléphone volé)',
      telephone: 'Problèmes de téléphone',
      compte: 'Problèmes de compte (ecocash/lumicash)',
      information: "Demande d'information et d'assistance",
      autre: 'Autre (à préciser)',
    },
  },
};

// Define subcategory options
const SUBCATEGORY_OPTIONS = {
  violence_vbg: {
    label: 'Type de VBG',
    options: {
      viol: 'Viol',
      mariage_force_precoce: 'Mariage forcé / précoce',
      violence_abus: 'Violence physique',
      sante_maternelle: 'Exploitation/abus/harcèlement sexuel',
      autre: 'Violence économique',
      autre_: 'Autre (à préciser)',
    },
  },
  erreur_exclusion: {
    label: "Type d'erreur d'exclusion",
    options: {
      demande_insertion: "Demande d'insertion dans la base des bénéficiaires",
      probleme_identification: "Problème d'identification (homonymie, identifiant perdu)",
      autre: 'Autre (à préciser)',
    },
  },
  paiement: {
    label: 'Type de problème de paiement',
    options: {
      paiement_pas_recu: 'Pas reçu de paiement',
      paiement_en_retard: 'Paiement en retard',
      paiement_incomplet: 'Paiement incomplet',
      vole: 'Téléphone/carte SIM volé',
      autre: 'Autre (à préciser)',
    },
  },
  telephone: {
    label: 'Type de problème de téléphone',
    options: {
      perdu: 'Téléphone perdu',
      pas_de_reseau: 'Pas de réseau',
      allume_pas_batterie: 'Ne s\'allume pas/problème de batterie',
      recoit_pas_tm: 'Ne reçoit pas les TM',
      mot_de_passe_oublie: 'Mot de passe oublié',
      autre: 'Autre (à préciser)',
    },
  },
  compte: {
    label: 'Type de problème de compte',
    options: {
      non_active: 'Profil non activé',
      bloque: 'Compte bloqué',
      autre: 'Autre (à préciser)',
    },
  },
};

class HierarchicalCategoryPicker extends Component {
  state = {
    parentCategory: '',
    childCategory: '',
    subcategory: '',
  };

  componentDidMount() {
    this.parseExistingValue();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.parseExistingValue();
    }
  }

  parseExistingValue = () => {
    const { value } = this.props;
    if (value && typeof value === 'string') {
      // Try to parse the value to find parent and child categories
      const categories = value.split(' ');
      if (categories.length > 0) {
        // Find which parent category this belongs to
        for (const [parentKey, parentData] of Object.entries(CATEGORY_HIERARCHY)) {
          if (parentData.children[categories[0]]) {
            this.setState({
              parentCategory: parentKey,
              childCategory: categories[0],
              subcategory: categories[1] || '',
            });
            break;
          }
        }
      }
    }
  };

  handleParentChange = (event) => {
    const parentCategory = event.target.value;
    this.setState({ 
      parentCategory, 
      childCategory: '', 
      subcategory: '' 
    });
  };

  handleChildChange = (event) => {
    const childCategory = event.target.value;
    this.setState({ 
      childCategory,
      subcategory: '' 
    });
    
    // Update the value in the parent component
    this.updateValue(childCategory, '');
  };

  handleSubcategoryChange = (event) => {
    const subcategory = event.target.value;
    this.setState({ subcategory });
    
    // Update the value in the parent component
    this.updateValue(this.state.childCategory, subcategory);
  };

  updateValue = (childCategory, subcategory) => {
    const { onChange } = this.props;
    if (onChange) {
      // Create space-separated value
      const value = subcategory 
        ? `${childCategory} ${subcategory}`
        : childCategory;
      onChange(value);
    }
  };

  getCategoryPath = () => {
    const { parentCategory, childCategory, subcategory } = this.state;
    const path = [];
    
    if (parentCategory && CATEGORY_HIERARCHY[parentCategory]) {
      path.push(CATEGORY_HIERARCHY[parentCategory].label);
      
      if (childCategory && CATEGORY_HIERARCHY[parentCategory].children[childCategory]) {
        path.push(CATEGORY_HIERARCHY[parentCategory].children[childCategory]);
        
        if (subcategory && SUBCATEGORY_OPTIONS[childCategory] && SUBCATEGORY_OPTIONS[childCategory].options[subcategory]) {
          path.push(SUBCATEGORY_OPTIONS[childCategory].options[subcategory]);
        }
      }
    }
    
    return path;
  };

  render() {
    const { classes, required, readOnly, label, intl } = this.props;
    const { parentCategory, childCategory, subcategory } = this.state;
    
    const categoryPath = this.getCategoryPath();
    const showSubcategory = childCategory && SUBCATEGORY_OPTIONS[childCategory];

    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl 
            className={classes.formControl} 
            required={required}
            disabled={readOnly}
          >
            <InputLabel>
              {formatMessage(intl, 'grievanceSocialProtection', 'ticket.categoryParent')}
            </InputLabel>
            <Select
              value={parentCategory}
              onChange={this.handleParentChange}
            >
              <MenuItem value="">
                <em>{formatMessage(intl, 'grievanceSocialProtection', 'ticket.selectCategory')}</em>
              </MenuItem>
              {Object.entries(CATEGORY_HIERARCHY).map(([key, data]) => (
                <MenuItem key={key} value={key}>
                  {data.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {parentCategory && (
          <Grid item xs={12}>
            <FormControl 
              className={classes.formControl} 
              required={required}
              disabled={readOnly}
            >
              <InputLabel>
                {formatMessage(intl, 'grievanceSocialProtection', 'ticket.categoryChild')}
              </InputLabel>
              <Select
                value={childCategory}
                onChange={this.handleChildChange}
              >
                <MenuItem value="">
                  <em>{formatMessage(intl, 'grievanceSocialProtection', 'ticket.selectSubcategory')}</em>
                </MenuItem>
                {Object.entries(CATEGORY_HIERARCHY[parentCategory].children).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {showSubcategory && (
          <Grid item xs={12}>
            <FormControl 
              className={classes.formControl}
              disabled={readOnly}
            >
              <InputLabel>
                {SUBCATEGORY_OPTIONS[childCategory].label}
              </InputLabel>
              <Select
                value={subcategory}
                onChange={this.handleSubcategoryChange}
              >
                <MenuItem value="">
                  <em>{formatMessage(intl, 'grievanceSocialProtection', 'ticket.selectDetail')}</em>
                </MenuItem>
                {Object.entries(SUBCATEGORY_OPTIONS[childCategory].options).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {categoryPath.length > 0 && (
          <Grid item xs={12}>
            <Box className={classes.selectedPath}>
              <FormHelperText>
                {formatMessage(intl, 'grievanceSocialProtection', 'ticket.selectedCategory')}:
              </FormHelperText>
              <div className={classes.chips}>
                {categoryPath.map((item, index) => (
                  <Chip
                    key={index}
                    label={item}
                    size="small"
                    color={index === categoryPath.length - 1 ? 'primary' : 'default'}
                  />
                ))}
              </div>
            </Box>
          </Grid>
        )}
      </Grid>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights || [],
});

export default withModulesManager(
  connect(mapStateToProps)(
    withTheme(withStyles(styles)(injectIntl(HierarchicalCategoryPicker)))
  )
);