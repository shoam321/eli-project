import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
  SafeAreaView,
  Alert
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
import { projectStatus, orderStatus } from '../../config/constants';

export const menuConst = {
  CLIENTS: 0,
  PROJECTS: 1,
  SUPPLIERS: 2,
  PARTS: 3,
  ORDERS: 4,
  MY_DEVICES: 5,
  SETTINGS: 6,
  DRAFT_PROJECTS: 7,
  CASHIER: 8,
};

class Menu extends Component {
  constructor(props) {
    super(props);



    this.state = {
      menuItems: [
        {
          id: menuConst.PROJECTS,
          text: 'translation.projects',
          icon: <MaterialCommunityIcons name="briefcase" size={34} color={colors.button} />,
          counter: props.projects.length,
          action: () => Actions.projectsScene(),
        },
        {
          id: menuConst.DRAFT_PROJECTS,
          text: 'translation.draftProjects',
          icon: <MaterialCommunityIcons name="briefcase" size={34} color={colors.button} />,
          counter: props.draftProjects.length,
          action: () => Actions.draftProjectsScene(),
        },
        {
          id: menuConst.CLIENTS,
          text: 'translation.clients',
          icon: <MaterialCommunityIcons name="account" size={34} color={colors.button} />,
          counter: 0,
          action: () => Actions.clientsScene(),
        },
        {
          id: menuConst.SUPPLIERS,
          text: 'translation.suppliers',
          icon: <MaterialIcons name="supervisor-account" size={34} color={colors.button} />,
          counter: 0,
          action: () => Actions.suppliersScene(),
        },
        {
          id: menuConst.PARTS,
          text: 'translation.parts',
          icon: <FeatherIcon name="cpu" size={34} color={colors.button} />,
          counter: 0,
          action: () => Actions.partsScene(),
        },
        {
          id: menuConst.ORDERS,
          text: 'translation.orders',
          icon: <MaterialCommunityIcons name="file-outline" size={34} color={colors.button} />,
          counter: props.orders.length,
          action: () => Actions.ordersScene(),
        },
        {
          id: menuConst.MY_DEVICES,
          text: 'translation.myDevices',
          icon: <MaterialCommunityIcons name="cellphone-iphone" size={34} color={colors.button} />,
          counter: 0,
          action: () => Actions.devicesScene(),
        },
        {
          id: menuConst.CASHIER,
          text: 'translation.cashier',
          icon: <MaterialCommunityIcons name="cash-usd" size={34} color={colors.button} />,
          counter: 0,
          action: () => Actions.cashiersScene(),
        },
        {
          id: menuConst.SETTINGS,
          text: 'translation.settings',
          icon: <MaterialCommunityIcons name="settings" size={34} color={colors.button} />,
          counter: 0,
          action: () => Actions.settingsScene(),
        },
      ],
    };
  }

  static handleMenuItemPress(menuItem) {
    if (menuItem.action) {
      menuItem.action();
    }
  }



  renderMenuItem(menuItem) {
    return (
      <View
        style={{
          width: '47%',
          position: 'relative',
        }}
        key={menuItem.id}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.component.menuItemContainer}
          onPress={Menu.handleMenuItemPress.bind(this, menuItem)}
        >
          {
            menuItem.icon
          }
          <Text style={styles.component.menuItemContainerText}>
            { I18n.t(menuItem.text) }
          </Text>
        </TouchableOpacity>

        {menuItem.counter !== 0 && (
          <View
            style={styles.component.menuBadge}
          >
            <Text
              style={styles.component.menuBadgeText}
            >
              {menuItem.counter}
            </Text>
          </View>
        )}
      </View>
    );
  }

  render() {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: styles.colors.blackBackground }}
      >
        <View style={styles.component.menuContainer}>
          <View style={styles.component.menuHeader}>
            <View>
              <Text style={styles.component.headerTextMenu}>{I18n.t('translation.menu')}</Text>
              <Text style={styles.component.subHeaderTextMenu}>
                { this.props.user.name }
                {' '}
                { this.props.user.last_name }
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => Actions.cartScene()}
              style={styles.component.headerRightButton}
            >
              <MaterialIcons name="shopping-cart" size={34} color={colors.button} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.component.menuMainContainer}
          >
            <View style={styles.scene.responsiveWrapper}>
              <View style={styles.scene.responsive}>
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
                  { this.state.menuItems.map(item => this.renderMenuItem(item)) }
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  static propTypes = {
    user: PropTypes.object.isRequired,
    projects: PropTypes.array.isRequired,
    draftProjects: PropTypes.array.isRequired,
    orders: PropTypes.array.isRequired,
  };

  static defaultProps = {};
}

export default connect(({ user, main }) => ({
  user: user.profile,
  projects: main.projects.filter(item => item.status === projectStatus.OPEN),
  draftProjects: main.draftProjects,
  orders: main.orders.filter(item => item.status === orderStatus.EXPECTED),
}), {})(Menu);
