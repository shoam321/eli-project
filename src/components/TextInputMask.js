import React, { Component } from 'react';
import {
  TextInput as RNTextInput, View, ViewPropTypes, Text, TouchableOpacity,
} from 'react-native';
import { TextInputMask as RNTextInputMask } from 'react-native-masked-text';
import PropTypes from 'prop-types';
import styles, { colors } from '../config/styles';

class TextInput extends Component {
  render() {
    return (
      <React.Fragment>
        {this.props.hint
        && (
        <Text style={styles.component.textInputHintText}>
          {(this.props.value && this.props.value.length > 0) ? `${this.props.placeholder}${this.props.requiredMark ? ' * ' : ''}` : ' '}
        </Text>
        )
        }
        <View style={[styles.component.textInputContainer, this.props.containerStyle]}>
          {this.props.left}
          <RNTextInputMask
            pointerEvents={!this.props.editable ? 'box-none' : undefined}
            underlineColorAndroid="transparent"
            placeholderTextColor={colors.placeholder}
            {...this.props} ref={this.props.forwardedRef}
            placeholder={`${this.props.placeholder}${this.props.requiredMark ? ' * ' : ''}`}
            style={[
              { height: this.props.multiline ? 98 : undefined },
              styles.component.textInputText, this.props.textStyle,
            ]}
            left={undefined} right={undefined} containerStyle={undefined}
          />
          {this.props.right
          && (
          <TouchableOpacity onPress={this.props.onRightButtonPress}>
            {this.props.right}
          </TouchableOpacity>
          )
          }
        </View>
      </React.Fragment>
    );
  }

  static propTypes = {
    editable: PropTypes.bool,
    hint: PropTypes.bool,
    left: PropTypes.node,
    right: PropTypes.node,
    textStyle: RNTextInput.propTypes.style,
    containerStyle: ViewPropTypes.style,
    onLeftButtonPress: PropTypes.func,
    onRightButtonPress: PropTypes.func,
    type: PropTypes.string.isRequired,
    options: PropTypes.object.isRequired,
    forwardedRef: PropTypes.any.isRequired,
    requiredMark: PropTypes.bool,
    ...RNTextInput.propTypes,
  };

  static defaultProps = {
    editable: true,
    hint: false,
    left: null,
    right: null,
    textStyle: {},
    requiredMark: false,
    containerStyle: {},
    onLeftButtonPress: undefined,
    onRightButtonPress: undefined,
  };
}

export default TextInput;
