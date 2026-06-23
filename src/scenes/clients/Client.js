import React, { Component } from 'react';
import {
  Linking, RefreshControl, Text, ScrollView, TouchableOpacity, View,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getClientDevices } from '../../actions/devices';
import { getUserParts } from '../../actions/parts';
import styles from '../../config/styles';
import Scene from '../../components/Scene';
import TextInput, { TextInputIcon } from '../../components/TextInput';
import Button from '../../components/Button';
import Header, { HeaderIcon } from '../components/Header';
import { deviceType, cashierItemTypes } from '../../config/constants';
import I18n from '../../lang/i18n';

class Client extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      devices: [],
      parts: [],
      partExpanded: 0,
    };
  }

  componentWillMount() {
    this.setState({ loading: true });

    Promise.all([
      this.props.getClientDevices(this.props.client.id),
      this.props.getUserParts({ user_id: this.props.client.id }),
    ]).then(([device, part]) => this.setState({
      devices: device.devices,
      parts: part.parts,
      loading: false,
    }))
      .catch(() => this.setState({ loading: false }));
  }

  static printInvoice(link) {
    Linking.canOpenURL(link).then((supported) => {
      if (supported) {
        Linking.openURL(link);
      }
    });
  }

  handlePartPress(part) {
    this.setState({ partExpanded: this.state.partExpanded === part.id ? 0 : part.id });
  }

  handleAddDeviceButtonPress() {
    Actions.deviceFormsScene({
      client: this.props.client,
      status: deviceType.CLIENT,
      onActionsSuccess: () => {
        Actions.pop();
        this.componentWillMount();
      },
    });
  }

  renderClientDevice(device) {
    return (
      <TouchableOpacity
        key={device.id}
        onPress={() => Actions.deviceScene({
          device, client: this.props.client, backHandler: () => this.componentWillMount(),
        })}
      >
        <TextInput
          editable={false}
          value={`${device.brand_name} ${device.model_name}`}
          placeholder={I18n.t('translation.brandAndModel')} hint
          right={(
            <Button
              text={I18n.t('translation.createProject')} disabled
              style={styles.component.textInputButtonContainer}
              textStyle={styles.component.textInputButtonText}
            />
)}
          onRightButtonPress={() => Actions.projectFormsScene({
            client: this.props.client, clientDevice: device,
          })}
        />
      </TouchableOpacity>
    );
  }

  renderClientPart(part) {
    return (
      <React.Fragment key={part.id}>
        <TouchableOpacity
          onPress={this.handlePartPress.bind(this, part)}
          style={styles.component.listItemButtonContainer}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.component.listItemSubText}>
              {I18n.t('translation.amountNumber', {
                number: part.amount,
              })}
            </Text>
            <Text style={styles.component.listItemMainText}>
              {part.part.pr_name}
              {' '}
              {part.part.color}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', marginLeft: 10 }}>
            <Text style={styles.component.listItemSubText}>{part.part.brand_part.name}</Text>
            <Text style={styles.component.listItemMainText}>{part.part.model_part.m_name}</Text>
          </View>
        </TouchableOpacity>

        {this.state.partExpanded === part.id
        && (
        <View style={{ padding: 10 }}>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.warrantyExpirationDate')}</Text>
            <Text style={styles.component.listItemDarkSubText}>{part.warranty_expiration_date}</Text>
          </View>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.serial')}</Text>
            <Text style={styles.component.listItemDarkSubText}>{part.part.serial}</Text>
          </View>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.amount')}</Text>
            <Text style={styles.component.listItemDarkSubText}>{part.amount}</Text>
          </View>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.actualSellPrice')}</Text>
            <Text style={styles.component.listItemDarkSubText}>{part.actual_sell_price}</Text>
          </View>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.status')}</Text>
            <Text style={styles.component.listItemDarkSubText}>
              {I18n.t(cashierItemTypes.find(item => item.id === part.life_status).name)}
            </Text>
          </View>
          {!!part.part_invoice_url && (
          <Button
            onPress={() => Client.printInvoice(part.part_invoice_url)}
            text={I18n.t('translation.printInvoice')}
            style={{ marginTop: 15 }}
          />
          )}
        </View>
        )
        }
      </React.Fragment>
    );
  }

  render() {
    return (
      <Scene>
        <Header
          text={`${this.props.client.name} ${this.props.client.last_name}`}
          left={HeaderIcon.BACK}
          right={HeaderIcon.EDIT}
          onLeftButtonPress={() => Actions.pop()}
          onRightButtonPress={() => Actions.clientFormsScene({ client: this.props.client, delete: true })}
        />

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            <View style={styles.scene.listItemsContainer}>
              <TextInput
                editable={false}
                placeholder={I18n.t('translation.firstName')} hint
                value={this.props.client.name}
              />
              <TextInput
                editable={false}
                placeholder={I18n.t('translation.lastName')} hint
                value={this.props.client.last_name}
              />
              <TextInput
                editable={false}
                placeholder={I18n.t('translation.email')} hint
                value={this.props.client.email}
                right={<TextInputIcon.Mail />}
                onRightButtonPress={() => Linking.openURL(`mailto:${this.props.client.email}`)}
              />
              <TextInput
                editable={false}
                placeholder={I18n.t('translation.phoneNumber')} hint
                value={this.props.client.phone}
                right={<TextInputIcon.Phone />}
                onRightButtonPress={() => Linking.openURL(`tel:${this.props.client.phone}`)}
              />
              {this.props.client.secondary_phone !== '' && this.props.client.secondary_phone
                && (
                <TextInput
                  editable={false}
                  placeholder={I18n.t('translation.secondaryPhone')} hint
                  value={this.props.client.secondary_phone}
                  right={<TextInputIcon.Phone />}
                  onRightButtonPress={() => Linking.openURL(`tel:${this.props.client.secondary_phone}`)}
                />
                )
              }
            </View>
          </View>
        </View>

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            <Header
              text={I18n.t('translation.devices')}
              left={HeaderIcon.ADD}
              onLeftButtonPress={this.handleAddDeviceButtonPress.bind(this)}
            />
          </View>
        </View>

        <View
          style={{
            flex: 1,
          }}
        >
          <ScrollView
            contentContainerStyle={[styles.scene.listItemsContainer]}
            refreshControl={(
              <RefreshControl
                refreshing={this.state.loading}
                onRefresh={this.componentWillMount.bind(this)}
              />
)}
          >
            <View style={styles.scene.responsiveWrapper}>
              <View style={styles.scene.responsive}>
                {this.state.devices.map(device => (
                  this.renderClientDevice(device)
                ))}
              </View>
            </View>
          </ScrollView>
        </View>

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            <Header
              text={I18n.t('translation.parts')}
              style={{ padding: 0, paddingTop: 15, minHeight: 20 }}
            />
          </View>
        </View>

        <View
          style={{
            flex: 1,
          }}
        >
          <ScrollView
            contentContainerStyle={[styles.scene.listItemsContainer]}
            refreshControl={(
              <RefreshControl
                refreshing={this.state.loading}
                onRefresh={this.componentWillMount.bind(this)}
              />
)}
          >
            <View style={styles.scene.responsiveWrapper}>
              <View style={styles.scene.responsive}>
                {this.state.parts.map(part => (
                  this.renderClientPart(part)
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Scene>
    );
  }

  static propTypes = {
    client: PropTypes.object,
    getClientDevices: PropTypes.func.isRequired,
    getUserParts: PropTypes.func.isRequired,
  };

  static defaultProps = {
    client: {},
  };
}

export default connect(() => ({}), {
  getClientDevices,
  getUserParts,
})(Client);
