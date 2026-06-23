import React from 'react';
import {
  TextInput as RNTextInput,
  View,
  ViewPropTypes,
  Text,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Octicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import PropTypes from 'prop-types';

import { colors, component } from '../config/styles';

export const TextInputIcon = {
  Triangle: (props) => (
    <Icon
      name="triangle-right"
      style={component.textInputLeftIcon}
      {...props}
    />
  ),
  Help: (props) => (
    <MaterialIcon
      name="help"
      size={19}
      style={component.textInputLeftIcon}
      {...props}
    />
  ),
  Expanded: (props) => (
    <Icon name="triangle-down" style={component.textInputLeftIcon} {...props} />
  ),
  Canceled: (props) => (
    <Icon name="x" size={19} color={colors.button} {...props} />
  ),
  Check: (props) => (
    <Icon
      name="check"
      size={19}
      style={component.textInputLeftIcon}
      {...props}
    />
  ),
  Eye: (props) => (
    <Icon name="eye" size={24} color={colors.button} {...props} />
  ),
  GoRight: (props) => (
    <MaterialIcon
      name="chevron-double-right"
      size={30}
      color={colors.button}
      {...props}
    />
  ),
  Clear: (props) => (
    <Icon name="x" size={25} color={colors.button} {...props} />
  ),
  Search: (props) => (
    <Icon name="search" size={22} color={colors.blackBackground} {...props} />
  ),
  Filter: (props) => (
    <MaterialIcon
      name="filter"
      size={25}
      color={colors.blackBackground}
      {...props}
    />
  ),
  Calendar: (props) => (
    <Icon name="calendar" size={25} color={colors.button} {...props} />
  ),
  Camera: (props) => (
    <MaterialIcon name="camera" size={25} color={colors.button} {...props} />
  ),
  Phone: (props) => (
    <MaterialIcon
      name="phone-in-talk"
      size={25}
      color={colors.button}
      {...props}
    />
  ),
  Mail: (props) => (
    <Icon name="mail" size={25} color={colors.button} {...props} />
  ),
};

const TextInput = React.forwardRef((props, ref) => (
  <>
    {props.hint && (
      <Text style={component.textInputHintText}>
        {props.value && props.value.length > 0
          ? `${props.placeholder}${props.requiredMark ? ' * ' : ''}`
          : ' '}
      </Text>
    )}
    <View style={[component.textInputContainer, props.containerStyle]}>
      {props.left}
      <RNTextInput
        pointerEvents={!props.editable ? 'box-none' : undefined}
        underlineColorAndroid="transparent"
        placeholderTextColor={colors.placeholder}
        {...props}
        ref={ref}
        placeholder={`${props.placeholder}${props.requiredMark ? ' * ' : ''}`}
        style={[
          { height: props.multiline ? 98 : undefined },
          component.textInputText,
          props.textStyle,
        ]}
        left={undefined}
        right={undefined}
        containerStyle={undefined}
        editable={props.editable}
      />
      {props.right && (
        <TouchableOpacity onPress={props.onRightButtonPress}>
          {props.right}
        </TouchableOpacity>
      )}
    </View>
  </>
));

TextInput.propTypes = {
  editable: PropTypes.bool,
  hint: PropTypes.bool,
  left: PropTypes.node,
  right: PropTypes.node,
  requiredMark: PropTypes.bool,
  textStyle: RNTextInput.propTypes.style,
  containerStyle: ViewPropTypes.style,
  onLeftButtonPress: PropTypes.func,
  onRightButtonPress: PropTypes.func,
  ...RNTextInput.propTypes,
};

TextInput.defaultProps = {
  editable: true,
  hint: false,
  requiredMark: false,
  left: null,
  right: null,
  textStyle: {},
  containerStyle: {},
  onLeftButtonPress: undefined,
  onRightButtonPress: undefined,
};

export default TextInput;
