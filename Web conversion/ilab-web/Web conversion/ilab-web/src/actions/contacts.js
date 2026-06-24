import { scapeRegExp } from '../config/constants';

export const contactSearch = (contact, string) => {
  const gname = contact.givenName || '';
  const fname = contact.familyName || '';
  const phone = (contact.phoneNumbers[0] || {}).number;
  if (!phone) return false;
  const regexp = new RegExp(scapeRegExp(string), 'i');
  return (`${gname || ''} ${fname || ''} ${phone.replace(/\W/g, '')}`).search(regexp) >= 0;
};

export const getContactName = (contact) => {
  const gname = contact.givenName || '';
  const fname = contact.familyName || '';
  const phone = ((contact.phoneNumbers[0] || {}).number || '').replace(/\D/g, '');
  return `${gname} ${fname} ${phone}`;
};

export const getSupplierFromContact = (contact) => {
  const gname = contact.givenName || '';
  const fname = contact.familyName || '';
  const phone = ((contact.phoneNumbers[0] || {}).number || '').replace(/\D/g, '');
  const email = (contact.emailAddresses[0] || {}).email || '';
  return {
    sup_name: `${gname} ${fname}`,
    sup_email: email,
    sup_phone: phone,
  };
};

export const getClientFromContact = (contact) => {
  const gname = contact.givenName || '';
  const fname = contact.familyName || '';
  const phone = ((contact.phoneNumbers[0] || {}).number || '').replace(/\D/g, '');
  const email = (contact.emailAddresses[0] || {}).email || '';

  return {
    name: gname,
    last_name: fname,
    email,
    phone,
  };
};
