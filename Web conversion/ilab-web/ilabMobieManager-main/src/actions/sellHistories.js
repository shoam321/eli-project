import restClient from '../config/axios';
import { mainTypes } from './types';
import { remote, scapeRegExp } from '../config/constants';

export const sellHistorySearch = (device, string) => {
  const item = device.json.data.item_for_sell;

  const regexp = new RegExp(scapeRegExp(string), 'i');

  return (
    item?.br_name?.search(regexp) >= 0 ||
    item?.pr_name?.search(regexp) >= 0 ||
    (item?.serial || '')?.search(regexp) >= 0 ||
    (item?.m_name && item?.m_name?.search(regexp) >= 0)
  );
};

export const getSellHistoryItems = () => (dispatch) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'get_sell_history' })
    .then(({ data }) => {
      dispatch({
        type: mainTypes.DATA_LOADED,
        payload: data.data,
        key: 'sellHistories',
      });
      return Promise.resolve(data);
    })
    .catch((error) => Promise.reject(error));
