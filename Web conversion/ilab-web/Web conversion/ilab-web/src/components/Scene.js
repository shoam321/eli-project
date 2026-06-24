import React from 'react';
import {
  ImageBackground, View, ViewPropTypes, KeyboardAvoidingView, Platform,
} from 'react-native';
// import RadialGradient from "react-native-radial-gradient";
import PropTypes from 'prop-types';

import Background from '../content/images/background.png';
// for gradient add "colors"
import styles from '../config/styles';
import Preloader from './Preloader';

const Scene = props => (
  <KeyboardAvoidingView
    {...props} style={[styles.common.sceneContainer, props.style]}
    behavior="padding" enabled={Platform.OS === 'ios'}
  >
    <View style={styles.common.backgroundBottomContainerGray}>
      <ImageBackground
        style={styles.common.backgroundBottomImage}
        opacity={0.15} source={Background}
      />
    </View>
    {/* <RadialGradient */}
    {/*  style={styles.common.radialGradient} */}
    {/*  colors={[colors.white, colors.grayBackground]} */}
    {/* /> */}
    {props.loading !== undefined && <Preloader visible={props.loading} />}
    {props.children}
  </KeyboardAvoidingView>
);

Scene.propTypes = {
  ...ViewPropTypes,
  loading: PropTypes.bool,
};

Scene.defaultProps = {
  loading: undefined,
};

export default Scene;
