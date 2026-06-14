import React from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';

import styles from '../config/styles';

const TextInfo = React.forwardRef((props) => (
  <View style={styles.component.textInfoWrapper}>
    <View>
      <Text
        style={[
          styles.component.textInfoTitle,
          !props.value && styles.component.textInfoTitleEmpty,
        ]}
      >
        {props.label}
      </Text>
      <Text
        style={[
          styles.component.textInfoText,
          !props.value && styles.component.textInfoTextEmpty,
        ]}
      >
        {props.value}
      </Text>
    </View>
  </View>
));

TextInfo.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
};

TextInfo.defaultProps = {
  value: '',
  label: '',
};

export default TextInfo;
