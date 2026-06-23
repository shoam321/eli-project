import restClient from '../config/axios';
import { mainTypes } from './types';
import { remote } from '../config/constants';

export const sellHistorySearch = () => true;

export const getSellHistoryItems = () => dispatch => restClient.getAxios().post(remote.api, { tag: 'get_sell_history' })
  .then(({ data }) => {
    dispatch({ type: mainTypes.DATA_LOADED, payload: data.data, key: 'sellHistories' });
    return Promise.resolve(data);
  })
  .catch(error => Promise.reject(error));
