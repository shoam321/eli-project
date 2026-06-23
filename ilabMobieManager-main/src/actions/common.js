import { Platform, Alert } from 'react-native';
import { Actions } from 'react-native-router-flux';
import RNFetchBlob from 'rn-fetch-blob';

export const getArrayItemByKey = (array, value, key = 'id') =>
  array.find((item) => item[key] === value);

export const readFile = (uri) => {
  const file = Platform.select({
    android: uri,
    ios: `/${uri.replace(/.*:\/\//, '/')}`,
  });
  return RNFetchBlob.fs.readFile(file, 'base64');
};

export const handleBackButtonPress = () => {
  Alert.alert('Are you sure?', 'All changes will be lost', [
    { text: 'Cancel' },
    {
      text: 'Ok',
      onPress: () => Actions.pop(),
    },
  ]);
  return true;
};
