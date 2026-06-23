import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AwesomeIcon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';

import styles, { colors } from '../../config/styles';

const IconContainer = ({ children }) => (
  <View style={styles.component.headerCircleButton}>{children}</View>
);

IconContainer.propTypes = { children: PropTypes.node.isRequired };

export const HeaderIcon = {
  MENU: <FeatherIcon name="menu" size={34} color={colors.button} />,
  BACK: <FeatherIcon name="arrow-left" size={33} color={colors.button} />,
  ADD: <IconContainer><FeatherIcon name="plus" size={27} color={colors.button} /></IconContainer>,
  EDIT: <IconContainer><MaterialIcon name="edit" size={20} color={colors.button} /></IconContainer>,
  CLOSE: <IconContainer><MaterialIcon name="close" size={26} color={colors.button} /></IconContainer>,
  LOGOUT: <IconContainer><AwesomeIcon name="sign-out" size={20} color={colors.button} /></IconContainer>,
  IMPORT: <IconContainer><AwesomeIcon name="mobile" size={29} color={colors.button} /></IconContainer>,
  CART: <MaterialIcon name="shopping-cart" size={34} color={colors.button} />,
  CART_ADD: <MaterialIcon name="add-shopping-cart" size={34} color={colors.button} />,
  HISTORY: <MaterialIcon name="history" size={34} color={colors.button} />,
};

const Header = ({
  text, style, left, right, additionRight, onLeftButtonPress, onRightButtonPress, onAdditionRightButtonPress,
}) => (
  <View style={[styles.component.headerContainer, style]}>
    {left
    && (
    <TouchableOpacity
      onPress={onLeftButtonPress}
      disabled={!onLeftButtonPress}
      style={styles.component.headerLeftButton}
    >
      {left}
    </TouchableOpacity>
    )
    }

    <Text style={styles.component.headerText}>{text}</Text>

    {additionRight
    && (
    <TouchableOpacity
      onPress={onAdditionRightButtonPress}
      disabled={!onAdditionRightButtonPress}
      style={styles.component.headerAdditionRightButton}
    >
      {additionRight}
    </TouchableOpacity>
    )
    }

    {right
    && (
    <TouchableOpacity
      onPress={onRightButtonPress}
      disabled={!onRightButtonPress}
      style={styles.component.headerRightButton}
    >
      {right}
    </TouchableOpacity>
    )
    }

  </View>
);

Header.propTypes = {
  text: PropTypes.string,
  left: PropTypes.node,
  right: PropTypes.node,
  additionRight: PropTypes.node,
  onLeftButtonPress: PropTypes.func,
  onRightButtonPress: PropTypes.func,
  style: PropTypes.object,
  onAdditionRightButtonPress: PropTypes.func,
};

Header.defaultProps = {
  text: '',
  left: null,
  right: null,
  style: {},
  additionRight: null,
  onLeftButtonPress: undefined,
  onRightButtonPress: undefined,
  onAdditionRightButtonPress: undefined,
};

export default Header;
