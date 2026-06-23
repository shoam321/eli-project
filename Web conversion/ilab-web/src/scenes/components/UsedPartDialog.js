import React, { Component } from 'react';
import {
  Modal, Text, TouchableOpacity, View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import PropTypes from 'prop-types';

import styles, { colors } from '../../config/styles';
import Header, { HeaderIcon } from './Header';
import Button from '../../components/Button';
import ModalDialog from '../../components/ModalDialog';
import Autocomplete from './Autocomplete';

import I18n from '../../lang/i18n';

const dialog = {
  PARTS: 0,
  QUANTITY: 1,
  ORDER: 2,
};

class UsedPartDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      part: null,
      quantity: '1',
      modal: dialog.PARTS,
    };
  }

  handleQuantityChange(quantity) {
    if (quantity < 1) quantity = 1;
    this.setState({ quantity });
  }

  handleSubmitButton() {
    const part = {
      part_id: this.state.part.id,
      pr_id: this.props.project.id,
      qnt: this.state.quantity,
    };
    this.props.onRequestClose();
    this.props.onPressConfirm(part);
    this.setState({ quantity: '1', part: null });
  }


  render() {
    return (
      <React.Fragment>
        <Autocomplete
          title={I18n.t(`translation.${this.props.type}`)}
          placeholder={I18n.t('translation.search')}
          items={this.props.listParts}
          visible={this.state.modal === dialog.PARTS}
          getItemText={(part) => {
            let partColor = '';
            let partModel = '';

            if (part.color) {
              partColor = `-${part.color}`;
            }

            if (part.m_name) {
              partModel = `-${part.m_name}`;
            }

            return `${part.pr_name || ''}${partColor}${partModel}`;
          }}
          autocompleteFilter={(part, text) => {
            let partColor = '';
            let partModel = '';

            if (part.color) {
              partColor = ` ${part.color}`;
            }

            if (part.m_name) {
              partModel = ` ${part.m_name}`;
            }

            return `${part.pr_name || ''}${partColor}${partModel}`
              .toLocaleLowerCase()
              .indexOf(text.toLocaleLowerCase()) >= 0;
          }}
          onItemSelected={part => this.setState({ part, modal: part.in_stock > 1 ? dialog.QUANTITY : dialog.ORDER })}
          onRequestClose={result => result === true || this.props.onRequestClose()}
        />
        <Modal
          visible={this.state.modal === dialog.QUANTITY}
          style={{ backgroundColor: 'white' }} transparent
          onRequestClose={this.props.onRequestClose}
        >
          <View style={styles.component.autocompleteRootContainer}>
            <View style={styles.component.inputDialogContainer}>
              <Header
                text={I18n.t('translation.partQuantity')} right={HeaderIcon.CLOSE}
                onRightButtonPress={this.props.onRequestClose}
              />
              <View style={{ alignItems: 'center' }}>
                <View style={styles.scene.listItemSpaceBetween}>
                  <TouchableOpacity onPress={() => this.handleQuantityChange(+this.state.quantity - 1)}>
                    <Icon name="minus-circle" size={30} color={colors.button} />
                  </TouchableOpacity>
                  <Text style={styles.component.usedPartsDialogQuantityLabel}>{this.state.quantity}</Text>
                  <TouchableOpacity onPress={() => this.handleQuantityChange(+this.state.quantity + 1)}>
                    <Icon name="plus-circle" size={30} color={colors.button} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[styles.component.modalDialogButtonsBar, { paddingHorizontal: 25 }]}>
                <Button
                  text={I18n.t('translation.cancel')}
                  style={styles.component.buttonGray}
                  onPress={this.props.onRequestClose}
                />
                <Button
                  text={I18n.t('translation.confirm')}
                  onPress={this.handleSubmitButton.bind(this)}
                />
              </View>
            </View>
          </View>
        </Modal>

        <ModalDialog
          visible={this.state.modal === dialog.ORDER}
          onRequestClose={() => {}}
        >
          <Text style={styles.component.modalDialogText}>{I18n.t('translation.itIsLastPart')}</Text>
          <Text style={styles.component.modalDialogText}>{I18n.t('translation.createOrderForThisPart')}</Text>
          <View style={styles.component.modalDialogButtonsBar}>
            <Button text={I18n.t('translation.order')} onPress={() => this.props.onRequestOrder(this.state.part)} />
            { this.state.part && this.state.part.in_stock === 1
              ? <Button text={I18n.t('translation.ok')} onPress={this.handleSubmitButton.bind(this)} />
              : <Button text={I18n.t('translation.cancel')} onPress={() => { this.setState({ modal: dialog.PARTS }); }} />
            }
          </View>
        </ModalDialog>
      </React.Fragment>
    );
  }

  static propTypes = {
    project: PropTypes.object.isRequired,
    onPressConfirm: PropTypes.func,
    onRequestOrder: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
  };

  static defaultProps = {
    onPressConfirm: () => {},
  };
}

export default UsedPartDialog;
