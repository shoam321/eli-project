import React, { useState } from 'react';
import { TouchableOpacity, Text, ViewPropTypes, Image } from 'react-native';
import PropTypes from 'prop-types';

import { component } from '../config/styles';

const Button = (props) => {
  const {
    style,
    text,
    textStyle,
    pressOnce,
    icon,
    iconLeft,
    iconStyle,
    timeout = 3000,
  } = props;
  const [disabled, setDisabled] = useState(false);

  return (
    <TouchableOpacity
      {...props}
      onPress={() => {
        if (pressOnce) {
          setDisabled(true);
          setTimeout(() => setDisabled(false), timeout);
        }
        props.onPress();
      }}
      disabled={disabled || props.disabled}
      style={[component.buttonContainer, style]}
    >
      {iconLeft && icon && (
        <Image source={icon} style={[{ height: 24, width: 24 }, iconStyle]} />
      )}
      <Text style={[component.buttonText, textStyle]}>{text}</Text>
      {icon && !iconLeft && (
        <Image source={icon} style={[{ height: 24, width: 24 }, iconStyle]} />
      )}
    </TouchableOpacity>
  );
};

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
