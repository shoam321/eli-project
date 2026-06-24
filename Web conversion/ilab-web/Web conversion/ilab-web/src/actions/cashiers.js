import { remote, scapeRegExp } from '../config/constants';
import restClient from '../config/axios';

export const deviceSearch = (device, string) => {
  const regexp = new RegExp(scapeRegExp(string), 'i');

  return device.brand_name.search(regexp) >= 0
    || device.device_name.search(regexp) >= 0
    || (device.serial_number || '').search(regexp) >= 0
    || (device.model_name && device.model_name.search(regexp) >= 0);
};

export const partSearch = (part, string) => {
  const regexp = new RegExp(scapeRegExp(string), 'i');

  return (part.pr_name || part).search(regexp) >= 0
    || (part.sup_name || '').search(regexp) >= 0
    || (part.serial || '').search(regexp) >= 0
    || (part.model || '').toString().search(regexp) >= 0;
};

export const sellItem = data => () => restClient.getAxios().post(remote.api, { tag: 'sell_item', data })
  .then(response => Promise.resolve(response.data))
  .catch(error => Promise.reject(error));

export const sellItemInvoice = data => () => restClient.getAxios().post(remote.api, { tag: 'sell_item_invoice', data })
  .then(response => Promise.resolve(response.data))
  .catch(error => Promise.reject(error));
