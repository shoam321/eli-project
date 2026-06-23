import React from 'react';
import { TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import PropTypes from 'prop-types';
import { colors } from '../config/styles';

const Checkbox = React.forwardRef((props) => (
  <TouchableOpacity
    {...props}
    activeOpacity={1}
    onPress={() => props.onChange(!props.value)}
  >
    {props.value ? (
      <MaterialIcons
        name="check-box"
        size={props.iconSize}
        color={colors.button}
      />
    ) : (
      <MaterialIcons
        name="check-box-outline-blank"
        size={props.iconSize}
        color={colors.button}
      />
    )}
  </TouchableOpacity>
));

Checkbox.propTypes = {
  value: PropTypes.bool,
  iconSize: PropTypes.integer,
  onChange: PropTypes.func.isRequired,
};

Checkbox.defaultProps = {
  value: false,
  iconSize: 34,
};

export default Checkbox;
