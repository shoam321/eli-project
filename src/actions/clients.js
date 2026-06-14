import { Toast } from '../components/Notification';
import restClient from '../config/axios';
import { mainTypes } from './types';
import { remote, scapeRegExp } from '../config/constants';

export const clientSearch = (client, string) => {
  const regexp = new RegExp(scapeRegExp(string), 'i');
  return client.name.search(regexp) >= 0
    || client.last_name.search(regexp) >= 0
    || client.phone.search(regexp) >= 0;
};

export const getClientName = (client) => {
  if (client.name && client.last_name) return `${client.name} ${client.last_name}`;
};

export const getClients = () => dispatch => restClient.getAxios().post(remote.api, { tag: 'get_all_clients' })
  .then((response) => {
    dispatch({
      type: mainTypes.DATA_LOADED,
      payload: response.data.clients,
      key: 'clients',
    });
    return Promise.resolve(response.data);
  })
  .catch(e => Promise.reject(e));

export const postClient = client => dispatch => restClient.getAxios().post(remote.api, { tag: 'add_client', client })
  .then((response) => {
    getClients()(dispatch);
    Toast.showMessage('Clients', 'Add client: success');
    return Promise.resolve(response.data);
  })
  .catch(error => Promise.reject(error));

export const getClient = id => (/* dispatch */) => restClient.getAxios().post(remote.api, { tag: 'get_client_by_id', cl_id: id })
  .then(response => Promise.resolve(response.data))
  .catch(error => Promise.reject(error));

export const updateClient = client => dispatch => restClient.getAxios().post(remote.api, { tag: 'update_client', client })
  .then((response) => {
    getClients()(dispatch);
    Toast.showMessage('Clients', 'Update client: success');
    return Promise.resolve(response.data);
  })
  .catch(error => Promise.reject(error));

  export const deleteClient = id => dispatch => restClient.getAxios().post(remote.api, { tag: 'delete_client', id })
  .then(({ response }) => {
    return Promise.resolve(response);
  })
  .catch(error => Promise.reject(error));
