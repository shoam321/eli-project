import React, { Component } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
  SafeAreaView,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Actions } from 'react-native-router-flux';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import I18n from '../../lang/i18n';
import styles, { colors } from '../../config/styles';
import Background from '../../content/images/background-shape.png';
import Logo from '../../content/images/logo.png';

export const menuConst = {
  CLIENTS: 0,
  PROJECTS: 1,
  SUPPLIERS: 2,
  PARTS: 3,
  ORDERS: 4,
  MY_DEVICES: 5,
  SETTINGS: 6,
};

class Menu extends Component {
  static menuItems = [
    {
      id: menuConst.PROJECTS,
      text: 'translation.projects',
      icon: <MaterialCommunityIcons name="briefcase" size={34} color={colors.button} />,
      action: () => Actions.projectsScene(),
    },
    {
      id: menuConst.CLIENTS,
      text: 'translation.clients',
      icon: <MaterialCommunityIcons name="account" size={34} color={colors.button} />,
      action: () => Actions.clientsScene(),
    },
    {
      id: menuConst.SUPPLIERS,
      text: 'translation.suppliers',
      icon: <MaterialIcons name="supervisor-account" size={34} color={colors.button} />,
      action: () => Actions.suppliersScene(),
    },
    {
      id: menuConst.PARTS,
      text: 'translation.parts',
      icon: <FeatherIcon name="cpu" size={34} color={colors.button} />,
      action: () => Actions.partsScene(),
    },
    {
      id: menuConst.ORDERS,
      text: 'translation.orders',
      icon: <MaterialCommunityIcons name="file-outline" size={34} color={colors.button} />,
      action: () => Actions.ordersScene(),
    },
    {
      id: menuConst.MY_DEVICES,
      text: 'translation.myDevices',
      icon: <MaterialCommunityIcons name="cellphone-iphone" size={34} color={colors.button} />,
      action: () => Actions.devicesScene(),
    },
    {
      id: menuConst.SETTINGS,
      text: 'translation.settings',
      icon: <MaterialCommunityIcons name="settings" size={34} color={colors.button} />,
      action: () => Actions.settingsScene(),
    },
  ];

  handleMenuItemPress(menuItem) {
    if (menuItem.id === this.props.active) {
      this.props.onRequestClose();
    } else if (menuItem.action) {
      menuItem.action();
    }
  }

  renderMenuItem(menuItem) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        key={menuItem.id} style={styles.component.menuItemContainer}
        onPress={this.handleMenuItemPress.bind(this, menuItem)}
      >
        {
          menuItem.icon
        }
        <Text style={styles.component.menuItemContainerText}>
          { I18n.t(menuItem.text) }
        </Text>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <Modal
        transparent
        animationType="fade"
        visible={this.props.visible}
        onRequestClose={this.props.onRequestClose}
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: styles.colors.blackBackground }}
        >
          <View style={styles.component.menuContainer}>
            <View style={styles.component.menuHeader}>
              <TouchableOpacity
                onPress={this.props.onRequestClose}
                style={styles.component.headerLeftButton}
              >
                <FeatherIcon name="menu" size={34} color={colors.button} />
              </TouchableOpacity>

              <View>
                <Text style={styles.component.headerTextMenu}>{I18n.t('translation.menu')}</Text>
                <Text style={styles.component.subHeaderTextMenu}>
                  { this.props.user.name }
                  {' '}
                  { this.props.user.last_name }
                </Text>
              </View>

              <TouchableOpacity
                onPress={this.props.onRequestClose}
                style={styles.component.headerRightButton}
              >
                <FeatherIcon name="x" size={34} color={colors.button} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.component.menuMainContainer}
            >
              <View style={styles.component.menuContainerBackground}>
                <ImageBackground
                  style={styles.component.menuContainerBackgroundImage}
                  opacity={0.3} source={Background}
                />
              </View>

              <Image
                style={styles.component.menuLogoImage}
                source={Logo} resizeMode="contain"
              />

              <View style={styles.component.menuItemContainerWrapper}>
                { Menu.menuItems.map(item => this.renderMenuItem(item)) }
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  static propTypes = {
    user: PropTypes.object.isRequired,
    active: PropTypes.number,
    visible: PropTypes.bool.isRequired,
    onRequestClose: PropTypes.func.isRequired,
  };

  static defaultProps = {
    active: -1,
  };
}

export default connect(({ user }) => ({
  user: user.profile,
}), {})(Menu);
