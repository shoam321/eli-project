import React, { Component } from 'react';
import {
  Text, View, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getSuppliers, supplierSearch } from '../../actions/suppliers';
import styles from '../../config/styles';
import Scene from '../../components/Scene';
import TextInput, { TextInputIcon } from '../../components/TextInput';
import Header, { HeaderIcon } from '../components/Header';
import I18n from '../../lang/i18n';

class SuppliersScene extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      search: '',
    };
  }

  componentWillMount() {
    this.setState({ loading: true });
    this.props.getSuppliers()
      .finally(() => this.setState({ loading: false }));
  }

  static renderSuppliersListItem(supplier) {
    return (
      <TouchableOpacity
        key={supplier.id}
        onPress={() => Actions.supplierScene({ supplier })}
        style={styles.component.listItemButtonInfoContainer}
      >
        <View style={{ flex: 1, marginRight: 5 }}>
          <Text style={styles.component.listItemText}>{supplier.sup_name}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.component.listItemText}>{supplier.sup_phone}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <Scene>
        <Header
          text={I18n.t('translation.suppliers')}
          left={HeaderIcon.MENU}
          right={HeaderIcon.ADD}
          additionRight={HeaderIcon.CART}
          onAdditionRightButtonPress={() => Actions.cartScene()}
          onLeftButtonPress={() => Actions.menuScene()}
          onRightButtonPress={() => Actions.supplierFormsScene()}
        />

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            <TextInput
              placeholder={I18n.t('translation.namePhone')}
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
              {this.props.suppliers
                .filter(item => supplierSearch(item, this.state.search))
                .map(supplier => SuppliersScene.renderSuppliersListItem(supplier))
              }
            </View>
          </View>
        </ScrollView>
      </Scene>
    );
  }

  static propTypes = {
    suppliers: PropTypes.array.isRequired,
    getSuppliers: PropTypes.func.isRequired,
  }
}

export default connect(({ main }) => ({
  suppliers: main.suppliers,
}), {
  getSuppliers,
})(SuppliersScene);
