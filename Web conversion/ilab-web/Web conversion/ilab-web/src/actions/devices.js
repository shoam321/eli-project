import { Toast } from '../components/Notification';
import restClient from '../config/axios';
import { mainTypes } from './types';
import { remote, scapeRegExp } from '../config/constants';

export const deviceSearch = (device, string) => {
  const regexp = new RegExp(scapeRegExp(string), 'i');
  return device.brand_name.search(regexp) >= 0
    || device.device_name.search(regexp) >= 0
    || (device.model_name && device.model_name.search(regexp) >= 0);
};

export const getDeviceName = (device) => {
  if (device.brand_name) return `${device.brand_name || ''} ${device.model_name || ''}`;
  else return device.device_name;
};

export const getMyDevices = () => dispatch => restClient.getAxios().post(remote.api, { tag: 'get_my_devices' })
  .then((response) => {
    dispatch({ type: mainTypes.DATA_LOADED, payload: response.data.devices, key: 'devices' });
    return Promise.resolve(response.data);
  })
  .catch(e => Promise.reject(e));

export const getClientDevices = cl_id => (/* dispatch */) => restClient.getAxios().post(remote.api, { tag: 'get_client_devices', cl_id })
  .then(response => Promise.resolve(response.data))
  .catch(error => Promise.reject(error));

export const getTemporaryDevices = () => dispatch => restClient.getAxios().post(remote.api, { tag: 'get_tmp_devices' })
  .then((response) => {
    dispatch({ type: mainTypes.DATA_LOADED, payload: response.data.devices, key: 'tempDevices' });
    return Promise.resolve(response.data);
  })
  .catch(error => Promise.reject(error));

export const postDevice = device => dispatch => restClient.getAxios().post(remote.api, { tag: 'add_client_device', device })
  .then((response) => {
    getMyDevices()(dispatch);
    getTemporaryDevices()(dispatch);

    Toast.showMessage('Devices', 'Add device: success');
    return Promise.resolve(response.data);
  })
  .catch(error => Promise.reject(error));

export const deleteDevice = device => dispatch => restClient.getAxios().post(remote.api, { tag: 'delete_device', device })
  .then((response) => {
    getMyDevices()(dispatch);
    getTemporaryDevices()(dispatch);

    Toast.showMessage('Devices', 'Delete device: success');
    return Promise.resolve(response.data);
  })
  .catch(error => Promise.reject(error));

export const getDevice = id => (/* dispatch */) => restClient.getAxios().post(remote.api, { tag: 'get_device_by_id', id })
  .then(response => Promise.resolve(response.data))
  .catch(error => Promise.reject(error));

export const updateDevice = device => dispatch => restClient.getAxios().post(remote.api, { tag: 'update_client_device', device })
  .then((response) => {
    getMyDevices()(dispatch);
    getTemporaryDevices()(dispatch);
    Toast.showMessage('Devices', 'Update device: success');
    return Promise.resolve(response.data);
  })
  .catch(error => Promise.reject(error));

export const buyDevice = id => dispatch => restClient.getAxios().post(remote.api, { tag: 'buy_device', id })
  .then((response) => {
    getMyDevices()(dispatch);
    Toast.showMessage('Devices', 'Buy device: success');
    return Promise.resolve(response.data);
  })
  .catch(error => Promise.reject(error));

export const postDeviceImage = (dev_id, image) => (/* dispatch */) => restClient.getAxios().post(`${remote.host}/saveImageDev`, { dev_id, image })
  .then(response => Promise.resolve(response.data))
  .catch(error => Promise.reject(error));

export const removeDeviceImage = id => (/* dispatch */) => restClient.getAxios().post(remote.api, { tag: 'delete_dev_image', id })
  .then(response => Promise.resolve(response.data))
  .catch(error => Promise.reject(error));
