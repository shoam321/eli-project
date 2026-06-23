import React from 'react';
import { TouchableOpacity, Text, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';

import styles from '../config/styles';

const Button = props => (
  <TouchableOpacity
    {...props} disabled={props.disabled}
    style={[styles.component.buttonContainer, props.style]}
  >
    <Text style={[styles.component.buttonText, props.textStyle]}>
      {props.text}
    </Text>
  </TouchableOpacity>
);

Button.propTypes = {
  text: PropTypes.string,
  disabled: PropTypes.bool,
  style: ViewPropTypes.style,
  textStyle: Text.propTypes.style,
};

Button.defaultProps = {
  text: '',
  disabled: false,
  style: {},
  textStyle: {},
};

export default Button;
