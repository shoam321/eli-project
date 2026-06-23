import React, { Component } from 'react';
import {
  Text, View, Switch, ScrollView, RefreshControl, TouchableOpacity,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { postBrand, setBrandStatus, getBrands } from '../../actions/brands';
import styles, { colors } from '../../config/styles';
import Scene from '../../components/Scene';
import Header, { HeaderIcon } from '../components/Header';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import { Alert } from '../../components/Notification';
import I18n from '../../lang/i18n';

class Brands extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      expander: false,
      brand: '',
    };
  }

  componentWillMount() {
    this.setState({ loading: true });
    this.props.getBrands()
      .finally(() => this.setState({ loading: false }));
  }

  handleAddButtonPress() {
    if (this.state.brand.length === 0) return Alert.showMessage(I18n.t('translation.error'), I18n.t('translation.brandFieldIsRequired'));

    this.setState({ loading: true });
    this.props.postBrand(this.state.brand)
      .then(() => this.setState({ loading: false, brand: '' }))
      .catch(() => this.setState({ loading: false }));
  }

  handleBrandStatusChange(id) {
    const brand = { ...this.props.brands[id] };
    brand.status = !brand.status;
    this.setState({ loading: true });
    this.props.setBrandStatus(brand.id, brand.status)
      .finally(() => this.setState({ loading: false }));
  }

  renderBrandButton(brand, id) {
    return (
      <TouchableOpacity
        key={brand.id}
        onPress={() => Actions.brandFormsScene({ brand })}
        style={[styles.component.listItemButtonInfoContainer]}
      >
        <Text style={[styles.component.listItemMainText, { flex: 1, flexWrap: 'wrap' }]}>{brand.name}</Text>
        <Switch
          style={styles.component.switchButton}
          onValueChange={() => this.handleBrandStatusChange(id)}
          value={!!brand.status} tintColor={colors.darkGray}
          thumbTintColor={colors.white} onTintColor={colors.button}
        />
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <Scene>
        <Header
          text={I18n.t('translation.brands')} left={HeaderIcon.BACK}
          onLeftButtonPress={() => Actions.pop()}
          right={this.state.expander ? HeaderIcon.CLOSE : HeaderIcon.ADD}
          onRightButtonPress={() => this.setState({ expander: !this.state.expander })}
        />

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            {this.state.expander
            && (
            <View style={styles.scene.listItemsContainer}>
              <TextInput
                requiredMark
                placeholder={I18n.t('translation.name')} hint value={this.state.brand}
                onChangeText={brand => this.setState({ brand })}
              />
              <Button
                onPress={this.handleAddButtonPress.bind(this)}
                text={I18n.t('translation.addBrand')} style={{ marginTop: 30 }}
              />
            </View>
            )
            }
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
              {
                this.props.brands
                  .filter(item => item.company_id !== 0)
                  .map(this.renderBrandButton.bind(this))
              }
            </View>
          </View>
        </ScrollView>
      </Scene>
    );
  }

  static propTypes = {
    brands: PropTypes.array.isRequired,
    getBrands: PropTypes.func.isRequired,
    postBrand: PropTypes.func.isRequired,
    setBrandStatus: PropTypes.func.isRequired,
  };
}

export default connect(({ main }) => ({
  brands: main.brands,
}), { getBrands, postBrand, setBrandStatus })(Brands);
