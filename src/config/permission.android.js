import { PermissionsAndroid } from 'react-native';

export const requestImagePickerPermissions = () => PermissionsAndroid.requestMultiple([
  PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
  PermissionsAndroid.PERMISSIONS.CAMERA,
]);

export const requestContactsPermissions = () => PermissionsAndroid.request(
  PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
);

export default {
  requestImagePickerPermissions,
  requestContactsPermissions,
};
