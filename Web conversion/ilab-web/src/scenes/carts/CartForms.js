import React, { Component } from 'react';
import {
  ScrollView, Text, TouchableOpacity, View,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import I18n from '../../lang/i18n';
import { supplierSearch } from '../../actions/suppliers';
import { brandSearch, postBrand, getSupplierBrands } from '../../actions/brands';
import { modelSearch, getBrandModels, getModelsBySuplierBrand } from '../../actions/models';
import { getSupplierBrandModelParts, partSearch } from '../../actions/parts';
import { postOrder, postOrderParts } from '../../actions/orders';
import { addCartItem } from '../../actions/carts';
import styles, { colors } from '../../config/styles';
import Scene from '../../components/Scene';
import { TextInputIcon } from '../../components/TextInput';
import IntegerInput from '../../components/IntegerInput';
import Header, { HeaderIcon } from '../components/Header';
import { Alert } from '../../components/Notification';
import ModalInput from '../components/ModalInput';
import Button from '../../components/Button';
import AutocompleteInput from '../components/AutocompleteInput';
import Validator, { formsValidation } from '../../actions/validators';

class CartForms extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      addBrandDialog: false,
      expanded: -1,
      supplier: props.supplier,
      brand: props.brand,
      model: props.model,
      part: props.part,
      amount: '1',
      models: [],
      parts: [],
      brands: [],
      cart: {
        parts: [],
        ...props.cart,
      },
    };
  }

  componentWillMount() {
    if (this.props.brand.id) this.loadBrandModels(this.props.brand.id);
  }

  componentWillReceiveProps(props) {
    this.setState({ part: props.part });
    this.loadSupplierBrandModelPart();
  }

  loadBrandModels(brandId) {
     this.props.getModelsBySuplierBrand(this.state.supplier.id, brandId)
      .then(data => this.setState({ models: data.models }));
  }

  handleOrderPartInput(key, item) {
    this.setState({ [key]: item });
  }

  handleSupplierSelect(supplier) {
    this.handleBrandSelect({ remove: true }); // Clear input
    this.handleOrderPartInput('supplier', supplier);
    this.props.getSupplierBrands(supplier.id)
      .then(data => this.setState({ brands: data.brands }));
  }

  handleBrandSelect(brand) {
    if (!brand.id && !brand.remove) return this.handleAddBrandAction(brand);

    this.handleOrderPartInput('brand', brand);
    this.handleModelSelect({}); // Clear model input

    if (brand.id) {
      this.loadBrandModels(brand.id);
    }
  }

  handleModelSelect(model) {
    this.setState({ model });
    this.handleOrderPartInput('part', {});
    if (!model.id) return;

    this.loadSupplierBrandModelPart({ model_id: model.id });
  }

  loadSupplierBrandModelPart({ supplier_id = this.state.supplier.id, brand_id = this.state.brand.id, model_id = this.state.model.id } = {}) {
    if (supplier_id && brand_id && model_id) {
      this.props.getSupplierBrandModelParts(supplier_id, brand_id, model_id)
        .then((data) => {
          this.setState({ parts: data.parts });
        })
        .catch(() => {
          // Handle
        });
    }
  }

  handleAddBrandAction(name) {
    this.setState({ loading: true });

    this.props.postBrand(name)
      .then((result) => {
        this.handleBrandSelect({ name, id: result.brand.id });
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  handleAddToListButtonPress() {
    const orderPart = {
      id: Date.now(), // For render key
      ord_id: this.props.cart.ord_id,
      supplier_id: this.state.supplier.id,
      brand_id: this.state.brand.id,
      part_id: this.state.part.id,
      md_id: this.state.model.id,
      amount: this.state.amount,
      part: this.state.part, // for render only
      m_name: this.state.model.m_name, // for render only
    };

    const errors = Validator.getFormErrors(orderPart, formsValidation.CART_PART);
    if (errors.length > 0) return Alert.showMessage(I18n.t('translation.error'), errors.join('\n'));

    this.state.cart.parts.push(orderPart);
    this.setState({ cart: this.state.cart });
  }

  handleSaveButtonPress() {
    if (this.state.cart.parts.length) {
      this.setState({ loading: true });

      this.props.addCartItem(this.state.cart.parts)
        .then(response => this.props.onActionsSuccess(response.cart_items))
        .catch(() => {
          const error = () => Alert.showMessage(I18n.t('translation.error'), I18n.t('translation.checkFormData'));
          this.setState({ loading: false }, error);
        });
    }
  }

  handlePartPress(part) {
    this.setState({ expanded: this.state.expanded === part.id ? false : part.id });
  }

  handleRemovePartPress(index) {
    this.state.cart.parts.splice(index, 1);
    this.setState({ cart: this.state.cart });
  }

  renderOrderPartsListItem(part, id) {
    return (
      <React.Fragment key={part.id}>
        <View style={styles.component.removePartContainer}>
          <TouchableOpacity
            onPress={this.handlePartPress.bind(this, part)}
            style={[styles.component.listItemButtonContainer, { height: 42, flex: 1 }]}
          >
            <Text style={styles.component.listItemMainText}>
              <TextInputIcon.Triangle />
              {part.part.pr_name}
              {' '}
              {part.m_name}
            </Text>
            <Text style={styles.component.listItemText}>{part.amount}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.handleRemovePartPress.bind(this, id)}
            style={[styles.component.imageCheckIndicator, styles.component.removePartButton]}
          >
            <MaterialIcon name="close" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>

        {this.state.expanded === part.id
        && (
        <View style={{ padding: 10, marginLeft: 50 }}>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.brand')}</Text>
            <Text style={styles.component.listItemDarkSubText}>{part.part.br_name}</Text>
          </View>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.supplier')}</Text>
            <Text style={styles.component.listItemDarkSubText}>{part.part.sup_name}</Text>
          </View>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.price')}</Text>
            <Text style={styles.component.listItemDarkSubText}>{part.part.price}</Text>
          </View>
        </View>
        )
        }
      </React.Fragment>
    );
  }

  render() {
    return (
      <Scene loading={this.state.loading}>
        <Header
          text={I18n.t('translation.addShoppingCart')}
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

        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.scene.responsiveWrapper}>
            <View style={styles.scene.responsive}>
              <View style={styles.scene.listItemsContainer}>
                <AutocompleteInput
                  requiredMark
                  placeholder={I18n.t('translation.supplier')}
                  searchPlaceholder={I18n.t('translation.name')}
                  item={this.state.supplier}
                  items={this.props.suppliers}
                  autocompleteFilter={supplierSearch}
                  getItemText={item => item.sup_name}
                  onItemSelected={this.handleSupplierSelect.bind(this)}
                  onAddButtonPress={() => Actions.supplierFormsScene()}
                />
                <AutocompleteInput
                  requiredMark
                  placeholder={I18n.t('translation.brand')}
                  searchPlaceholder={I18n.t('translation.name')}
                  item={this.state.brand}
                  items={this.state.brands}
                  autocompleteFilter={brandSearch}
                  getItemText={item => item.name}
                  disabled={!this.state.supplier.id}
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
                  onItemSelected={this.handleModelSelect.bind(this)}
                  onAddButtonPress={() => Actions.modelsScene({
                    backHandler: this.loadBrandModels.bind(this, this.state.brand.id),
                    brand: this.state.brand,
                  })}
                />
                <AutocompleteInput
                  requiredMark
                  placeholder={I18n.t('translation.part')}
                  searchPlaceholder={I18n.t('translation.name')}
                  item={this.state.part}
                  items={this.state.parts}
                  autocompleteFilter={partSearch}
                  getItemText={item => `${item.pr_name ? `${item.pr_name} ` : ''}${item.color || ''}`}
                  disabled={!this.state.model.id}
                  onItemSelected={this.handleOrderPartInput.bind(this, 'part')}
                  onAddButtonPress={() => {
                    Actions.partFormsScene({
                      supplier: this.state.supplier,
                      brand: this.state.brand,
                      model: this.state.model,
                    });
                  }}
                />
                <IntegerInput
                  requiredMark
                  onChangeValue={this.handleOrderPartInput.bind(this, 'amount')}
                  value={this.state.amount.toString()} min={0}
                  placeholder={I18n.t('translation.amount')} hint
                />

                <Button
                  text={I18n.t('translation.addToList')} onPress={this.handleAddToListButtonPress.bind(this)}
                  style={{ marginTop: 30, backgroundColor: colors.blackBackground }}
                />
              </View>

              <Header text={I18n.t('translation.partList')} />

              <View style={styles.scene.listItemsContainer}>
                {this.state.cart.parts.map((part, id) => this.renderOrderPartsListItem(part, id))}
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            <Button
              text={I18n.t('translation.addToCart')}
              onPress={this.handleSaveButtonPress.bind(this)}
              style={styles.scene.buttonSize}
            />
          </View>
        </View>

      </Scene>
    );
  }

  static propTypes = {
    cart: PropTypes.object,
    part: PropTypes.object,
    brand: PropTypes.object,
    model: PropTypes.object,
    supplier: PropTypes.object,
    suppliers: PropTypes.array.isRequired,
    brands: PropTypes.array.isRequired,
    postBrand: PropTypes.func.isRequired,
    addCartItem: PropTypes.func.isRequired,
    getBrandModels: PropTypes.func.isRequired,
    getSupplierBrandModelParts: PropTypes.func.isRequired,
    onActionsSuccess: PropTypes.func,
  };

  static defaultProps = {
    cart: {},
    part: {},
    model: {},
    brand: {},
    supplier: {},
    onActionsSuccess: (data) => {
      Actions.pop();

      const timer = setTimeout(() => {
        Actions.refresh({ data });

        clearTimeout(timer);
      }, 600);
    },
  };
}

export default connect(({ main }) => ({
  suppliers: main.suppliers,
  brands: main.brands.filter(b => b.status),
}), {
  addCartItem,
  postOrder,
  postOrderParts,
  getSupplierBrandModelParts,
  getBrandModels,
  getSupplierBrands,
  postBrand,
  getModelsBySuplierBrand
})(CartForms);
