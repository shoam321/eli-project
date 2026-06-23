import React, { Component } from 'react';
import {
  Switch, Text, TouchableOpacity, View, Linking
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { logOut, updateCurrentUser } from '../../actions/user';
import styles, { colors } from '../../config/styles';
import Scene from '../../components/Scene';
import TextInput, { TextInputIcon } from '../../components/TextInput';
import Header, { HeaderIcon } from '../components/Header';
import I18n from '../../lang/i18n';
import LanguageSelect from '../components/LanguageSelect';

class Settings extends Component {
  handleLogOutButtonPress() {
    this.props.logOut();
    Actions.loginScene();
  }

  handleNotificationPermission() {
    this.props.updateCurrentUser({
      enable_notification: this.props.user.enable_notification === 1 ? 0 : 1,
    });
  }

  static renderSceneButton(left, right, scene) {
    return (
      <TouchableOpacity
        onPress={() => Actions[scene]()}
        style={[styles.component.listItemButtonContainer, { height: 40 }]}
      >
        <View style={styles.component.dropDownTextContainer}>
          <TextInputIcon.Triangle style={{ marginBottom: -1 }} size={19} color={colors.button} />
          <Text style={styles.component.listItemMainText}>{left}</Text>
        </View>
        <Text style={styles.component.listItemText}>{right}</Text>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <Scene>
        <Header
          text={I18n.t('translation.settings')}
          left={HeaderIcon.MENU}
          right={HeaderIcon.LOGOUT}
          onLeftButtonPress={() => Actions.menuScene()}
          onRightButtonPress={this.handleLogOutButtonPress.bind(this)}
        />

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            <View style={styles.scene.listItemsContainer}>
              <LanguageSelect
                onSelect={() => { this.setState({}); }}
              />

              <TextInput
                editable={false}
                placeholder={I18n.t('translation.name')} hint
                value={this.props.user.name}
              />
              <TextInput
                editable={false}
                placeholder={I18n.t('translation.lastName')} hint
                value={this.props.user.last_name}
              />
              <TextInput
                editable={false}
                placeholder={I18n.t('translation.phone')} hint
                value={this.props.user.phone}
              />

              {this.props.user.secondary_phone
                && (
                <TextInput
                  editable={false}
                  placeholder={I18n.t('translation.secondaryPhone')} hint
                  value={this.props.user.secondary_phone}
                />
                )
              }

              <TextInput
                editable={false}
                placeholder={I18n.t('translation.notification')} hint
                value={I18n.t('translation.enableNotifications')}
                right={(
                  <Switch
                    style={styles.component.switchButton}
                    onValueChange={this.handleNotificationPermission.bind(this)}
                    value={!!this.props.user.enable_notification}
                    tintColor={colors.darkGray}
                    thumbTintColor={colors.white}
                    onTintColor={colors.button}
                  />
)}
              />
              <TouchableOpacity onPress={() => Actions.brandsScene()}>
                <TextInput
                  editable={false}
                  left={<TextInputIcon.Triangle />}
                  placeholder={I18n.t('translation.itemsLength', {
                    length: this.props.brands.filter(item => item.company_id !== 0).length,
                  })}
                  value={I18n.t('translation.brands')} hint
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Actions.modelsScene()}>
                <TextInput
                  editable={false}
                  left={<TextInputIcon.Triangle />}
                  placeholder={I18n.t('translation.itemsLength', {
                    length: this.props.models.filter(item => item.company_id !== 0).length,
                  })}
                  value={I18n.t('translation.models')} hint
                />
              </TouchableOpacity>
            </View>
            <View style={{paddingHorizontal: 43}}>
            <Text>{I18n.t('translation.ManageYourCompany')}:</Text>
            <TouchableOpacity  onPress={ ()=>{ Linking.openURL('https://app.ilabassistant.com/')}}>
                  <Text style={{color: '#28b8b8'}}>https://app.ilabassistant.com/</Text>
            </TouchableOpacity>
            <Text style={{paddingTop: 10, fontSize: 12}}>*{I18n.t('translation.ForAdminsOnly')}</Text>
            </View>
          </View>
        </View>
      </Scene>
    );
  }

  static propTypes = {
    user: PropTypes.object.isRequired,
    brands: PropTypes.array.isRequired,
    models: PropTypes.array.isRequired,
    logOut: PropTypes.func.isRequired,
    updateCurrentUser: PropTypes.func.isRequired,
  };
}

export default connect(({ user, main }) => ({
  user: user.profile,
  brands: main.brands,
  models: main.models,
}), { logOut, updateCurrentUser })(Settings);
