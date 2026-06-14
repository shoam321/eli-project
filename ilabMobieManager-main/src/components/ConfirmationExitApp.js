import React, { Component } from 'react';
import { ViewPropTypes, BackHandler } from 'react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import I18n from '../lang/i18n';

import ConfirmationDialog from '../scenes/components/ConfirmationDialog';

class ConfirmationExitApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      exitConfirmation: false,
    };
  }

  componentWillMount() {
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.hardwareBackPressHandler.bind(this)
    );
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.hardwareBackPressHandler.bind(this)
    );
  }

  hardwareBackPressHandler() {
    if (Actions.state.routes.length <= 1) {
      this.setState({ exitConfirmation: true });
    }

    return true;
  }

  render() {
    return (
      <ConfirmationDialog
        text={I18n.t('translation.youWantQuit')}
        visible={this.state.exitConfirmation}
        onRequestClose={() => this.setState({ exitConfirmation: false })}
        onAccessButtonPress={BackHandler.exitApp}
      />
    );
  }

  static propTypes = { ...ViewPropTypes };
}

export default connect(() => ({}), {})(ConfirmationExitApp);
