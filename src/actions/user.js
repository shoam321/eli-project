import {NativeModules, Platform } from 'react-native';
//import firebase from 'react-native-firebase';
import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-community/async-storage';

import restClient from '../config/axios';
import { userTypes } from './types';
import { remote, appLanguages } from '../config/constants';

messaging().requestPermission();

export const getFcmToken = () => () => firebase.messaging().getToken()
  .then(token => {
    console.log(token);
    return Promise.resolve(token)
  })
  .catch(error => Promise.reject(error));

export const postFcmToken = dev_key => (/* dispatch */) => restClient.getAxios().post(remote.api, { dev_key, tag: 'add_user_dev_key' })
  .then(response => Promise.resolve(response.data))
  .catch(error => Promise.reject(error));

export const getSavedToken = () => () => AsyncStorage.getItem('access_token')
  .then((token) => {
    restClient.setToken(token);
    return Promise.resolve(token);
  });

export const getAppLanguage = () => () => AsyncStorage.getItem('app_language')
  .then((data) => {
    let deviceLanguage = 'en';

    try {
      if (Platform.OS === 'android') {
        deviceLanguage = NativeModules.I18nManager.localeIdentifier;
      } else {
        deviceLanguage = NativeModules.SettingsManager.settings.AppleLocale;
      }

      deviceLanguage = deviceLanguage.substring(0, 2);

      // Fix hebrew
      if (deviceLanguage === 'iw') {
        deviceLanguage = 'he';
      }
    } catch (e) {
      // Handle
    }

    if (data) {
      data = JSON.parse(data);
    } else {
      data = appLanguages.find(appLanguage => appLanguage.code === deviceLanguage) || appLanguages[0];
    }

    return Promise.resolve(data);
  });

export const saveToken = token => (/* dispatch */) => AsyncStorage.setItem('access_token', token);

export const setAppLanguage = data => () => AsyncStorage.setItem('app_language', JSON.stringify(data));

export const getSavedLogin = () => (/* dispatch */) => AsyncStorage.getItem('_login')
  .then((login) => {
    if (!login) return Promise.reject('Login is null');
    else return Promise.resolve(login);
  });

export const saveLogin = login => (/* dispatch */) => AsyncStorage.setItem('_login', login);

export const logIn = credentials => (/* dispatch */) => restClient.getAxios().post(remote.api, { ...credentials, tag: 'login_user' })
  .then(({ data }) => {
    console.log(data);
    saveLogin(credentials.email)();
    saveToken(data.token)();
    restClient.setToken(data.token);
    getFcmToken()().then(token => postFcmToken(token)()).catch((res) => {console.log(res)});
    return Promise.resolve(data);
  })
  .catch(error => Promise.reject(error));

export const getUser = () => dispatch => restClient.getAxios().post(remote.api, { tag: 'get_user_info' })
  .then(({ data }) => {
    dispatch({ type: userTypes.USER_LOADED, payload: data.user });
    return Promise.resolve(data);
  })
  .catch(error => Promise.reject(error));

export const updateCurrentUser = data => dispatch => restClient.getAxios().post(remote.api, { tag: 'update_current_user', data })
  .then(({ data }) => {
    dispatch({ type: userTypes.USER_LOADED, payload: data.user });
    return Promise.resolve(data);
  })
  .catch(error => Promise.reject(error));

export const logOut = () => dispatch => restClient.getAxios().post(remote.api, { tag: 'logout_user' })
  .then((response) => {
    dispatch({ type: userTypes.USER_LOADED, payload: {} });
    return Promise.resolve(response);
  })
  .catch(error => Promise.reject(error));
