import React, { Component } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
  getCartItems,
  cartPartSearch,
  updateCartItem,
  deleteCartItem,
} from '../../actions/carts';

import { postOrder } from '../../actions/orders';

import styles, { colors } from '../../config/styles';
import Scene from '../../components/Scene';
import TextInput, { TextInputIcon } from '../../components/TextInput';
import Header, { HeaderIcon } from '../components/Header';
import Button from '../../components/Button';
import I18n from '../../lang/i18n';
import IntegerInput from '../../components/IntegerInput';
import { Alert, Toast } from '../../components/Notification';
import Checkbox from '../../components/Checkbox';
import ModalAction from '../components/ModalAction';

class CartScene extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      activity: false,
      expanded: -1,
      cart: [],
      cartInfo: [],
      totalPrice: 0,
      status: 0,
      selectedItems: [],
      search: '',
      showPartPriceModal: false,
      partForUpdate: {},
      // For bad components which need force rerender
      refreshedComponent: true,
    };
  }

  componentWillMount() {
    this.loadCart();
  }

  componentWillReceiveProps() {
    this.loadCart();
  }

  selectItem(cart, selected) {
    if (selected) {
      this.setState({
        selectedItems: [
          ...this.state.selectedItems,
          cart,
        ],
      });
    } else {
      this.setState({
        selectedItems: this.state.selectedItems.filter(selectedItem => selectedItem.id !== cart.id),
      });
    }
  }

  selectAllItems(selected) {
    if (selected) {
      this.setState({
        selectedItems: this.state.cart.filter(item => this.cartPartFilter(item)),
      });
    } else {
      this.setState({
        selectedItems: [],
      });
    }
  }

  loadCart() {
    this.setState({ loading: true }, () => this.props.getCartItems()
      .then(result => this.setState({
        cart: result.card_items,
        cartInfo: result.card_items,
        loading: false,
        totalPrice: result.total_price,
        refreshedComponent: false,
      }, () => {
        this.setState({ refreshedComponent: true });
      }))
      .catch(() => this.setState({ loading: false })));
  }

  cartPartFilter(item) {
    if (this.state.status === 0 || item.status === this.state.status) return cartPartSearch(item, this.state.search);
    return false;
  }

  handlePartPress(part) {
    this.setState({ expanded: this.state.expanded === part.id ? false : part.id });
  }

  handleSaveCartItem(cart) {
    if (Number(this.state.cart.find(item => item.id === cart.id).part_price) === Number(cart.part_price)) {
      this.props.updateCartItem(cart.id, cart.amount, cart.part_price, 0, cart.part_id, cart.supplier_id).then(() => {
        Toast.showMessage('Cart', 'Update amount: success');
        this.loadCart();
      });
    } else {
      this.setState({
        showPartPriceModal: true,
        partForUpdate: cart,
      });
    }
  }

  handleSavePartPrice(part, updateRootPart) {
    this.props.updateCartItem(part.id, part.amount, part.part_price, updateRootPart).then(() => {
      Toast.showMessage('Cart', 'Update amount: success');
      this.loadCart();
    });
  }

  async handleDeleteItem(cart) {
    await this.props.deleteCartItem(cart).then(() => {
      Toast.showMessage('Cart', 'Items has been deleted');
      this.loadCart();
    });
  }

  handleBulkDeleteItems() {
    if (this.state.selectedItems.length !== 0) {
      this.setState({ loading: true }, async () => {
        try {
          await this.handleDeleteItem(this.state.selectedItems.map(item => item.id));
        } catch (e) {
          const error = () => Alert.showMessage(I18n.t('translation.error'), I18n.t('translation.checkFormData'));
          this.setState({ loading: false }, error);
        }

        this.setState({
          selectedItems: [],
        });
      });
    }
  }


  handleSendOrderPress() {
    if (this.state.selectedItems.length !== 0) {
      this.setState({ loading: true }, () => {
        this.props.postOrder(this.state.selectedItems.map(item => ({
          amount: item.amount,
          sup_id: item.supplier_id,
          brand_id: item.brand_id,
          pr_id: item.part_id,
          pr_price: item.part_price,
          cart_item_id: item.id,
        })))
          .then(() => {
            this.loadCart();

            this.setState({
              selectedItems: [],
            });
          })
          .catch(() => {
            const error = () => Alert.showMessage(I18n.t('translation.error'), I18n.t('translation.checkFormData'));
            this.setState({ loading: false }, error);
          });
      });
    }
  }

  renderCartPartsListItem(cart) {
    return (
      <React.Fragment key={cart.id}>
        <View
          style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
        >
          <Checkbox
            value={!!this.state.selectedItems.find(selectedItem => selectedItem.id === cart.id)}
            iconSize={28}
            style={{ position: 'absolute', left: -26 }}
            onChange={this.selectItem.bind(this, cart)}
          />

          <View style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={this.handlePartPress.bind(this, cart)}
              style={[styles.component.listItemButtonInfoContainer, { alignItems: 'flex-start' }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.component.listItemSubText}>{cart.model}</Text>
                <Text style={styles.component.listItemMainText}>
                  {cart.pr_name}
                  {' '}
                  {cart.color}
                </Text>
              </View>
              <View style={{ marginRight: 10, alignItems: 'flex-end' }}>
                <Text style={styles.component.listItemSubText}>{I18n.t('translation.amount')}</Text>
                <Text style={styles.component.listItemMainText}>
                  {cart.amount}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.component.listItemSubText}>{I18n.t('translation.totalCost')}</Text>
                <Text style={styles.component.listItemMainText}>
                  {cart.part_price && cart.amount ? +(`${Math.round(`${cart.part_price * cart.amount}e+2`)}e-2`) : 0 }
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {this.state.expanded === cart.id
        && (
        <View style={{ padding: 10, marginLeft: 50 }}>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.date')}</Text>
            <Text style={styles.component.listItemDarkSubText}>{cart.date_add}</Text>
          </View>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.brand')}</Text>
            <Text style={styles.component.listItemDarkSubText}>{cart.br_name}</Text>
          </View>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.supplier')}</Text>
            <Text style={styles.component.listItemDarkSubText}>{cart.sup_name}</Text>
          </View>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.serial')}</Text>
            <Text style={styles.component.listItemDarkSubText}>{cart.serial}</Text>
          </View>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.color')}</Text>
            <Text style={styles.component.listItemDarkSubText}>{cart.color}</Text>
          </View>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.price')}</Text>
            <View style={styles.component.blockListItemDarkSubText}>
              <IntegerInput
                onChangeValue={(value) => {
                  this.setState({
                    cartInfo: this.state.cartInfo.map((cartInfo) => {
                      if (cartInfo.id === cart.id) {
                        return {
                          ...cartInfo,
                          part_price: value,
                        };
                      } else {
                        return cartInfo;
                      }
                    }),
                  });
                }}
                refreshedComponent={this.state.refreshedComponent}
                value={cart.part_price.toString()} min={0}
                containerStyle={{
                  borderBottomWidth: 0, width: 100, justifyContent: 'flex-end', marginBottom: 5, paddingLeft: 0,
                }}
                textStyle={{ fontSize: 13, textAlign: 'right', paddingHorizontal: 0 }}
              />
            </View>
          </View>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.amount')}</Text>
            <View style={styles.component.blockListItemDarkSubText}>
              <IntegerInput
                onChangeValue={(value) => {
                  this.setState({
                    cartInfo: this.state.cartInfo.map((cartInfo) => {
                      if (cartInfo.id === cart.id) {
                        return {
                          ...cartInfo,
                          amount: value,
                        };
                      } else {
                        return cartInfo;
                      }
                    }),
                  });
                }}
                refreshedComponent={this.state.refreshedComponent}
                value={cart.amount.toString()} min={0}
                containerStyle={{
                  borderBottomWidth: 0, width: 100, justifyContent: 'flex-end', marginBottom: 5, paddingLeft: 0,
                }}
                textStyle={{ fontSize: 13, textAlign: 'right', paddingHorizontal: 0 }}
              />
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 5 }}>
            <Button
              text={I18n.t('translation.save')}
              onPress={this.handleSaveCartItem.bind(this, this.state.cartInfo.find(partInfo => partInfo.id === cart.id))}
              textStyle={styles.component.textInputButtonText}
              style={styles.component.textInputButtonContainer}
            />

            <Button
              text={I18n.t('translation.delete')}
              onPress={this.handleDeleteItem.bind(this, [cart.id])}
              textStyle={styles.component.textInputButtonText}
              style={[styles.component.textInputButtonContainer, { backgroundColor: colors.statusRed }]}
            />
          </View>
        </View>
        )
        }
      </React.Fragment>
    );
  }

  render() {
    return (
      <Scene loading={this.state.activity}>
        <Header
          text={I18n.t('translation.shoppingCart')}
          left={HeaderIcon.MENU}
          right={HeaderIcon.CART_ADD}
          onLeftButtonPress={() => Actions.menuScene()}
          onRightButtonPress={() => Actions.cartFormsScene()}
        />

        <ModalAction
          visible={this.state.showPartPriceModal}
          onRequestClose={() => {
            this.setState({
              showPartPriceModal: false,
            });
          }}
          onLeftHandler={this.handleSavePartPrice.bind(this, this.state.partForUpdate, 0)}
          onRightHandler={this.handleSavePartPrice.bind(this, this.state.partForUpdate, 1)}
          title={I18n.t('translation.doYouWantChangePrice')}
          leftButtonText={I18n.t('translation.forThisCase')}
          rightButtonText={I18n.t('translation.forThisAndAllCases')}
        />

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            <View
              style={{ width: '100%' }}
            >
              <Checkbox
                value={this.state.cart.filter(item => this.cartPartFilter(item)).length === this.state.selectedItems.length}
                iconSize={28}
                style={{ position: 'absolute', left: 4, top: 15 }}
                onChange={this.selectAllItems.bind(this)}
              />

              <TextInput
                placeholder={I18n.t('translation.partBrand')}
                onChangeText={search => this.setState({ search })}
                left={<TextInputIcon.Search />}
                containerStyle={styles.scene.searchInputContainer}
              />
            </View>
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
              {this.state.cart
                .filter(item => this.cartPartFilter(item))
                .map(part => this.renderCartPartsListItem(part))
              }
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.scene.orderTotalStatusText}>
                  <Text>
                    {I18n.t('translation.selectedItems', {
                      length: this.state.selectedItems.length,
                    })}
                  </Text>
                </Text>

                <Text style={styles.scene.orderTotalStatusText}>
                  {I18n.t('translation.total', { total: this.state.totalPrice })}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.scene.responsiveWrapper}>
          <View style={[styles.scene.responsive, { flexDirection: 'row', justifyContent: 'space-around' }]}>
            <Button
              text={I18n.t('translation.sendOrder')}
              onPress={this.handleSendOrderPress.bind(this)}
              style={{ marginVertical: 30 }}
            />

            <Button
              text={I18n.t('translation.delete')}
              onPress={this.handleBulkDeleteItems.bind(this)}
              style={{ marginVertical: 30, backgroundColor: colors.statusRed }}
            />
          </View>
        </View>
      </Scene>
    );
  }

  static propTypes = {
    postOrder: PropTypes.func.isRequired,
    updateCartItem: PropTypes.func.isRequired,
    deleteCartItem: PropTypes.func.isRequired,
    getCartItems: PropTypes.func.isRequired,
  }
}

export default connect(() => ({}), {
  getCartItems, updateCartItem, postOrder, deleteCartItem,
})(CartScene);
