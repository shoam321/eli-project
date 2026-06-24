import React, { Component } from 'react';
import {
  View, ImageBackground, Image, ScrollView,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import I18n from '../../lang/i18n';
import { logIn, getSavedLogin } from '../../actions/user';
import styles from '../../config/styles';
import Scene from '../../components/Scene';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import { Alert } from '../../components/Notification';
import Background from '../../content/images/background-shape.png';
import Validator, { formsValidation } from '../../actions/validators';
import Logo from '../../content/images/logo.png';

class LoginScene extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      credentials: {
        email: '',
        pass: '',
      },
    };
  }

  componentWillMount() {
    this.props.getSavedLogin()
      .then(email => this.handleTextInput('email', email))
      .catch(() => {});
  }

  handleTextInput(key, value) {
    this.setState({
      credentials: {
        ...this.state.credentials,
        [key]: value,
      },
    });
  }

  handleLoginButtonPress() {
    const errors = Validator.getFormErrors(this.state.credentials, formsValidation.LOGIN);
    if (errors.length > 0) return Alert.showMessage(I18n.t('translation.error'), errors.join('\n'));
    this.setState({ loading: true });
    this.props.logIn(this.state.credentials)
      .then((res) => {
        Actions.loadingScene({ logged: true })
      })
      .catch((err) => {
         const error = () => Alert.showMessage(I18n.t('translation.error'), I18n.t('translation.authFail'));
         this.setState({ loading: false }, error);
      });
  }

  render() {
    return (
      <Scene loading={this.state.loading}>
        <View style={styles.common.backgroundBottomContainerLight}>
          <ImageBackground
            style={styles.common.backgroundBottomImage}
            opacity={0.3} source={Background}
          />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scene.listItemsContainer, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}
        >
          <Image
            style={styles.scene.loginLogoImage}
            source={Logo} resizeMode="contain"
          />
          <View style={styles.scene.loginFormsContainer}>
            <TextInput
              placeholder={I18n.t('translation.email')} hint
              value={this.state.credentials.email}
              onChangeText={this.handleTextInput.bind(this, 'email')}
              keyboardType="email-address"
            />
            <TextInput
              secureTextEntry
              placeholder={I18n.t('translation.password')} hint
              value={this.state.credentials.pass}
              onChangeText={this.handleTextInput.bind(this, 'pass')}
            />

            <Button
              text={I18n.t('translation.login')}
              style={{ marginTop: 30 }}
              onPress={this.handleLoginButtonPress.bind(this)}
            />
          </View>
        </ScrollView>
      </Scene>
    );
  }

  static propTypes = {
    logIn: PropTypes.func.isRequired,
    getSavedLogin: PropTypes.func.isRequired,
  };
}

export default connect(() => ({}), { logIn, getSavedLogin })(LoginScene);
