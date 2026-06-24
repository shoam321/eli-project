import restClient from '../config/axios';
import { mainTypes } from './types';
import { remote, scapeRegExp } from '../config/constants';

export const brandSearch = (brand, string) => {
  const regexp = new RegExp(scapeRegExp(string), 'i');
  return brand.name.search(regexp) >= 0;
};

export const getBrands = () => (dispatch) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'get_brands' })
    .then(({ data }) => {
      dispatch({
        type: mainTypes.DATA_LOADED,
        payload: data.brands,
        key: 'brands',
      });
      return Promise.resolve(data);
    })
    .catch((e) => Promise.reject(e));

export const getSupplierBrands = (sup_id) => (/* dispatch */) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'get_suplier_brands', sup_id })
    .then(({ data }) => Promise.resolve(data))
    .catch((e) => Promise.reject(e));

export const postBrand = (name) => (dispatch) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'add_brand', brand: name })
    .then((response) => {
      getBrands()(dispatch);
      return Promise.resolve(response.data);
    })
    .catch((e) => Promise.reject(e));

export const updateBrand = (brand) => (dispatch) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'update_brand', brand })
    .then((response) => {
      getBrands()(dispatch);
      return Promise.resolve(response.data);
    })
    .catch((e) => Promise.reject(e));

export const setBrandStatus = (id, status) => (dispatch) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'change_brand_status', id, status })
    .then((response) => {
      getBrands()(dispatch);
      return Promise.resolve(response.data);
    })
    .catch((e) => Promise.reject(e));
