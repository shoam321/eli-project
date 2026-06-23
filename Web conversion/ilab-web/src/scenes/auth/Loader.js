import React, { Component } from 'react';
import {
  View, Image, ImageBackground, ActivityIndicator, Alert
} from 'react-native';
import { Actions } from 'react-native-router-flux';
//import firebase from 'react-native-firebase';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import firebase from '@react-native-firebase/app'
import messaging from '@react-native-firebase/messaging'
import I18n from '../../lang/i18n';
import { getUser, getSavedToken, getAppLanguage } from '../../actions/user';
import { getBrands } from '../../actions/brands';
import { getModels } from '../../actions/models';
import { getClients } from '../../actions/clients';
import { getProjects } from '../../actions/projects';
import { getDraftProjects } from '../../actions/draftProjects';
import { getOrders } from '../../actions/orders';
import { getSuppliers } from '../../actions/suppliers';
import { getTemporaryDevices } from '../../actions/devices';
import styles, { colors } from '../../config/styles';
import Scene from '../../components/Scene';
import Background from '../../content/images/background-shape.png';
import Logo from '../../content/images/logo.png';

class LoaderScene extends Component {

  

  async componentDidMount(){
    //const status = messaging().requestPermission();
    /*const granted = messaging().requestPermission()

    firebase
    .messaging()
    .getToken()
    .then(fcmToken => {
      console.log(fcmToken);
    });

    console.log(granted);*/

    //await messaging().registerDeviceForRemoteMessages();
    messaging().onMessage(async remoteMessage => {
     
      const object = JSON.parse(remoteMessage.data.info);

      Alert.alert(
        remoteMessage.notification.title,
        remoteMessage.notification.body,
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
          },
          { text: "Open", onPress: () => this.redirectPush(remoteMessage.data.type, object) }
        ],
        { cancelable: false }
      );

    });

    messaging().setBackgroundMessageHandler(function (payload) {
    });

    messaging().onNotificationOpenedApp((data) => {

    });



  };


  redirectPush = (type, object) => {
    switch (type) {
      case 'project': Actions.projectScene({ project: object }); break;
      case 'order': Actions.orderPartsScene({ order: object }); break;
       default: break;
    }
  }

  componentWillMount() {
    let preload = new Promise.resolve(true);
    if (!this.props.logged) preload = this.props.getSavedToken();

    preload
      .then(() => this.props.getAppLanguage())
      .then((data) => {
        I18n.setLocale(data.code);
      })
      .then(() => this.props.getUser())
      .then(() => Promise.all([
        this.props.getProjects(),
        this.props.getDraftProjects(),
        this.props.getOrders(),
      ]))
      .then(() => {
        Actions.menuScene();
        this.props.getBrands();
        this.props.getModels();
        this.props.getTemporaryDevices();
        this.props.getClients();
        this.props.getSuppliers();
       
        messaging().onNotificationOpenedApp(remoteMessage => {
          
          const object = JSON.parse(remoteMessage.data.info);

          switch (remoteMessage.data.type) {
            case 'project': Actions.projectScene({ project: object }); break;
            case 'order': Actions.orderPartsScene({ order: object }); break;
             default: break;
          }
        });

        messaging()
          .getInitialNotification()
          .then((remoteMessage) => {
            console.log(remoteMessage);
            const object = JSON.parse(remoteMessage.data.info);
            switch (remoteMessage.data.type) {
              case 'project': Actions.projectScene({ project: object }); break;
              case 'order': Actions.orderPartsScene({ order: object }); break;
               default: break;
            }
          })
          .catch(() => {});
      })
      .catch(() => Actions.loginScene());
  }

  render() {
    return (
      <Scene>
        <View style={styles.common.backgroundBottomContainerLight}>
          <ImageBackground
            style={styles.common.backgroundBottomImage}
            source={Background}
          />
        </View>
        <View style={styles.scene.splashLogoContainer}>
          <Image style={styles.scene.splashLogoImage} source={Logo} resizeMode="contain" />
          <ActivityIndicator size="large" color={colors.button} />
        </View>
      </Scene>
    );
  }

  static propTypes = {
    logged: PropTypes.bool,
    getUser: PropTypes.func.isRequired,
    getSavedToken: PropTypes.func.isRequired,
    getBrands: PropTypes.func.isRequired,
    getModels: PropTypes.func.isRequired,
    getClients: PropTypes.func.isRequired,
    getSuppliers: PropTypes.func.isRequired,
    getTemporaryDevices: PropTypes.func.isRequired,
    getAppLanguage: PropTypes.func.isRequired,
    getProjects: PropTypes.func.isRequired,
    getDraftProjects: PropTypes.func.isRequired,
    getOrders: PropTypes.func.isRequired,
  };

  static defaultProps = {
    logged: false,
  };
}

export default connect(() => ({}), {
  getUser,
  getBrands,
  getModels,
  getClients,
  getSuppliers,
  getSavedToken,
  getTemporaryDevices,
  getAppLanguage,
  getProjects,
  getDraftProjects,
  getOrders,
})(LoaderScene);
