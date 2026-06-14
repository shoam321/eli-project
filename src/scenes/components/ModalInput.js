import React, { Component } from 'react';
import { Modal, View } from 'react-native';
import PropTypes from 'prop-types';

import styles from '../../config/styles';
import TextInput from '../../components/TextInput';
import Header, { HeaderIcon } from './Header';
import Button from '../../components/Button';
import I18n from '../../lang/i18n';

class ModalInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };
  }

  handleSubmitButton() {
    this.props.onRequestClose();
    this.props.onPressConfirm(this.state.value);
    this.setState({ value: '' });
  }

  render() {
    return (
      <Modal
        visible={this.props.visible}
        animationType="fade" transparent
        onRequestClose={this.props.onRequestClose}
      >
        <View style={styles.component.autocompleteRootContainer}>
          <View style={styles.component.inputDialogContainer}>
            <Header
              text={this.props.title}
              right={HeaderIcon.CLOSE}
              onRightButtonPress={this.props.onRequestClose}
            />

            <TextInput
              value={this.state.value} autoFocus
              placeholder={this.props.placeholder}
              keyboardType={this.props.keyboardType}
              containerStyle={styles.component.autocompleteInput}
              onChangeText={value => this.setState({ value })}
            />

            <View style={[styles.component.modalDialogButtonsBar, { paddingHorizontal: 25 }]}>
              <Button
                text={I18n.t('translation.cancel')}
                onPress={this.props.onRequestClose}
                style={styles.component.buttonGray}
              />
              <Button
                text={I18n.t('translation.confirm')}
                onPress={this.handleSubmitButton.bind(this)}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  static propTypes = {
    title: PropTypes.string,
    placeholder: PropTypes.string,
    keyboardType: PropTypes.string,
    onPressConfirm: PropTypes.func,
    visible: PropTypes.bool.isRequired,
    onRequestClose: PropTypes.func.isRequired,
  };

  static defaultProps = {
    title: I18n.t('translation.inputValue'),
    placeholder: I18n.t('translation.value'),
    keyboardType: 'default',
    onPressConfirm: () => {},
  };
}

export default ModalInput;
