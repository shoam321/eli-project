import React, { Component } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { getParts, partSearch } from '../../actions/parts';
import styles, { colors } from '../../config/styles';
import Scene from '../../components/Scene';
import TextInput, { TextInputIcon } from '../../components/TextInput';
import Header, { HeaderIcon } from '../components/Header';
import I18n from '../../lang/i18n';
import AutocompleteInput from '../components/AutocompleteInput';
import { brandSearch } from '../../actions/brands';
import { getBrandModels, modelSearch } from '../../actions/models';

class PartsScene extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      search: '',
      brand: {},
      model: {},
      models: [],
      types: [
        {
          name: 'All'
        },
        {
          id: 1,
          name: 'Parts'
        },
        {
          id: 2,
          name: 'Products'
        }
      ],
      type: {name: 'All'}
    };
  }

  componentWillMount() {
    this.setState({ loading: true });
    this.props.getParts()
      .finally(() => this.setState({ loading: false }));
  }

  loadBrandModels(brandId) {
    return this.props.getBrandModels(brandId)
      .then(data => this.setState({ models: data.models }));
  }

  handleBrandSelect(brand) {
    this.setState({
      brand,
      model: {},
    });

    if (brand.id) {
      this.loadBrandModels(brand.id);
    }
  }

  handleTypeSelect(type){
    this.setState({
      type
    });
  }

  handleAutocompleteItemSelect(key, keyId, item) {
    this.setState({
      [key]: item,
    });
  }

  static renderPartsListItem(part) {
    return (
      <TouchableOpacity
        key={part.id}
        onPress={() => Actions.partScene({ part })}
        style={styles.component.listItemButtonContainer}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.component.listItemSubText}>
            {I18n.t('translation.amountNumber', {
              number: part.in_stock,
            })}
          </Text>
          <Text style={styles.component.listItemMainText}>
            {part.pr_name}
            {' '}
            {part.color}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.component.listItemSubText}>{part.sup_name}</Text>
          <Text style={styles.component.listItemText}>{part.m_name}</Text>
        </View>
        <View style={{ marginLeft: 10 }}>
          <TouchableOpacity
            onPress={() => Actions.cartFormsScene({
              supplier: { id: part.sup_id, sup_name: part.sup_name },
              brand: { id: part.pr_brand_id, name: part.br_name },
              model: { id: part.md_id, m_name: part.m_name },
              part,
            })}
          >
            <MaterialIcons name="add-shopping-cart" size={34} color={colors.button} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <Scene>
        <Header
          text={I18n.t('translation.parts')}
          left={HeaderIcon.MENU}
          right={HeaderIcon.ADD}
          additionRight={HeaderIcon.CART}
          onAdditionRightButtonPress={() => Actions.cartScene()}
          onLeftButtonPress={() => Actions.menuScene()}
          onRightButtonPress={() => Actions.partFormsScene({
            onActionsSuccess: () => {},
          })}
        />

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            <TextInput
              placeholder={I18n.t('translation.supplierPartModel')}
              onChangeText={search => this.setState({ search })}
              left={<TextInputIcon.Search />}
              containerStyle={styles.scene.searchInputContainer}
            />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scene.listItemsContainer}
          refreshControl={(
            <RefreshControl
              refreshing={this.state.loading}
              onRefresh={this.componentWillMount.bind(this)}
            />
)}
        >
          <View style={styles.scene.responsiveWrapper}>
            <View style={styles.scene.responsive}>
              <AutocompleteInput
                placeholder={I18n.t('translation.tagsType')}
                item={this.state.type}
                items={this.state.types}
                getItemText={item => item.name}
                onItemSelected={this.handleTypeSelect.bind(this)}
              />
              <AutocompleteInput
                placeholder={I18n.t('translation.brand')}
                searchPlaceholder={I18n.t('translation.name')}
                item={this.state.brand}
                items={this.props.brands}
                clearable
                autocompleteFilter={brandSearch}
                getItemText={item => item.name}
                onItemSelected={this.handleBrandSelect.bind(this)}
              />
              <AutocompleteInput
                placeholder={I18n.t('translation.model')}
                searchPlaceholder={I18n.t('translation.name')}
                item={this.state.model}
                items={this.state.models}
                clearable
                autocompleteFilter={modelSearch}
                getItemText={item => item.m_name}
                disabled={!this.state.brand.id}
                onItemSelected={this.handleAutocompleteItemSelect.bind(this, 'model', 'model')}
              />

              {this.props.parts
                .filter(item => partSearch(item, this.state.search))
                .filter(item => !this.state.type.id || this.state.type.id === item.type)
                .filter(item => !this.state.brand.id || this.state.brand.id === item.pr_brand_id)
                .filter(item => !this.state.model.id || this.state.model.id === item.md_id)
                .map(part => PartsScene.renderPartsListItem(part))
              }
            </View>
          </View>
        </ScrollView>
      </Scene>
    );
  }

  static propTypes = {
    parts: PropTypes.array.isRequired,
    brands: PropTypes.array.isRequired,
    getBrandModels: PropTypes.func.isRequired,
    getParts: PropTypes.func.isRequired,
  }
}

export default connect(({ main }) => ({
  parts: main.parts,
  brands: main.brands.filter(b => b.status),
}), { getParts, getBrandModels })(PartsScene);
