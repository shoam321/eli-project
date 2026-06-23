import { colors } from './styles';

// Development
// host: 'https://dev.ilabassistant.com',
// api: 'https://dev.ilabassistant.com/ApiForApp',
// sharing: 'https://dev.ilabassistant.com',

// Production
// host: 'https://app.ilabassistant.com',
// api: 'https://app.ilabassistant.com/ApiForApp',
// sharing: 'https://app.ilabassistant.com',

export const remote = {
  host: 'https://app.ilabassistant.com',
  api: 'https://app.ilabassistant.com/ApiForApp',
  sharing: 'https://app.ilabassistant.com',
};

export const deviceType = {
  CLIENT: 1,
  TEMPORARY: 2,
  OWN: 3,
  DELETED: 4,
};

export const sellItemType = {
  DEVICE: 1,
  PART: 2,
};

export const cashierItemType = {
  NEW: 1,
  USED: 2,
};

export const cashierItemTypes = [
  { id: cashierItemType.NEW, name: 'translation.new' },
  { id: cashierItemType.USED, name: 'translation.used' },
];

export const paymentTypes = {
  CASH: 1,
  CREDIT_CARD: 3,
};

export const paymentTypeItems = [
  { id: paymentTypes.CASH, name: 'translation.cash' },
  { id: paymentTypes.CREDIT_CARD, name: 'translation.creditCard' },
];

export const paymentMethods = {
  NOT_IN_LIST: 0,
  VISA: 2,
  MASTERCARD: 99,
};

export const paymentMethodItems = [
  { id: paymentMethods.NOT_IN_LIST, name: 'translation.notInList' },
  { id: paymentMethods.VISA, name: 'translation.visa' },
  { id: paymentMethods.MASTERCARD, name: 'translation.mastercard' },
];

export const projectStatus = {
  OPEN: 1,
  FINISHED: 2,
  CANCELED: 3,
  DELAYED: 4,
};

export const projectStatusItems = [
  {
    id: projectStatus.OPEN,
    name: 'translation.open',
    color: colors.statusYellow,
  },
  {
    id: projectStatus.FINISHED,
    name: 'translation.finished',
    color: colors.statusGreen,
  },
  {
    id: projectStatus.CANCELED,
    name: 'translation.canceled',
    color: colors.statusRed,
  },
  {
    id: projectStatus.DELAYED,
    name: 'translation.delayed',
    color: colors.statusYellow,
  },
];

export const projectFilterItems = [
  {
    id: projectStatus.OPEN,
    name: 'translation.openDelayed',
    color: colors.statusYellow,
  },
  {
    id: projectStatus.FINISHED,
    name: 'translation.finished',
    color: colors.statusGreen,
  },
  {
    id: projectStatus.CANCELED,
    name: 'translation.canceled',
    color: colors.statusRed,
  },
];

export const projectSortItems = [
  { id: 1, name: 'translation.sortCreation', key: 'created_at' },
  { id: 2, name: 'translation.sortDueDate', key: 'due_date' },
];

export const deviceUsingItems = [
  { id: 1, name: 'translation.any', key: 'any' },
  { id: 2, name: 'translation.used', key: 'used' },
  { id: 3, name: 'translation.unused', key: 'unused' },
];

export const deviceDeletingItems = [
  { id: 1, name: 'translation.any', key: 'any' },
  { id: 2, name: 'translation.deleted', key: 'deleted' },
  { id: 3, name: 'translation.noDeleted', key: 'no_deleted' },
];

export const deviceTemporaryDeviceItems = [
  { id: 1, name: 'translation.any', key: 'any' },
  { id: 2, name: 'translation.temporary', key: 'temporary' },
  { id: 3, name: 'translation.noTemporary', key: 'noTemporary' },
];

export const getProjectStatus = (id) => {
  const obj = projectStatusItems.find((item) => item.id === id);
  return obj || {};
};

export const orderStatus = {
  EXPECTED: 1,
  RECEIVED: 2,
  MISSING: 3,
  CANCELED: 4,
};

export const orderStatusItems = [
  {
    id: orderStatus.EXPECTED,
    name: 'translation.expected',
    color: colors.statusYellow,
  },
  {
    id: orderStatus.RECEIVED,
    name: 'translation.received',
    color: colors.statusGreen,
  },
  {
    id: orderStatus.MISSING,
    name: 'translation.missing',
    color: colors.statusYellow,
  },
  {
    id: orderStatus.CANCELED,
    name: 'translation.canceled',
    color: colors.statusRed,
  },
];

export const getOrderStatus = (id) => {
  const obj = orderStatusItems.find((item) => item.id === id);
  return obj || {};
};

export const deviceStatusItems = [
  {
    id: deviceType.CLIENT,
    name: 'translation.client',
    color: colors.statusYellow,
  },
  {
    id: deviceType.TEMPORARY,
    name: 'translation.temporary',
    color: colors.statusGreen,
  },
  { id: deviceType.OWN, name: 'translation.own', color: colors.statusYellow },
  {
    id: deviceType.DELETED,
    name: 'translation.deleted',
    color: colors.statusRed,
  },
];

export const getDeviceStatus = (id, used) => {
  let obj = deviceStatusItems.find((item) => item.id === id);

  if (used !== 0) {
    obj = { name: 'translation.used', color: colors.statusYellow };
  }

  return obj || {};
};

// eslint-disable-next-line
export const scapeRegExp = str => (str || '').replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

export const appLanguages = [
  {
    id: 'en',
    code: 'en',
    direction: 'ltr',
  },
  {
    id: 'he',
    code: 'he',
    direction: 'rtl',
  },
  {
    id: 'ru',
    code: 'ru',
    direction: 'ltr',
  },
];
