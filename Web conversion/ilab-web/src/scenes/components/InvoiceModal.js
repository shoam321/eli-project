import React, { Component } from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';
import PropTypes from 'prop-types';
import styles, { colors } from '../../config/styles';
import Header, { HeaderIcon } from './Header';
import I18n from '../../lang/i18n';
import {
  paymentMethodItems, paymentMethods, paymentTypeItems, paymentTypes,
} from '../../config/constants';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';

class InvoiceModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      invoicePaymentType: paymentTypes.CASH,
      invoicePaymentMethod: paymentMethods.VISA,
      invoiceLast4Digits: '',
    };
  }

  handlePrintInvoiceButtonPress() {
    this.props.handlePrintInvoiceButtonPress({
      invoicePaymentType: this.state.invoicePaymentType,
      invoicePaymentMethod: this.state.invoicePaymentMethod,
      invoiceLast4Digits: this.state.invoiceLast4Digits,
    });

    this.props.onRequestClose();
  }

  render() {
    return (
      <Modal
        visible={this.props.visible}
        animationType="fade" transparent
        onRequestClose={this.props.onRequestClose}
      >
        <View style={styles.component.autocompleteRootContainer}>
          <View style={styles.scene.responsiveWrapper}>
            <View style={styles.scene.responsive}>
              <View style={styles.component.filterContainer}>
                <Header
                  text={I18n.t('translation.paymentType')}
                  right={HeaderIcon.CLOSE}
                  onRightButtonPress={this.props.onRequestClose}
                />
                <View style={styles.component.filterBodyContainer}>
                  <View style={styles.component.filterRow}>
                    {paymentTypeItems.map(paymentType => (
                      <TouchableOpacity
                        key={paymentType.id}
                        onPress={() => {
                          this.setState({
                            invoicePaymentType: paymentType.id,
                          });
                        }}
                      >
                        <TextInput
                          editable={false}
                          value={I18n.t(paymentType.name)}
                          textStyle={{ flex: undefined, paddingHorizontal: 10, fontSize: 16 }}
                          containerStyle={{
                            borderBottomWidth: 2,
                            borderColor: this.state.invoicePaymentType === paymentType.id
                              ? colors.button : colors.lightGray,
                          }}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>

                  {this.state.invoicePaymentType === paymentTypes.CREDIT_CARD
                  && (
                  <View style={styles.component.filterRow}>
                    {paymentMethodItems.map(paymentMethod => (
                      <TouchableOpacity
                        key={paymentMethod.id}
                        onPress={() => {
                          this.setState({
                            invoicePaymentMethod: paymentMethod.id,
                          });
                        }}
                      >
                        <TextInput
                          editable={false}
                          value={I18n.t(paymentMethod.name)}
                          textStyle={{ flex: undefined, paddingHorizontal: 10, fontSize: 16 }}
                          containerStyle={{
                            borderBottomWidth: 2,
                            borderColor: this.state.invoicePaymentMethod === paymentMethod.id
                              ? colors.button : colors.lightGray,
                          }}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  )
                  }

                  {this.state.invoicePaymentType === paymentTypes.CREDIT_CARD
                  && (
                  <TextInput
                    value={this.state.invoiceLast4Digits}
                    placeholder={I18n.t('translation.lastFourDigits')}
                    containerStyle={styles.component.autocompleteInput}
                    maxLength={4}
                    keyboardType="numeric"
                    onChangeText={(value) => {
                      this.setState({
                        invoiceLast4Digits: value,
                      });
                    }}
                  />
                  )
                  }

                  <View style={styles.component.modalDialogButtonsBar}>
                    <Button
                      text={I18n.t('translation.cancel')} style={styles.component.buttonGray}
                      onPress={this.props.onRequestClose}
                    />
                    <Button
                      text={I18n.t('translation.ok')}
                      onPress={this.handlePrintInvoiceButtonPress.bind(this)}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  static propTypes = {
    visible: PropTypes.bool.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    handlePrintInvoiceButtonPress: PropTypes.func.isRequired,
  };

  static defaultProps = {};
}

export default InvoiceModal;
