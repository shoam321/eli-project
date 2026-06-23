import React, { Component } from 'react';
import {
  StatusBar, View, ViewPropTypes, AppState, Platform, SafeAreaView,
} from 'react-native';
import { connect } from 'react-redux';
//import firebase from 'react-native-firebase';
import { Actions } from 'react-native-router-flux';

import styles, { colors } from '../config/styles';
import { AlertView, ToastView } from './Notification';
import { logOut, getUser, getSavedToken } from '../actions/user';
import ConfirmationExitApp from './ConfirmationExitApp';
import firebase from '@react-native-firebase/app'
import messaging from '@react-native-firebase/messaging'

class RootScene extends Component {

  componentDidMount(){
    

  };

componentWillMount() {


     /* const channel = new firebase.notifications.Android.Channel('all', 'All', firebase.notifications.Android.Importance.High)
      .setDescription('All notifications');

    firebase.notifications().android.createChannel(channel);

    firebase.notifications()
      .onNotification((data) => {
        if (data._data.type !== 'logout') {
          const notification = new firebase.notifications.Notification()
            .setNotificationId(data._notificationId)
            .setTitle(data._title)
            .setBody(data._body)
            .setSound('default')
            .setData(data._data);

          if (Platform.OS === 'android') {
            notification
              .android.setDefaults([firebase.notifications.Android.Defaults.All])
              .android.setChannelId('all')
              .android.setVibrate([1, 0, 1])
              .android.setPriority(firebase.notifications.Android.Priority.Max)
              .android.setSmallIcon('ic_launcher');
          }

          firebase.notifications().displayNotification(notification);
        }

        if (data._data.type === 'logout') {
          this.props.logOut().then(() => {}).catch(() => {});
          Actions.loginScene();
        }
      });
*/


    setTimeout(() => {
      AppState.addEventListener('change', this.checkUserStatus.bind(this));
    }, 5000);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.checkUserStatus.bind(this));
  }

  checkUserStatus(nextAppState) {
    if (nextAppState === 'active') {
      this.props.getSavedToken().then(() => {
        this.props.getUser().then(() => {}).catch(() => {
          this.props.logOut().then(() => {}).catch(() => {});
          Actions.loginScene();
        });
      });
    }
  }

  render() {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: styles.colors.blackBackground }}
      >
        <View {...this.props} style={[styles.common.rootContainer, this.props.style]}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={colors.blackBackground}
          />
          <AlertView />

          <ConfirmationExitApp />

          { this.props.children }
          <ToastView />
        </View>
      </SafeAreaView>
    );
  }

  static propTypes = { ...ViewPropTypes };
}

export default connect(() => ({}), {
  logOut,
  getUser,
  getSavedToken,
})(RootScene);
