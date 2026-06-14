import React, { Component } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { deviceSearch, getMyDevices } from '../../actions/devices';
import {
  deviceType, getDeviceStatus, deviceUsingItems, deviceDeletingItems, deviceTemporaryDeviceItems,
} from '../../config/constants';
import styles, { colors } from '../../config/styles';
import Scene from '../../components/Scene';
import TextInput, { TextInputIcon } from '../../components/TextInput';
import Header, { HeaderIcon } from '../components/Header';
import ImagesGallery from '../components/ImagesGallery';
import Button from '../../components/Button';
import I18n from '../../lang/i18n';
import Filter from '../components/Filter';

class DevicesScene extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: false,
      loading: false,
      search: '',
      expanded: -1,
      params: {
        deleted: 3,
        used: 1,
        temporary: 1,
      },
    };
  }

  componentWillMount() {
    this.setState({ loading: true });
    this.props.getMyDevices()
      .finally(() => this.setState({ loading: false }));
  }

  handleExpanderPress(device) {
    this.setState({ expanded: this.state.expanded === device.id ? -1 : device.id });
  }

  handleFilterSubmit(key, value, check) {
    this.setState({
      params: {
        ...this.state.params,
        [key]: (this.state.params[key] === value && check) ? 0 : value,
      },
    });
  }

  renderDevicesListItem(device) {
    const images = device.images.map(image => ({ ...image, url: image.photo }));
    const status = getDeviceStatus(device.status, device.used_in_project);

    return (
      <React.Fragment key={device.id}>
        <TouchableOpacity
          onPress={() => Actions.deviceScene({ device })}
          style={styles.component.listItemButtonContainer}
        >
          <View style={{ alignItems: 'flex-start' }}>
            <Text style={[styles.component.listItemSubText, { color: status.color }]}>
              {I18n.t(status.name)}
            </Text>
            <View style={styles.component.dropDownTextContainer}>
              {this.state.expanded !== device.id
                ? <TextInputIcon.Triangle style={{ marginBottom: -1 }} size={19} color={colors.button} />
                : <TextInputIcon.Expanded style={{ marginBottom: -1 }} size={19} color={colors.button} />
              }
              <Text style={styles.component.listItemMainText}>{device.model_name}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Button
              text={I18n.t('translation.amountPhotos', { length: images.length })}
              onPress={this.handleExpanderPress.bind(this, device)}
              style={[styles.component.textInputButtonContainer, { alignSelf: 'flex-end' }]}
              textStyle={styles.component.textInputButtonText}
            />
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.component.listItemSubText}>{device.brand_name}</Text>
              <Text style={styles.component.listItemText}>{`${device.price}`}</Text>
            </View>
          </View>
        </TouchableOpacity>
        {this.state.expanded === device.id && <ImagesGallery images={images} />}
      </React.Fragment>
    );
  }

  render() {
    return (
      <Scene>
        <Header
          text={I18n.t('translation.myDevices')}
          left={HeaderIcon.MENU}
          right={HeaderIcon.ADD}
          onLeftButtonPress={() => Actions.menuScene()}
          onRightButtonPress={() => Actions.deviceFormsScene({ status: deviceType.OWN })}
        />

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            <TextInput
              placeholder={I18n.t('translation.brandModel')}
              onChangeText={search => this.setState({ search })}
              left={<TextInputIcon.Search />}
              right={<TextInputIcon.Filter color={colors.button} />}
              onRightButtonPress={() => this.setState({ filter: true })}
              containerStyle={styles.scene.searchInputContainer}
            />
          </View>
        </View>

        <Filter
          title={I18n.t('translation.deviceFilter')}
          key="filter"
          visible={this.state.filter}
          onResetFilter={() => this.setState({ params: { deleted: 3, used: 1, temporary: 1 } })}
          onRequestClose={() => this.setState({ filter: false })}
        >
          <View style={styles.component.filterRow}>
            {deviceDeletingItems.map(filterItem => (
              <TouchableOpacity
                key={filterItem.id}
                onPress={() => this.handleFilterSubmit('deleted', filterItem.id, true)}
              >
                <TextInput
                  editable={false} value={I18n.t(filterItem.name)}
                  textStyle={{ flex: undefined, paddingHorizontal: 10 }}
                  containerStyle={{
                    borderBottomWidth: 2,
                    borderColor: this.state.params.deleted === filterItem.id
                      ? colors.button : colors.lightGray,
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.component.filterRow}>
            {deviceTemporaryDeviceItems.map(filterItem => (
              <TouchableOpacity
                key={filterItem.id}
                onPress={() => this.handleFilterSubmit('temporary', filterItem.id, true)}
              >
                <TextInput
                  editable={false} value={I18n.t(filterItem.name)}
                  textStyle={{ flex: undefined, paddingHorizontal: 10 }}
                  containerStyle={{
                    borderBottomWidth: 2,
                    borderColor: this.state.params.temporary === filterItem.id
                      ? colors.button : colors.lightGray,
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.component.filterRow}>
            {deviceUsingItems.map(filterItem => (
              <TouchableOpacity
                key={filterItem.id}
                onPress={() => this.handleFilterSubmit('used', filterItem.id, true)}
              >
                <TextInput
                  editable={false} value={I18n.t(filterItem.name)}
                  textStyle={{ flex: undefined, paddingHorizontal: 10 }}
                  containerStyle={{
                    borderBottomWidth: 2,
                    borderColor: this.state.params.used === filterItem.id
                      ? colors.button : colors.lightGray,
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Filter>

        <ScrollView
          contentContainerStyle={styles.scene.listItemsContainer}
          refreshControl={(
            <RefreshControl
              refreshing={this.state.loading}
              onRefresh={this.componentWillMount.bind(this)}
            />
)}
        >
          <View style={styles.scene.responsiveWrapper}>
            <View style={styles.scene.responsive}>
              {this.props.devices
                .filter(item => deviceSearch(item, this.state.search))
                .filter((item) => {
                  let pass = true;

                  if (this.state.params.deleted === 2 && item.status !== 4) {
                    pass = false;
                  } else if (this.state.params.deleted === 3 && item.status === 4) {
                    pass = false;
                  }

                  return pass;
                })
                .filter((item) => {
                  let pass = true;

                  if (this.state.params.used === 2 && item.used_in_project !== 1) {
                    pass = false;
                  } else if (this.state.params.used === 3 && item.used_in_project === 1) {
                    pass = false;
                  }

                  return pass;
                })
                .filter((item) => {
                  let pass = true;

                  if (this.state.params.temporary === 2 && item.status !== 2) {
                    pass = false;
                  } else if (this.state.params.temporary === 3 && item.status === 2) {
                    pass = false;
                  }

                  return pass;
                })
                .map(device => this.renderDevicesListItem(device))
              }
            </View>
          </View>
        </ScrollView>
      </Scene>
    );
  }

  static propTypes = {
    devices: PropTypes.array.isRequired,
    getMyDevices: PropTypes.func.isRequired,
  };
}

export default connect(({ main }) => ({
  devices: main.devices,
}), { getMyDevices })(DevicesScene);
