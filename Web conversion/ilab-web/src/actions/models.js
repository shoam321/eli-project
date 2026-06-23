import { Toast } from '../components/Notification';
import restClient from '../config/axios';
import { mainTypes } from './types';
import { remote, scapeRegExp } from '../config/constants';

export const modelSearch = (model, string) => {
  const regexp = new RegExp(scapeRegExp(string), 'i');
  return model.m_name.search(regexp) >= 0;
};

export const getModels = () => dispatch => restClient.getAxios().post(remote.api, { tag: 'get_company_models' })
  .then(({ data }) => {
    dispatch({ type: mainTypes.DATA_LOADED, payload: data.models, key: 'models' });
    return Promise.resolve(data);
  })
  .catch(e => Promise.reject(e));

export const getActiveModels = () => (/* dispatch */) => restClient.getAxios().post(remote.api, { tag: 'get_all_active_models' })
  .then(({ data }) => Promise.resolve(data))
  .catch(e => Promise.reject(e));

export const getBrandModels = br_id => (/* dispatch */) => restClient.getAxios().post(remote.api, { tag: 'get_model_by_brand', br_id })
  .then(({ data }) => Promise.resolve(data))
  .catch(e => Promise.reject(e));

export const getModelsBySuplierBrand = (sup_id, br_id) => (/* dispatch */) => restClient.getAxios().post(remote.api, {tag: 'get_models_by_suplier_brand', sup_id, br_id}) 
  .then(({ data }) => Promise.resolve(data))
  .catch(e => Promise.reject(e));

export const postModel = model => dispatch => restClient.getAxios().post(remote.api, { tag: 'add_model', model })
  .then((response) => {
    getModels()(dispatch);
    Toast.showMessage('Models', 'Add model: success');
    return Promise.resolve(response.data);
  })
  .catch(e => Promise.reject(e));


export const setModelStatus = (md_id, status) => dispatch => restClient.getAxios().post(remote.api, { tag: 'change_model_status', md_id, status })
  .then((response) => {
    getModels()(dispatch);
    return Promise.resolve(response.data);
  })
  .catch(e => Promise.reject(e));
