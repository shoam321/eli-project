import React, { Component } from 'react';
import { ScrollView, View } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { supplierSearch } from '../../actions/suppliers';
import { brandSearch, postBrand } from '../../actions/brands';
import { modelSearch, getBrandModels } from '../../actions/models';
import {
  partSearch, postPart, updatePart, getNextPartSerialNumber,
} from '../../actions/parts';
import styles from '../../config/styles';
import Scene from '../../components/Scene';
import TextInput from '../../components/TextInput';
import Header, { HeaderIcon } from '../components/Header';
import { Alert } from '../../components/Notification';
import Button from '../../components/Button';
import AutocompleteInput from '../components/AutocompleteInput';
import Validator, { formsValidation } from '../../actions/validators';
import ModalInput from '../components/ModalInput';
import I18n from '../../lang/i18n';

class PartForms extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      addBrandDialog: false,
      supplier: this.props.supplier,
      brand: this.props.brand,
      model: this.props.model,
      models: [],
      part: {
        pr_brand_id: this.props.brand.id,
        sup_id: this.props.supplier.id,
        md_id: this.props.model.id,

        pr_name: '',
        serial: '',
        in_stock: '',
        price: '',
        color: '',
        type: '',
        ...props.part,
      },
      types: [
        {
          id: 1,
          name: 'Part'
        },
        {
          id: 2,
          name: 'Product'
        }
      ],
      type: {}
    };

    this.inputs = {
      serial: React.createRef(),
      in_stock: React.createRef(),
      price: React.createRef(),
    };
  }

  componentWillMount() {
    if (this.props.brand.id) this.loadBrandModels(this.props.brand.id);

    if (!this.state.part.id) {
      this.props.getNextPartSerialNumber().then((data) => {
        this.handleTextInput('serial', data.data.number);
      });
    }
  }

  loadBrandModels(brandId) {
    return this.props.getBrandModels(brandId)
      .then(data => this.setState({ models: data.models }));
  }

  handleTextInput(key, value) {
    console.log(key, value);
    this.setState({
      part: {
        ...this.state.part,
        [key]: value,
      },
    });
  }

  handleAddBrandAction(name) {
    this.setState({ loading: true });
    this.props.postBrand(name)
      .then((result) => {
        this.handleBrandSelect({ name, id: result.brand.id });
      })
      .finally(() => this.setState({ loading: false }));
  }

  handleBrandSelect(brand) {
    if (!brand.id) return this.handleAddBrandAction(brand);

    this.setState({
      brand,
      model: {},
      part: {
        ...this.state.part,
        pr_brand_id: brand.id,
        md_id: undefined,
      },
    });

    this.loadBrandModels(brand.id);
  }

  handleAutocompleteItemSelect(key, keyId, item) {
    const state = {
      [key]: item,
      part: {
        ...this.state.part,
        [keyId]: item.id,
      },
    };

    this.setState(state);
  }

  handleSaveButtonPress() {
    const errors = Validator.getFormErrors(this.state.part, formsValidation.PART);
    if (errors.length > 0) return Alert.showMessage(I18n.t('translation.error'), errors.join('\n'));

    this.setState({ loading: true });

    const request = this.state.part.id
      ? this.props.updatePart
      : this.props.postPart;

    request(this.state.part)
      .then((response) => {
        this.props.onActionsSuccess(response.part);

        this.props.getNextPartSerialNumber().then((data) => {
          this.setState(prevState => ({
            part: {
              ...prevState.part,
              md_id: undefined,

              serial: data.data.number,
              in_stock: '',
              price: '',
              color: '',
            },
            model: {},
          }));
        });
      })
      .catch(() => {
        const error = () => Alert.showMessage(I18n.t('translation.error'), I18n.t('translation.checkFormData'));
        this.setState({ loading: false }, error);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  render() {
    const parts = new Set(this.props.parts.map(part => part.pr_name));
    return (
      <Scene loading={this.state.loading}>
        <Header
          text={this.state.part.id ? I18n.t('translation.editPart') : I18n.t('translation.addPart')}
          left={HeaderIcon.BACK}
          onLeftButtonPress={() => Actions.pop()}
        />

        <ModalInput
          title={I18n.t('translation.addNewBrand')}
          placeholder={I18n.t('translation.brandName')}
          visible={this.state.addBrandDialog}
          onPressConfirm={this.handleBrandSelect.bind(this)}
          onRequestClose={() => this.setState({ addBrandDialog: false })}
        />

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scene.listItemsContainer}
        >
          <View style={styles.scene.responsiveWrapper}>
            <View style={styles.scene.responsive}>
              <AutocompleteInput
                requiredMark
                enableManualInput
                placeholder={I18n.t('translation.tagsType')}
                item={this.state.type}
                items={this.state.types}
                getItemText={item => item.name}
                onItemSelected={this.handleAutocompleteItemSelect.bind(this, 'type', 'type')}
              />
              <AutocompleteInput
                requiredMark
                placeholder={I18n.t('translation.supplier')}
                searchPlaceholder={I18n.t('translation.name')}
                item={this.state.supplier}
                items={this.props.suppliers}
                autocompleteFilter={supplierSearch}
                getItemText={item => item.sup_name}
                onItemSelected={this.handleAutocompleteItemSelect.bind(this, 'supplier', 'sup_id')}
                onAddButtonPress={() => Actions.supplierFormsScene({
                  onActionsSuccess: (supplier) => {
                    this.handleAutocompleteItemSelect('supplier', 'sup_id', supplier);
                    Actions.pop();
                  },
                })}
              />
              <AutocompleteInput
                requiredMark
                enableManualInput
                placeholder={I18n.t('translation.partName')}
                searchPlaceholder={I18n.t('translation.partName')}
                item={this.state.part.pr_name}
                items={Array.from(parts)}
                autocompleteFilter={partSearch}
                onItemSelected={this.handleTextInput.bind(this, 'pr_name')}
              />
              <AutocompleteInput
                requiredMark
                placeholder={I18n.t('translation.brand')}
                searchPlaceholder={I18n.t('translation.name')}
                item={this.state.brand}
                items={this.props.brands}
                autocompleteFilter={brandSearch}
                getItemText={item => item.name}
                onItemSelected={this.handleBrandSelect.bind(this)}
                onAddButtonPress={() => this.setState({ addBrandDialog: true })}
              />
              <AutocompleteInput
                requiredMark
                placeholder={I18n.t('translation.model')}
                searchPlaceholder={I18n.t('translation.name')}
                item={this.state.model}
                items={this.state.models}
                autocompleteFilter={modelSearch}
                getItemText={item => item.m_name}
                disabled={!this.state.brand.id}
                onItemSelected={this.handleAutocompleteItemSelect.bind(this, 'model', 'md_id')}
                onAddButtonPress={() => Actions.modelsScene({
                  backHandler: this.loadBrandModels.bind(this, this.state.brand.id),
                  brand: this.state.brand,
                })}
              />
              <TextInput
                placeholder={I18n.t('translation.color')} hint
                value={this.state.part.color}
                onChangeText={this.handleTextInput.bind(this, 'color')}
              />
              <TextInput
                ref={this.inputs.serial}
                placeholder={I18n.t('translation.serial')} hint
                value={this.state.part.serial}
                keyboardType="numeric"
                onChangeText={this.handleTextInput.bind(this, 'serial')}
                onSubmitEditing={() => this.inputs.in_stock.current.focus()}
              />
              <TextInput
                requiredMark
                ref={this.inputs.in_stock}
                placeholder={I18n.t('translation.inStock')} hint
                value={this.state.part.in_stock.toString()}
                onChangeText={this.handleTextInput.bind(this, 'in_stock')}
                onSubmitEditing={() => this.inputs.price.current.focus()}
                keyboardType="numeric"
              />
              <TextInput
                requiredMark
                ref={this.inputs.price}
                placeholder={I18n.t('translation.price')} hint
                value={this.state.part.price.toString()}
                onChangeText={this.handleTextInput.bind(this, 'price')}
                keyboardType="numeric"
              />

              <Button
                onPress={this.handleSaveButtonPress.bind(this)}
                text={I18n.t('translation.save')} style={{ marginTop: 30 }}
              />
            </View>
          </View>
        </ScrollView>
      </Scene>
    );
  }

  static propTypes = {
    part: PropTypes.object,
    model: PropTypes.object,
    supplier: PropTypes.object,
    brand: PropTypes.object,
    parts: PropTypes.array.isRequired,
    brands: PropTypes.array.isRequired,
    suppliers: PropTypes.array.isRequired,
    postBrand: PropTypes.func.isRequired,
    postPart: PropTypes.func.isRequired,
    updatePart: PropTypes.func.isRequired,
    getBrandModels: PropTypes.func.isRequired,
    getNextPartSerialNumber: PropTypes.func.isRequired,
    onActionsSuccess: PropTypes.func,
  };

  static defaultProps = {
    part: {},
    model: {},
    brand: {},
    supplier: {},
    onActionsSuccess: (part) => {
      Actions.pop();

      const timer = setTimeout(() => {
        Actions.refresh({ part });

        clearTimeout(timer);
      }, 600);
    },
  };
}

export default connect(({ main }) => ({
  suppliers: main.suppliers,
  brands: main.brands.filter(b => b.status),
  parts: main.parts,
}), {
  postPart, updatePart, postBrand, getBrandModels, getNextPartSerialNumber,
})(PartForms);
