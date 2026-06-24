import React, { Component } from 'react';
import {
  TextInput as RNTextInput, View, ViewPropTypes, Text, TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import PropTypes from 'prop-types';

import styles, { colors } from '../config/styles';

class TextInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value.toString() || '0',
    };
  }

  handleChangeValue(value) {
    const { min, max } = this.props;
    if (min !== undefined && +value < min) return;
    if (max !== undefined && +value > max) return;
    this.setState({ value: value.toString() });
    this.props.onChangeValue(value);
  }

  // For force refresh
  componentWillReceiveProps(props) {
    if (!props.refreshedComponent) {
      this.setState({
        value: props.value.toString() || '0',
      });
    }
  }

  render() {
    return (
      <React.Fragment>
        {this.props.hint
        && (
        <Text style={styles.component.textInputHintText}>
          {(this.state.value && this.state.value.length > 0) ? `${this.props.placeholder}${this.props.requiredMark ? ' * ' : ''}` : ' '}
        </Text>
        )
        }
        <View
          style={[
            styles.component.textInputContainer,
            this.props.editable ? { paddingLeft: 15 } : {},
            this.props.containerStyle,
          ]}
        >
          {this.props.editable
          && (
          <TouchableOpacity onPress={() => this.handleChangeValue(+this.state.value - 1)}>
            <Icon name="minus-circle" size={25} color={colors.button} />
          </TouchableOpacity>
          )
          }
          <RNTextInput
            underlineColorAndroid="transparent"
            placeholderTextColor={colors.placeholder}
            {...this.props}
            placeholder={`${this.props.placeholder}${this.props.requiredMark ? ' * ' : ''}`}
            editable={false}
            keyboardType="numeric"
            value={this.state.value}
            onChangeText={this.handleChangeValue.bind(this)}
            style={[
              styles.component.textInputText, this.props.textStyle,
              this.props.editable ? styles.component.integerInputText : {},
            ]}
            containerStyle={undefined}
          />
          {this.props.editable
          && (
          <TouchableOpacity onPress={() => this.handleChangeValue(+this.state.value + 1)}>
            <Icon name="plus-circle" size={25} color={colors.button} />
          </TouchableOpacity>
          )
          }
        </View>
      </React.Fragment>
    );
  }
}

TextInput.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
  hint: PropTypes.bool,
  editable: PropTypes.bool,
  textStyle: RNTextInput.propTypes.style,
  containerStyle: ViewPropTypes.style,
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
  containerStyle: {},
  onChangeValue: () => {},
};

export default TextInput;
