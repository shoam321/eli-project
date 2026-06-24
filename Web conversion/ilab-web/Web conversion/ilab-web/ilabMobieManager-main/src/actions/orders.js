import { Toast } from '../components/Notification';
import restClient from '../config/axios';
import { mainTypes } from './types';
import { remote, scapeRegExp } from '../config/constants';

export const orderSearch = (order, string) => {
  const regexp = new RegExp(scapeRegExp(string), 'i');
  return order.ord_id.search(regexp) >= 0 || order.sup_name.search(regexp) >= 0;
};

export const orderPartSearch = (part, string) => {
  const regexp = new RegExp(scapeRegExp(string), 'i');
  return (
    part.ord_id.search(regexp) >= 0 ||
    part.pr_name.search(regexp) >= 0 ||
    part.br_name.search(regexp) >= 0
  );
};

export const getOrders = () => (dispatch) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'get_orders' })
    .then(({ data }) => {
      dispatch({
        type: mainTypes.DATA_LOADED,
        payload: data.orders,
        key: 'orders',
      });
      return Promise.resolve(data);
    })
    .catch((error) => Promise.reject(error));

export const getOrderParts = (ord_id, sup_id) => (/* dispatch */) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'get_order_parts', ord_id, sup_id })
    .then(({ data }) => Promise.resolve(data))
    .catch((error) => Promise.reject(error));

export const postOrder = (order) => (dispatch) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'add_order', order })
    .then(({ data }) => {
      getOrders()(dispatch);
      Toast.showMessage('Order', 'Add order: success');
      return Promise.resolve(data);
    })
    .catch((e) => Promise.reject(e));

export const postOrderParts = (order) => (dispatch) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'add_part_to_order', order })
    .then(({ data }) => {
      getOrders()(dispatch);
      Toast.showMessage('Order Parts', 'Add order parts: success');
      return Promise.resolve(data);
    })
    .catch((e) => Promise.reject(e));

export const receivedOrderPart = (id) => (dispatch) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'set_order_received', id })
    .then(({ data }) => {
      getOrders()(dispatch);
      Toast.showMessage('Order Parts', 'Received order part: success');
      return Promise.resolve(data);
    })
    .catch((e) => Promise.reject(e));

export const expectedOrderPart = (id) => (dispatch) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'set_order_expected', id })
    .then(({ data }) => {
      getOrders()(dispatch);
      Toast.showMessage('Order Parts', 'Expected order part: success');
      return Promise.resolve(data);
    })
    .catch((e) => Promise.reject(e));

export const missingOrderPart = (id) => (dispatch) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'set_order_missing', id })
    .then(({ data }) => {
      getOrders()(dispatch);
      Toast.showMessage('Order Parts', 'Missing order part: success');
      return Promise.resolve(data);
    })
    .catch((e) => Promise.reject(e));

export const canceledOrderPart = (id) => (dispatch) =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'set_order_canceled', id })
    .then(({ data }) => {
      getOrders()(dispatch);
      Toast.showMessage('Order Parts', 'Canceled order part: success');
      return Promise.resolve(data);
    })
    .catch((e) => Promise.reject(e));

export const updateOrderPart = (
  id,
  amount,
  pr_price,
  updateRootPart = 0
) => () =>
  restClient
    .getAxios()
    .post(remote.api, {
      tag: 'update_order',
      id,
      amount,
      pr_price,
      update_root_part_price: updateRootPart,
    })
    .then(({ data }) => {
      Toast.showMessage('Order Parts', 'Update order part: success');
      return Promise.resolve(data);
    })
    .catch((e) => Promise.reject(e));

export const restoreOrderOriginalData = (id) => () =>
  restClient
    .getAxios()
    .post(remote.api, { tag: 'restore_order_original_data', id })
    .then(({ data }) => {
      Toast.showMessage('Order Parts', 'Order data has been restore: success');
      return Promise.resolve(data);
    })
    .catch((e) => Promise.reject(e));
