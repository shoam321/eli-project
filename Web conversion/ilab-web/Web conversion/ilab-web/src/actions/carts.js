import { Toast } from '../components/Notification';
import restClient from '../config/axios';
import { mainTypes } from './types';
import { remote, scapeRegExp } from '../config/constants';

export const cartPartSearch = (part, string) => {
  const regexp = new RegExp(scapeRegExp(string), 'i');
  return part.pr_name.search(regexp) >= 0
    || part.br_name.search(regexp) >= 0;
};

export const getCartItems = () => dispatch => restClient.getAxios().post(remote.api, { tag: 'get_cart_items' })
  .then(({ data }) => {
    dispatch({ type: mainTypes.DATA_LOADED, payload: data.card_items, key: 'carts' });
    return Promise.resolve(data);
  })
  .catch(error => Promise.reject(error));

export const addCartItem = item => dispatch => restClient.getAxios().post(remote.api, { tag: 'add_cart_item', item })
  .then(({ data }) => {
    getCartItems()(dispatch);
    Toast.showMessage('Cart', 'Add item: success');
    return Promise.resolve(data);
  })
  .catch(e => Promise.reject(e));

export const updateCartItem = (id, amount, part_price, updateRootPart = 0, part_id, supplier_id) => dispatch => restClient.getAxios().post(remote.api, {
  tag: 'update_cart_item', id, amount, part_price, update_root_part_price: updateRootPart, part_id, supplier_id,
})
  .then(({ data }) => {
    getCartItems()(dispatch);
    Toast.showMessage('Cart', 'Update cart item: success');
    return Promise.resolve(data);
  })
  .catch(e => Promise.reject(e));

export const deleteCartItem = items => dispatch => restClient.getAxios().post(remote.api, {
  tag: 'delete_cart_items', items,
})
  .then(({ data }) => {
    getCartItems()(dispatch);
    return Promise.resolve(data);
  })
  .catch(e => Promise.reject(e));
