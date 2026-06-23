import React, { Component } from 'react';
import {
  TextInput as RNTextInput,
  View,
  ViewPropTypes,
  Text,
  TouchableOpacity,
} from 'react-native';
// import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Feather';
import PropTypes from 'prop-types';

import { colors, component } from '../config/styles';

class TextInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value.toString() || '0',
    };
  }

  handleChangeValue = (value) => {
    const { min, max } = this.props;
    if (min !== undefined && +value < min) return;
    if (max !== undefined && +value > max) return;
    this.setState({ value: value.toString() });
    this.props.onChangeValue(value);
  };

  // For force refresh
  componentWillReceiveProps(props) {
    if (!props.refreshedComponent)
      this.setState({
        value: props.value.toString() || '0',
      });
  }

  render() {
    return (
      <View>
        {this.props.hint && (
          <Text style={component.textInputHintText}>
            {this.state.value && this.state.value.length > 0
              ? `${this.props.placeholder}${
                  this.props.requiredMark ? ' * ' : ''
                }`
              : ' '}
          </Text>
        )}
        <View
          style={[
            component.textInputContainer,
            this.props.editable ? { paddingLeft: 15 } : {},
          ]}
        >
          {this.props.editable && (
            <TouchableOpacity
              hitSlop={{
                bottom: 10,
                left: 20,
                right: 20,
                top: 10,
              }}
              onPress={() => this.handleChangeValue(+this.state.value - 1)}
            >
              <Icon name="minus-circle" size={25} color={colors.button} />
            </TouchableOpacity>
          )}
          <RNTextInput
            underlineColorAndroid="transparent"
            placeholderTextColor={colors.placeholder}
            {...this.props}
            placeholder={`${this.props.placeholder}${
              this.props.requiredMark ? ' * ' : ''
            }`}
            editable={false}
            keyboardType="numeric"
            value={this.state.value}
            onChangeText={this.handleChangeValue}
            style={[
              component.textInputText,
              this.props.textStyle,
              this.props.editable ? component.integerInputText : {},
            ]}
          />
          {this.props.editable && (
            <TouchableOpacity
              hitSlop={{
                bottom: 10,
                left: 20,
                right: 20,
                top: 10,
              }}
              onPress={() => this.handleChangeValue(+this.state.value + 1)}
            >
              <Icon name="plus-circle" size={25} color={colors.button} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
}

TextInput.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
  hint: PropTypes.bool,
  editable: PropTypes.bool,
  textStyle: RNTextInput.propTypes.style,
  onChangeValue: PropTypes.func,
  requiredMark: PropTypes.bool,
  ...RNTextInput.propTypes,
};

TextInput.defaultProps = {
  min: undefined,
  max: undefined,
  hint: false,
  requiredMark: false,
  editable: true,
  textStyle: {},
  onChangeValue: () => {},
};

export default TextInput;
