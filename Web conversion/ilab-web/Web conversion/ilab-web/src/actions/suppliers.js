import { Toast } from '../components/Notification';
import restClient from '../config/axios';
import { mainTypes } from './types';
import { remote, scapeRegExp } from '../config/constants';

export const supplierSearch = (supplier, string) => {
  const regexp = new RegExp(scapeRegExp(string), 'i');
  return supplier.sup_name.search(regexp) >= 0
    || supplier.sup_phone.search(regexp) >= 0;
};

export const getSuppliers = () => dispatch => restClient.getAxios().post(remote.api, { tag: 'get_company_supliers' })
  .then(({ data }) => {
    dispatch({ type: mainTypes.DATA_LOADED, payload: data.suplier, key: 'suppliers' });
    return Promise.resolve(data);
  })
  .catch(error => Promise.reject(error));

export const postSupplier = supplier => dispatch => restClient.getAxios().post(remote.api, { tag: 'add_suplier', suplier: supplier })
  .then((response) => {
    getSuppliers()(dispatch);
    Toast.showMessage('Suppliers', 'Add supplier: success');
    return Promise.resolve(response.data);
  })
  .catch(error => Promise.reject(error));

export const updateSupplier = supplier => dispatch => restClient.getAxios().post(remote.api, { tag: 'update_suplier', suplier: supplier })
  .then((response) => {
    getSuppliers()(dispatch);
    Toast.showMessage('Suppliers', 'Update supplier: success');
    return Promise.resolve(response.data);
  })
  .catch(error => Promise.reject(error));


  export const deleteSupplier = id => dispatch => restClient.getAxios().post(remote.api, { tag: 'delete_suplier', sup_id: id })
  .then(({ response }) => {
    return Promise.resolve(response);
  })
  .catch(error => Promise.reject(error));