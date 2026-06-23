import React, { Component } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import styles, { colors } from '../config/styles';
import ModalDialog from './ModalDialog';
import Button from './Button';
import I18n from '../lang/i18n';

class NotificationListener {
  constructor() {
    this.listeners = [];
  }

  showMessage(title, message, option) {
    this.listeners.map(data => data.listener(title, message, option));
  }

  pushListener(listener) {
    const key = new Date();
    this.listeners.push({ listener, key });
    return key;
  }

  popListener(key) {
    this.listeners.filter(data => data.key !== key);
  }
}

export const Alert = new NotificationListener();

export class AlertView extends Component {
  constructor(props) {
    super(props);
    this.state = { alert: {} };
  }

  componentDidMount() {
    Alert.pushListener(this.handleAlertMessage.bind(this));
  }

  handleAlertMessage(title, text) {
    this.setState({ alert: { title, text } });
  }

  render() {
    return (
      <ModalDialog
        visible={!!this.state.alert.title}
        onRequestClose={() => {}}
      >
        <Text style={styles.component.modalDialogText}>{this.state.alert.title}</Text>
        <Text style={styles.component.errorDialogText}>{this.state.alert.text}</Text>
        <View style={styles.component.errorDialogButtonsBar}>
          <Button text={I18n.t('translation.ok')} onPress={() => this.setState({ alert: {} })} />
        </View>
      </ModalDialog>
    );
  }
}

export const Toast = new NotificationListener();

export class ToastView extends Component {
  constructor(props) {
    super(props);
    this.timer = null;
    this.state = { toast: {} };
    this.styles = { error: { backgroundColor: colors.toastError } };
  }

  componentDidMount() {
    Toast.pushListener(this.handleToastMessage.bind(this));
  }

  handleToastMessage(title, text, option) {
    this.setState({ toast: { title, text, option } }, () => {
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(this.handleCloseButtonPress.bind(this), 4000);
    });
  }

  handleCloseButtonPress() {
    if (this.timer) clearTimeout(this.timer);
    this.setState({ toast: {} });
  }

  render() {
    if (!this.state.toast.title) return null;
    return (
      <View style={[
        styles.component.toastContainer,
        this.styles[this.state.toast.option],
      ]}
      >
        <Text style={styles.component.toastTitleText}>{this.state.toast.title}</Text>
        <Text style={styles.component.toastMessageText}>{this.state.toast.text}</Text>
        <TouchableOpacity
          style={styles.component.hideToastButton}
          onPress={this.handleCloseButtonPress.bind(this)}
        >
          <MaterialIcon name="close" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
    );
  }
}
