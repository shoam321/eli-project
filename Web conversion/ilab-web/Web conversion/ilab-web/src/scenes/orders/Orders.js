import React, { Component } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getOrderStatus, orderStatusItems } from '../../config/constants';
import { getOrders, orderSearch } from '../../actions/orders';
import styles, { colors } from '../../config/styles';
import Scene from '../../components/Scene';
import TextInput, { TextInputIcon } from '../../components/TextInput';
import Header, { HeaderIcon } from '../components/Header';
import Filter from '../components/Filter';
import I18n from '../../lang/i18n';
import Button from '../../components/Button';

class OrdersScene extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      filter: false,
      status: 0,
      search: '',
    };
  }

  componentWillMount() {
    this.setState({ loading: true });
    this.props.getOrders()
      .finally(() => this.setState({ loading: false }));
  }

  orderFilter(item) {
    if (this.state.status === 0 || item.status === this.state.status) return orderSearch(item, this.state.search);
    return false;
  }

  static renderOrdersListItem(order) {
    const status = getOrderStatus(order.status);
    return (
      <TouchableOpacity
        key={order.un_id}
        onPress={() => Actions.orderPartsScene({ order })}
        style={styles.component.listItemButtonContainer}
      >
        <View>
          <Text style={[styles.component.listItemSubText, { color: status.color }]}>
            {I18n.t(status.name)}
          </Text>
          <Text style={styles.component.listItemMainText}>{(order.total_cost || 0).toFixed(2)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.component.listItemSubText}>{order.date_add}</Text>
          <Text style={styles.component.listItemText}>{order.sup_name}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <Scene>
        <Header
          text={I18n.t('translation.orders')}
          left={HeaderIcon.MENU}
          right={HeaderIcon.CART}
          onLeftButtonPress={() => Actions.menuScene()}
          onRightButtonPress={() => Actions.cartScene()}
        />

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            <TextInput
              placeholder={I18n.t('translation.supplierOrderId')}
              onChangeText={search => this.setState({ search })}
              left={<TextInputIcon.Search />}
              right={<TextInputIcon.Filter color={this.state.status ? colors.button : colors.blackBackground} />}
              onRightButtonPress={() => this.setState({ filter: true })}
              containerStyle={styles.scene.searchInputContainer}
            />
          </View>
        </View>

        <Filter
          title={I18n.t('translation.orderFilter')}
          visible={this.state.filter}
          onResetFilter={() => this.setState({ status: 0 })}
          onRequestClose={() => this.setState({ filter: false })}
        >
          {orderStatusItems.map(status => (
            <TouchableOpacity
              key={status.id}
              onPress={() => this.setState({
                status: this.state.status === status.id ? 0 : status.id,
              })}
            >
              <TextInput
                editable={false} value={I18n.t(status.name)}
                right={this.state.status === status.id
                && <TextInputIcon.Check style={undefined} />
                }
              />
            </TouchableOpacity>
          ))}
        </Filter>

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
              {this.props.orders
                .filter(item => this.orderFilter(item))
                .map(order => OrdersScene.renderOrdersListItem(order))
              }
            </View>
          </View>
        </ScrollView>

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            <Button
              text={I18n.t('translation.addNewOrderToCart')}
              onPress={() => Actions.cartFormsScene()}
              style={{ marginVertical: 30 }}
            />
          </View>
        </View>
      </Scene>
    );
  }

  static propTypes = {
    orders: PropTypes.array.isRequired,
    getOrders: PropTypes.func.isRequired,
  }
}

export default connect(({ main }) => ({
  orders: main.orders,
}), { getOrders })(OrdersScene);
