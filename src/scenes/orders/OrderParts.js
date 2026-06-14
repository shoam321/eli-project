import React, { Component } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl, Clipboard,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import Share from 'react-native-share';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
  getOrderParts, receivedOrderPart, expectedOrderPart, missingOrderPart, canceledOrderPart,
  getOrders, orderPartSearch, updateOrderPart, restoreOrderOriginalData,
} from '../../actions/orders';
import { getAppLanguage } from '../../actions/user';
import { orderStatus, orderStatusItems, remote } from '../../config/constants';
import styles, { colors } from '../../config/styles';
import Scene from '../../components/Scene';
import TextInput, { TextInputIcon } from '../../components/TextInput';
import Header, { HeaderIcon } from '../components/Header';
import Button from '../../components/Button';
import Filter from '../components/Filter';
import I18n from '../../lang/i18n';
import { getArrayItemByKey } from '../../actions/common';
import IntegerInput from '../../components/IntegerInput';
import Autocomplete from '../components/Autocomplete';
import { Toast } from '../../components/Notification';
import ConfirmationDialog from '../components/ConfirmationDialog';
import AlertDialog from '../components/AlertDialog';
import ModalAction from '../components/ModalAction';
import Checkbox from '../../components/Checkbox';

class OrderPartsScene extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      activity: false,
      expanded: -1,
      parts: [],
      partsInfo: [],
      totalPrice: 0,
      totalStatus: 0,
      filter: false,
      status: 0,
      selectedItems: [],
      isBulkOperation: false,
      selectedPart: {},
      selectedPartStatus: {},
      showPartStatusModal: false,
      showPartReceivedStatusModal: false,
      showPartOtherStatusModal: false,
      showPartCancelBulkStatusModal: false,
      showRestoreOrderDataModal: false,
      showPartReceiveBulkStatusModal: false,
      showAlertDialogPart: false,
      // For bad components which need force rerender
      refreshedComponent: true,
      showPartPriceModal: false,
      partForUpdate: {},
      search: '',
    };
  }

  componentWillMount() {
    this.loadOrderParts();
  }

  showBulkOperation(part) {
    this.setState({
      isBulkOperation: true,
      selectedItems: [part],
    });
  }

  closeBulkOperation() {
    this.setState({
      isBulkOperation: false,
      selectedItems: [],
    });
  }

  selectItem(part, selected) {
    if (selected) {
      this.setState({
        selectedItems: [
          ...this.state.selectedItems,
          part,
        ],
      });
    } else {
      this.setState({
        selectedItems: this.state.selectedItems.filter(selectedItem => selectedItem.id !== part.id),
      });
    }
  }

  selectAllItems(selected) {
    if (selected) {
      this.setState({
        selectedItems: this.state.parts.filter(item => this.orderPartFilter(item)),
      });
    } else {
      this.setState({
        selectedItems: [],
      });
    }
  }

  loadOrderParts() {
    this.setState({ loading: true });

    return this.props.getOrderParts(this.props.order.ord_id, this.props.order.sup_id)
      .then(result => this.setState({
        parts: result.parts,
        partsInfo: result.parts,
        loading: false,
        totalPrice: result.total_price,
        totalStatus: result.total_status,
        refreshedComponent: false,
      }, () => {
        this.setState({ refreshedComponent: true });
      }))
      .catch(() => this.setState({ loading: false }));
  }

  backToAllOrders() {
    if (this.state.totalStatus === orderStatus.MISSING || this.state.totalStatus === orderStatus.EXPECTED) {
      this.setState({
        showAlertDialogPart: true,
      });
    } else {
      Actions.pop();
    }
  }

  orderPartFilter(item) {
    if (this.state.status === 0 || item.status === this.state.status) return orderPartSearch(item, this.state.search);
    return false;
  }

  handleShareButtonPress() {
    this.props.getAppLanguage().then((lang) => {
      new Promise((resolve) => {
        Clipboard.setString(`${this.props.order.sup_phone || ''}`);
        Toast.showMessage(I18n.t('translation.phoneNumber'), I18n.t('translation.copiedToClipboard'));

        const timer = setTimeout(() => {
          resolve();
          clearTimeout(timer);
        }, 1000);
      }).then(() => {
        const url = `${remote.sharing}/order/${this.props.order.sup_token}/${this.props.order.ord_id}?lang=${lang.code}`;

        Share.open({
          title: I18n.t('translation.shareOrderTitle'),
          message: I18n.t('translation.shareOrderMessage'),
          url,
        });
      });
    });
  }

  handlePartPress(part) {
    this.setState({ expanded: this.state.expanded === part.id ? false : part.id });
  }

  handlePartStatusPress(part) {
    this.setState({
      showPartStatusModal: true,
      selectedPart: part,
    });
  }

  handleClosePartStatusPress() {
    this.setState({
      showPartStatusModal: false,
    });
  }

  handleChangePartStatusPress(status) {
    this.setState({
      selectedPartStatus: status,
      showPartStatusModal: false,
    }, () => {
      if (this.state.selectedPartStatus.id === orderStatus.RECEIVED) {
        this.setState({ showPartReceivedStatusModal: true });
      } else if (this.state.selectedPart.status === orderStatus.RECEIVED) {
        this.setState({ showPartOtherStatusModal: true });
      } else {
        this.handlePartStatusButtonPress(this.state.selectedPartStatus, this.state.selectedPart);
      }
    });
  }

  handleReceiveBulkPress() {
    this.setState({ activity: true }, () => {
      Promise.all(this.state.selectedItems
        .filter(item => item.status !== orderStatus.RECEIVED)
        .map(item => this.props.receivedOrderPart(item.id)))
        .then(() => this.loadOrderParts())
        .finally(() => {
          this.setState({ activity: false }, () => {
            this.closeBulkOperation();
          });
        });
    });
  }

  handleCancelBulkPress() {
    this.setState({ activity: true }, () => {
      Promise.all(this.state.selectedItems
        .filter(item => item.status !== orderStatus.CANCELED)
        .map(item => this.props.canceledOrderPart(item.id)))
        .then(() => this.loadOrderParts())
        .finally(() => {
          this.setState({ activity: false }, () => {
            this.closeBulkOperation();
          });
        });
    });
  }

  handleReceiveBulkStatusPress() {
    if (this.state.selectedItems.find(item => item.status !== orderStatus.RECEIVED)) {
      this.setState({
        showPartReceiveBulkStatusModal: true,
      });
    } else {
      this.closeBulkOperation();
    }
  }

  handleCancelBulkStatusPress() {
    if (this.state.selectedItems.find(item => item.status === orderStatus.RECEIVED)) {
      this.setState({
        showPartCancelBulkStatusModal: true,
      });
    } else {
      this.handleCancelBulkPress();
    }
  }

  handleSavePart(part) {
    if (Number(this.state.parts.find(item => item.id === part.id).pr_price) === Number(part.pr_price)) {
      this.props.updateOrderPart(part.id, part.amount, part.pr_price, 0).then(() => {
        Toast.showMessage('Order', 'Update order part: success');
        this.loadOrderParts();
        this.props.getOrders();
      });
    } else {
      this.setState({
        showPartPriceModal: true,
        partForUpdate: part,
      });
    }
  }

  handleSavePartPrice(part, updateRootPart) {
    this.props.updateOrderPart(part.id, part.amount, part.pr_price, updateRootPart).then(() => {
      Toast.showMessage('Order', 'Update order part: success');
      this.loadOrderParts();
      this.props.getOrders();
    });
  }

  handleOpenRestoreModalButton(part) {
    this.setState({
      showRestoreOrderDataModal: true,
      partForUpdate: part,
    });
  }

  handleRestoreOriginalDataPartButton(part) {
    this.props.restoreOrderOriginalData(part.id).then(() => {
      this.loadOrderParts();
      this.props.getOrders();
    });
  }

  handleReceivedButtonPress(orderPart) {
    this.setState({ activity: true });
    this.props.receivedOrderPart(orderPart.id)
      .then(() => this.loadOrderParts())
      .finally(() => this.setState({ activity: false }));
  }

  handlePartStatusButtonPress(orderPartStatus, orderPart) {
    this.setState({ activity: true });

    if (orderPartStatus.id === orderStatus.EXPECTED) {
      this.props.expectedOrderPart(orderPart.id)
        .then(() => this.loadOrderParts())
        .finally(() => this.setState({ activity: false }));
    } else if (orderPartStatus.id === orderStatus.MISSING) {
      this.props.missingOrderPart(orderPart.id)
        .then(() => this.loadOrderParts())
        .finally(() => this.setState({ activity: false }));
    } else if (orderPartStatus.id === orderStatus.CANCELED) {
      this.props.canceledOrderPart(orderPart.id)
        .then(() => this.loadOrderParts())
        .finally(() => this.setState({ activity: false }));
    }
  }

  renderOrderPartsListItem(part) {
    const status = getArrayItemByKey(
      orderStatusItems,
      part.status,
    );

    return (
      <React.Fragment key={part.id}>
        <View
          style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
        >
          {this.state.isBulkOperation
          && (
          <Checkbox
            value={!!this.state.selectedItems.find(selectedItem => selectedItem.id === part.id)}
            iconSize={28}
            style={{ position: 'absolute', left: -26 }}
            onChange={this.selectItem.bind(this, part)}
          />
          )
          }

          <View style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={this.handlePartPress.bind(this, part)}
              onLongPress={this.showBulkOperation.bind(this, part)}
              style={[styles.component.listItemButtonInfoContainer, { alignItems: 'flex-start' }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.component.listItemSubText}>{part.model}</Text>
                <Text style={styles.component.listItemMainText}>
                  {part.status === orderStatus.RECEIVED
                    ? <TextInputIcon.Check />
                    : (part.status === orderStatus.MISSING
                      ? <TextInputIcon.Help style={{ color: styles.colors.statusYellow }} />
                      : part.status === orderStatus.CANCELED && <TextInputIcon.Canceled style={{ color: styles.colors.statusRed }} />)
                  }
                  {' '}
                  {part.pr_name}
                  {' '}
                  {part.color}
                </Text>
              </View>
              <View style={{ marginRight: 10, alignItems: 'flex-end' }}>
                <Text style={styles.component.listItemSubText}>{I18n.t('translation.amount')}</Text>
                <Text style={styles.component.listItemMainText}>
                  {part.amount}
                </Text>
              </View>
              <View style={{ marginRight: 10, alignItems: 'flex-end' }}>
                <Text style={styles.component.listItemSubText}>{I18n.t('translation.orderNumber')}</Text>
                <Text style={styles.component.listItemMainText}>
                  {part.ord_id}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.component.listItemSubText}>{I18n.t('translation.totalCost')}</Text>
                <Text style={styles.component.listItemMainText}>
                  {part.pr_price && part.amount ? +(`${Math.round(`${part.pr_price * part.amount}e+2`)}e-2`) : 0 }
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {this.state.expanded === part.id
        && (
        <View style={{ padding: 10, marginLeft: 50 }}>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.date')}</Text>
            <Text style={styles.component.listItemDarkSubText}>{part.date_add}</Text>
          </View>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.orderNumber')}</Text>
            <Text style={styles.component.listItemDarkSubText}>{part.ord_id}</Text>
          </View>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.brand')}</Text>
            <Text style={styles.component.listItemDarkSubText}>{part.br_name}</Text>
          </View>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.supplier')}</Text>
            <Text style={styles.component.listItemDarkSubText}>{part.sup_name}</Text>
          </View>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.serial')}</Text>
            <Text style={styles.component.listItemDarkSubText}>{part.serial}</Text>
          </View>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.status')}</Text>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t(status.name)}</Text>
          </View>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.color')}</Text>
            <Text style={styles.component.listItemDarkSubText}>{part.color}</Text>
          </View>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.price')}</Text>
            <View style={styles.component.blockListItemDarkSubText}>
              <IntegerInput
                editable={part.status === orderStatus.EXPECTED}
                refreshedComponent={this.state.refreshedComponent}
                onChangeValue={(value) => {
                  this.setState({
                    partsInfo: this.state.partsInfo.map((partInfo) => {
                      if (partInfo.id === part.id) {
                        return {
                          ...partInfo,
                          pr_price: value,
                        };
                      } else {
                        return partInfo;
                      }
                    }),
                  });
                }}
                value={part.pr_price.toString()} min={0}
                containerStyle={{
                  borderBottomWidth: 0, width: 100, justifyContent: 'flex-end', paddingLeft: 0,
                }}
                textStyle={{ fontSize: 13, textAlign: 'right', paddingHorizontal: 0 }}
              />
            </View>
          </View>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.amount')}</Text>
            <View style={styles.component.blockListItemDarkSubText}>
              <IntegerInput
                editable={part.status === orderStatus.EXPECTED}
                refreshedComponent={this.state.refreshedComponent}
                onChangeValue={(value) => {
                  this.setState({
                    partsInfo: this.state.partsInfo.map((partInfo) => {
                      if (partInfo.id === part.id) {
                        return {
                          ...partInfo,
                          amount: value,
                        };
                      } else {
                        return partInfo;
                      }
                    }),
                  });
                }}
                value={part.amount.toString()} min={0}
                containerStyle={{
                  borderBottomWidth: 0, width: 100, justifyContent: 'flex-end', marginBottom: 5, paddingLeft: 0,
                }}
                textStyle={{ fontSize: 13, textAlign: 'right', paddingHorizontal: 0 }}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 5 }}>
            {part.status === orderStatus.EXPECTED
            && (
            <Button
              text={I18n.t('translation.save')}
              onPress={this.handleSavePart.bind(this, this.state.partsInfo.find(partInfo => partInfo.id === part.id))}
              textStyle={styles.component.textInputButtonText}
              style={styles.component.textInputButtonContainer}
            />
            )
            }

            <Button
              text={I18n.t('translation.changeStatus')}
              onPress={this.handlePartStatusPress.bind(this, part)}
              textStyle={styles.component.textInputButtonText}
              style={styles.component.textInputButtonContainer}
            />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 5 }}>
            {part.status === orderStatus.EXPECTED
            && (
            <Button
              text={I18n.t('translation.restoreOriginalData')}
              onPress={this.handleOpenRestoreModalButton.bind(this, part)}
              textStyle={styles.component.textInputButtonText}
              style={styles.component.textInputButtonContainer}
            />
            )
            }
          </View>
        </View>
        )
        }
      </React.Fragment>
    );
  }

  handleEditOrderButtonPress() {
    Actions.orderFormsScene({
      onActionsSuccess: () => {
        this.loadOrderParts();
        Actions.pop();
      },
      order: this.props.order,
      supplier: {
        sup_name: this.props.order.sup_name,
        id: this.props.order.sup_id,
      },
    });
  }

  render() {
    return (
      <Scene loading={this.state.activity}>
        {this.state.isBulkOperation
          ? (
            <Header
              text={I18n.t('translation.statuses')}
              left={HeaderIcon.CLOSE}
              onLeftButtonPress={this.closeBulkOperation.bind(this)}
            />
          )
          : (
            <Header
              text={this.props.order.sup_name}
              left={HeaderIcon.MENU}
              right={HeaderIcon.ADD}
              onLeftButtonPress={() => Actions.menuScene()}
              onRightButtonPress={() => this.handleEditOrderButtonPress()}
            />
          )
        }

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

        <ConfirmationDialog
          text={I18n.t('translation.confirmStatusReceived')}
          visible={this.state.showPartReceivedStatusModal}
          onRequestClose={() => this.setState({ showPartReceivedStatusModal: false })}
          onAccessButtonPress={this.handleReceivedButtonPress.bind(this, this.state.selectedPart)}
        />

        <AlertDialog
          text={this.state.totalStatus === orderStatus.MISSING
            ? I18n.t('translation.alertIncomplete', {
              missing: this.state.parts.filter(item => item.status === orderStatus.MISSING).length,
              expected: this.state.parts.filter(item => item.status === orderStatus.EXPECTED).length,
            })
            : I18n.t('translation.alertExpected', {
              expected: this.state.parts.filter(item => item.status === orderStatus.EXPECTED).length,
            })}
          visible={this.state.showAlertDialogPart}
          onRequestClose={() => this.setState({ showAlertDialogPart: false })}
          onAccessButtonPress={() => Actions.pop()}
        />

        <ConfirmationDialog
          text={I18n.t('translation.confirmStatusReceiveBulk')}
          visible={this.state.showPartReceiveBulkStatusModal}
          onRequestClose={() => this.setState({ showPartReceiveBulkStatusModal: false })}
          onAccessButtonPress={this.handleReceiveBulkPress.bind(this)}
        />

        <ConfirmationDialog
          text={I18n.t('translation.confirmStatusCancelBulk')}
          visible={this.state.showPartCancelBulkStatusModal}
          onRequestClose={() => this.setState({ showPartCancelBulkStatusModal: false })}
          onAccessButtonPress={this.handleCancelBulkPress.bind(this)}
        />

        <ConfirmationDialog
          text={I18n.t('translation.doYouWantRestoreOrderData')}
          visible={this.state.showRestoreOrderDataModal}
          onRequestClose={() => this.setState({ showRestoreOrderDataModal: false })}
          onAccessButtonPress={this.handleRestoreOriginalDataPartButton.bind(this, this.state.partForUpdate)}
        />

        <ConfirmationDialog
          text={I18n.t('translation.confirmStatusOther')}
          visible={this.state.showPartOtherStatusModal}
          onRequestClose={() => this.setState({ showPartOtherStatusModal: false })}
          onAccessButtonPress={this.handlePartStatusButtonPress.bind(this, this.state.selectedPartStatus, this.state.selectedPart)}
        />

        <Autocomplete
          visible={this.state.showPartStatusModal}
          title={I18n.t('translation.status')}
          placeholder={I18n.t('translation.status')}
          getItemText={item => I18n.t(item.name)}
          onRequestClose={this.handleClosePartStatusPress.bind(this)}
          items={orderStatusItems.filter(item => item.id !== this.state.selectedPart.status)}
          onItemSelected={this.handleChangePartStatusPress.bind(this)}
        />

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            <View
              style={{ width: '100%' }}
            >
              {this.state.isBulkOperation
              && (
              <Checkbox
                value={this.state.parts.filter(item => this.orderPartFilter(item)).length === this.state.selectedItems.length}
                iconSize={28}
                style={{ position: 'absolute', left: 4, top: 15 }}
                onChange={this.selectAllItems.bind(this)}
              />
              )
              }

              <TextInput
                placeholder={I18n.t('translation.partBrand')}
                onChangeText={search => this.setState({ search })}
                left={<TextInputIcon.Search />}
                right={<TextInputIcon.Filter color={this.state.status ? colors.button : colors.blackBackground} />}
                onRightButtonPress={() => this.setState({ filter: true })}
                containerStyle={styles.scene.searchInputContainer}
              />
            </View>
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
                status:
                  this.state.status === status.id ? 0 : status.id,
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
              {this.state.parts
                .filter(item => this.orderPartFilter(item))
                .map(part => this.renderOrderPartsListItem(part))
              }
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                {!!this.state.totalPrice
                && (
                <Text style={styles.scene.orderTotalStatusText}>
                  {I18n.t('translation.total', { total: this.state.totalPrice })}
                </Text>
                )
                }
              </View>

              {this.state.loading
              || (
              <View>
                <Button
                  onPress={this.handleShareButtonPress.bind(this)}
                  text={I18n.t('translation.share')} style={{ marginTop: 30, marginBottom: 15 }}
                />
              </View>
              )
              }

              {!this.state.loading
              && (
              <View>
                <Button
                  onPress={this.backToAllOrders.bind(this)}
                  text={I18n.t('translation.backToAllOrders')} style={{ marginVertical: 15 }}
                />
              </View>
              )
              }
            </View>
          </View>
        </ScrollView>

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            {this.state.isBulkOperation
            && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
              <Button
                onPress={this.handleReceiveBulkStatusPress.bind(this)}
                text={I18n.t('translation.receiveItems')} style={{ marginVertical: 30 }}
              />
              <Button
                onPress={this.handleCancelBulkStatusPress.bind(this)}
                text={I18n.t('translation.cancelItems')} style={{ marginVertical: 30, backgroundColor: colors.statusRed }}
              />
            </View>
            )
            }
          </View>
        </View>
      </Scene>
    );
  }

  static propTypes = {
    order: PropTypes.object.isRequired,
    getOrders: PropTypes.func.isRequired,
    getOrderParts: PropTypes.func.isRequired,
    receivedOrderPart: PropTypes.func.isRequired,
    expectedOrderPart: PropTypes.func.isRequired,
    missingOrderPart: PropTypes.func.isRequired,
    canceledOrderPart: PropTypes.func.isRequired,
    updateOrderPart: PropTypes.func.isRequired,
    restoreOrderOriginalData: PropTypes.func.isRequired,
    getAppLanguage: PropTypes.func.isRequired,
  }
}

export default connect(() => ({ }), {
  getOrderParts,
  receivedOrderPart,
  getOrders,
  updateOrderPart,
  expectedOrderPart,
  missingOrderPart,
  canceledOrderPart,
  restoreOrderOriginalData,
  getAppLanguage,
})(OrderPartsScene);
