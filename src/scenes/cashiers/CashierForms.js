/* eslint-disable import/extensions */
import React, { Component } from 'react';
import {
  ScrollView, TouchableOpacity, View, BackHandler, Linking,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import DateTimePicker from 'react-native-modal-datetime-picker';

import { sellItem, sellItemInvoice } from '../../actions/cashiers';
import { handleBackButtonPress } from '../../actions/common';
import { clientSearch, getClientName } from '../../actions/clients';
import styles from '../../config/styles';
import Scene from '../../components/Scene';
import TextInput from '../../components/TextInput';
import Header, { HeaderIcon } from '../components/Header';
import { Alert } from '../../components/Notification';
import Button from '../../components/Button';
import AutocompleteInput from '../components/AutocompleteInput';
import Validator, { formsValidation } from '../../actions/validators';
import I18n from '../../lang/i18n';
import { cashierItemType, cashierItemTypes, sellItemType } from '../../config/constants';
import InvoiceModal from '../components/InvoiceModal';

class CashierForms extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      client: props.client,
      datePicker: false,
      invoiceModal: false,
      item: {
        user_id: props.client.id,
        warranty_expiration_date: '',
        actual_sell_price: props.itemForSell.price,
        amount: '',
        life_status: cashierItemType.NEW,
      },
      soldItemId: 0,
    };
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', handleBackButtonPress);
  }

  handleTextInput(key, value) {
    this.setState({ item: { ...this.state.item, [key]: value } });
  }

  handleAutocompleteItemSelect(key, keyId, item) {
    return new Promise((resolve) => {
      const state = {
        [key]: item,
        item: {
          ...this.state.item,
          [keyId]: item.id,
        },
      };

      this.setState(state, () => { resolve(); });
    });
  }

  handleAutocompleteClientSelect(key, keyId, item) {
    return new Promise((resolve) => {
      const state = {
        [key]: item,
        item: {
          ...this.state.item,
          [keyId]: item.id || item.user_id,
        },
      };

      this.setState(state, () => { resolve(); });
    });
  }

  handleSaveButtonPress() {
    const errors = Validator.getFormErrors({
      ...this.state.item,
    }, this.props.itemType === sellItemType.PART
      ? formsValidation.SELL_PART
      : formsValidation.SELL_DEVICE);

    if (errors.length > 0) return Alert.showMessage(I18n.t('translation.error'), errors.join('\n'));

    this.setState({ loading: true });

    this.props.sellItem({
      item: this.state.item,
      item_type: this.props.itemType,
      item_for_sell: this.props.itemForSell,
    })
      .then((data) => {
        this.setState({
          loading: false,
          soldItemId: data.data.sold_item_id,
        }, () => {
          this.setState({ invoiceModal: true });
        });
      })
      .catch((e) => {
        const error = () => Alert.showMessage(I18n.t('translation.error'), e.message || I18n.t('translation.checkFormData'));
        this.setState({ loading: false }, error);
      });
  }

  handleDatePick(date) {
    this.setState({
      datePicker: false,
      item: {
        ...this.state.item,
        warranty_expiration_date: moment(date).format('YYYY-MM-DD [23:59]'),
      },
    });
  }

  handlePrintInvoiceButtonPress(paymentInfo) {
    this.setState({ loading: true });

    this.props.sellItemInvoice({
      id: this.state.soldItemId,
      item_type: this.props.itemType,
      payment_type: paymentInfo.invoicePaymentType,
      cc_type: paymentInfo.invoicePaymentMethod,
      cc_number: paymentInfo.invoiceLast4Digits,
    }).then((data) => {
      Linking.canOpenURL(data.invoice.link).then((supported) => {
        if (supported) {
          Linking.openURL(data.invoice.link)
            .finally(() => {
              this.props.onActionsSuccess();
            });
        }
      });
    }).catch((e) => {
      const error = () => Alert.showMessage(I18n.t('translation.error'), e.message || I18n.t('translation.checkFormData'));
      this.setState({ loading: false }, error);
    });
  }

  render() {
    return (
      <Scene loading={this.state.loading}>
        <Header
          text={I18n.t('translation.sell')}
          left={HeaderIcon.BACK}
          onLeftButtonPress={() => Actions.pop()}
        />

        <InvoiceModal
          visible={this.state.invoiceModal}
          onRequestClose={() => {
            this.setState({
              invoiceModal: false,
            });
          }}
          handlePrintInvoiceButtonPress={this.handlePrintInvoiceButtonPress.bind(this)}
        />

        <DateTimePicker
          mode="date"
          isVisible={this.state.datePicker}
          date={moment().toDate()}
          onConfirm={date => this.handleDatePick(date)}
          onCancel={() => this.setState({ datePicker: false })}
        />

        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.scene.responsiveWrapper}>
            <View style={styles.scene.responsive}>
              <View style={styles.scene.listItemsContainer}>
                <AutocompleteInput
                  requiredMark
                  placeholder={I18n.t('translation.client')}
                  searchPlaceholder={I18n.t('translation.name')}
                  item={this.state.client}
                  items={this.props.clients}
                  autocompleteFilter={clientSearch}
                  getItemText={getClientName}
                  onItemSelected={this.handleAutocompleteItemSelect.bind(this, 'client', 'user_id')}
                  onAddButtonPress={() => Actions.clientFormsScene({
                    maxRequired: false,
                    onActionsSuccess: (client) => {
                      Actions.pop();

                      setTimeout(() => {
                        this.handleAutocompleteClientSelect('client', 'user_id', client);
                      }, 300);
                    },
                  })}
                />

                <TouchableOpacity onPress={() => this.setState({ datePicker: true })}>
                  <TextInput
                    requiredMark
                    editable={false}
                    placeholder={I18n.t('translation.warrantyExpirationDate')} hint
                    value={this.state.item.warranty_expiration_date}
                  />
                </TouchableOpacity>

                <TextInput
                  placeholder={I18n.t('translation.actualSellPrice')} hint
                  keyboardType="numeric"
                  value={this.state.item.actual_sell_price.toString()}
                  onChangeText={this.handleTextInput.bind(this, 'actual_sell_price')}
                />

                {this.props.itemType === sellItemType.PART
                  && (
                  <TextInput
                    placeholder={I18n.t('translation.amount')} hint
                    keyboardType="numeric"
                    value={this.state.item.amount.toString()}
                    onChangeText={this.handleTextInput.bind(this, 'amount')}
                  />
                  )
                }

                <AutocompleteInput
                  requiredMark
                  placeholder={I18n.t('translation.status')}
                  item={cashierItemTypes.find(item => item.id === this.state.item.life_status)}
                  items={cashierItemTypes}
                  getItemText={item => I18n.t(item.name)}
                  onItemSelected={this.handleAutocompleteItemSelect.bind(this, 'life_status', 'life_status')}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
              <Button
                onPress={this.handleSaveButtonPress.bind(this)}
                text={I18n.t('translation.sell')} style={styles.scene.buttonSize}
              />
            </View>
          </View>
        </View>
      </Scene>
    );
  }

  static propTypes = {
    itemForSell: PropTypes.object,
    client: PropTypes.object,
    itemType: PropTypes.number.isRequired,
    clients: PropTypes.array.isRequired,
    sellItem: PropTypes.func.isRequired,
    sellItemInvoice: PropTypes.func.isRequired,
    onActionsSuccess: PropTypes.func,
  };

  static defaultProps = {
    itemForSell: {},
    client: {},
    onActionsSuccess: () => {
      Actions.pop();
    },
  };
}

export default connect(({ main }) => ({
  clients: main.clients,
}), {
  sellItem,
  sellItemInvoice,
})(CashierForms);
