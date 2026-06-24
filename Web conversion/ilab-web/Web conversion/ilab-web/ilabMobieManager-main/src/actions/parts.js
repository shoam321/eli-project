/* eslint-disable camelcase */
import { Toast } from '../components/Notification';
import restClient from '../config/axios';
import { remote, scapeRegExp } from '../config/constants';
import { mainTypes } from './types';

export const partSearch = (part, string) => {
  const regexp = new RegExp(scapeRegExp(string), 'i');
  return (
    (part.pr_name || part).search(regexp) >= 0 ||
    (part.sup_name || '').search(regexp) >= 0 ||
    (part.model || '').toString().search(regexp) >= 0
  );
};

export const getParts = () => (dispatch) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'get_all_parts' })
    .then((response) => {
      dispatch({
        type: mainTypes.DATA_LOADED,
        payload: response.data.suplier,
        key: 'parts',
      });
      return Promise.resolve(response.data);
    })
    .catch((error) => Promise.reject(error));

export const getSupplierParts = (sup_id) => () =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'get_sup_part', sup_id })
    .then((response) => Promise.resolve(response.data))
    .catch((error) => Promise.reject(error));

export const getUserParts = (data) => () =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'user_parts', data })
    .then((response) => Promise.resolve(response.data))
    .catch((error) => Promise.reject(error));

export const getNextPartSerialNumber = () => () =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'get_next_part_serial_number' })
    .then((response) => Promise.resolve(response.data))
    .catch((error) => Promise.reject(error));

export const getSupplierBrandParts = (sup_id, br_id) => (/* dispatch */) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'get_sup_brand_parts', sup_id, br_id })
    .then((response) => Promise.resolve(response.data))
    .catch((error) => Promise.reject(error));

export const getSupplierBrandModelParts = (
  sup_id,
  br_id,
  model
) => (/* dispatch */) =>
  restClient
    .getAxios()
    .post(remote.api, {
      tag: 'get_sup_brand_parts_model',
      sup_id,
      br_id,
      model,
    })
    .then(({ data }) => Promise.resolve(data))
    .catch((e) => Promise.reject(e));

export const postPart = (part) => (dispatch) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'add_sup_part', part })
    .then((response) => {
      getParts()(dispatch);
      Toast.showMessage('Parts', 'Add part: success');
      return Promise.resolve(response.data);
    })
    .catch((error) => Promise.reject(error));

export const updatePart = (part) => (dispatch) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'update_sup_part', part })
    .then((response) => {
      getParts()(dispatch);
      Toast.showMessage('Parts', 'Update part: success');
      return Promise.resolve(response.data);
    })
    .catch((error) => Promise.reject(error));

export const deletePart = (id) => (dispatch) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'delete_part', id })
    .then((response) => {
      console.log('id to delete', id);
      console.log('result', response.data);
      getParts()(dispatch);
      Toast.showMessage('Parts', 'Delete part: success');
      return Promise.resolve(response.data);
    })
    .catch((error) => Promise.reject(error));
