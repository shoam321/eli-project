import React, { Component } from 'react';
import {
  Linking, ScrollView, Switch, Text, TouchableOpacity, View,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getProject } from '../../actions/projects';
import { getDeviceName } from '../../actions/devices';
import {
  deviceType, getProjectStatus, cashierItemTypes, sellItemType,
} from '../../config/constants';
import styles, { colors } from '../../config/styles';
import Scene from '../../components/Scene';
import TextInput, { TextInputIcon } from '../../components/TextInput';
import TextInputMask from '../../components/TextInputMask';
import Header, { HeaderIcon } from '../components/Header';
import ImagesGallery from '../components/ImagesGallery';
import GesturePasswordView from '../../components/GesturePasswordView';
import I18n from '../../lang/i18n';
import Button from '../../components/Button';
import { getArrayItemByKey } from '../../actions/common';

class Device extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: false };

    this.inputs = {
      dev_imei: null,
    };
  }

  componentWillUnmount() {
    this.props.backHandler();
  }

  handleEditDevicePress() {
    Actions.deviceFormsScene({
      device: this.props.device,
      brand: { id: this.props.device.brand_id, name: this.props.device.brand_name },
      model: { id: this.props.device.model_id, name: this.props.device.model_name },
      client: {
        name: this.props.device.name,
        last_name: this.props.device.last_name,
      },
    });
  }

  getGalleryImages() {
    return this.props.device.images
      .map(image => ({ ...image, url: image.photo }));
  }

  handleProjectsHistoryItemPress(project) {
    this.setState({ loading: true });
    this.props.getProject(project.id)
      .then(({ project }) => Actions.projectScene({ project }))
      .finally(() => this.setState({ loading: false }));
  }

  sellItem() {
    Actions.cashierFormsScene({
      itemType: sellItemType.DEVICE,
      itemForSell: this.props.device,
      onActionsSuccess: () => {
        Actions.reset('menuScene');
        Actions.devicesScene();
      },
    });
  }

  static printInvoice(link) {
    Linking.canOpenURL(link).then((supported) => {
      if (supported) {
        Linking.openURL(link);
      }
    });
  }

  renderProjectHistoryItem(project) {
    const status = getProjectStatus(project.status);
    return (
      <TouchableOpacity
        key={project.id}
        onPress={() => this.handleProjectsHistoryItemPress(project)}
        style={styles.component.listItemButtonContainer}
      >
        <View>
          <Text style={[styles.component.listItemSubText, { color: status.color }]}>
            {I18n.t(status.name)}
          </Text>
          <Text style={styles.component.listItemMainText}>{project.created_at}</Text>
        </View>
        <Text style={styles.component.listItemText}>{project.price}</Text>
      </TouchableOpacity>
    );
  }

  render() {
    const images = this.getGalleryImages();
    return (
      <Scene loading={this.state.loading}>
        <Header
          text={getDeviceName(this.props.device)}
          left={HeaderIcon.BACK}
          right={HeaderIcon.EDIT}
          onLeftButtonPress={() => Actions.pop()}
          onRightButtonPress={this.handleEditDevicePress.bind(this)}
        />

        <ScrollView contentContainerStyle={{ paddingBottom: 25 }}>
          <View style={styles.scene.responsiveWrapper}>
            <View style={styles.scene.responsive}>
              <View style={styles.scene.listItemsContainer}>
                {this.props.device.used_in_project === 1
                && (
                <TouchableOpacity
                  onPress={() => Actions.projectScene({ project: this.props.device.project })}
                  style={[styles.component.listItemButtonContainer, { paddingHorizontal: 15, marginBottom: 15, paddingBottom: 5 }]}
                >
                  <View>
                    <Text style={styles.component.listItemSubText}>
                      {I18n.t('translation.usedInProject')}
                    </Text>
                    <Text style={styles.component.listItemMainText}>
                      {this.props.device.project.name}
                      {' '}
                      {this.props.device.project.last_name}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.component.listItemSubText}>{this.props.device.project.due_date}</Text>
                    <Text style={styles.component.listItemText}>
                      {this.props.device.project.brand_name}
                      {' '}
                      {this.props.device.project.model_name}
                    </Text>
                  </View>
                </TouchableOpacity>
                )
                }

                <TextInput
                  editable={false}
                  left={<TextInputIcon.Triangle />}
                  placeholder={I18n.t('translation.brand')} hint
                  value={this.props.device.brand_name}
                />
                <TextInput
                  editable={false}
                  left={<TextInputIcon.Triangle />}
                  placeholder={I18n.t('translation.model')} hint
                  value={this.props.device.model_name}
                />
                {this.props.device.status === deviceType.CLIENT
                && (
                <TextInput
                  editable={false}
                  placeholder={I18n.t('translation.owner')} hint
                  left={<TextInputIcon.Triangle />}
                  value={`${this.props.device.name} ${this.props.device.last_name}`}
                />
                )
                }
                {this.props.device.status !== deviceType.CLIENT
                && (
                <View style={[styles.component.listItemButtonContainer, { height: 40, paddingHorizontal: 15, alignItems: 'center' }]}>
                  <Text style={styles.component.listItemMainText}>{I18n.t('translation.canUsedTemporary')}</Text>
                  <Switch
                    style={styles.component.switchButton}
                    value={this.props.device.status === deviceType.TEMPORARY}
                    tintColor={colors.darkGray}
                    thumbTintColor={colors.white}
                    onTintColor={colors.button}
                    disabled
                  />
                </View>
                )
                }
                <TextInput
                  editable={false}
                  placeholder={I18n.t('translation.additionalInfo')} hint
                  value={this.props.device.device_name}
                />
                <TextInput
                  editable={false}
                  placeholder={I18n.t('translation.devicePassword')} hint
                  value={this.props.device.dev_pass}
                />
                <GesturePasswordView
                  value={this.props.device.scr_pass}
                  placeholder={I18n.t('translation.screenPassword')}
                />
                <TextInputMask
                  editable={false}
                  forwardedRef={ref => this.inputs.dev_imei = ref}
                  placeholder={I18n.t('translation.imei')} hint
                  value={this.props.device.dev_imei}
                  type="custom"
                  options={{
                    mask: '99999-99999-99999',
                  }}
                />
                <TextInput
                  editable={false}
                  placeholder={I18n.t('translation.serialNumber')} hint
                  value={this.props.device.serial_number}
                />
                {
                  this.props.device.status !== deviceType.CLIENT
                  && (
                  <TextInput
                    editable={false}
                    placeholder={I18n.t('translation.price')} hint
                    value={this.props.device.price.toString()}
                  />
                  )
                }
                {
                  !!this.props.device.warranty_expiration_date
                  && (
                  <React.Fragment>
                    <TextInput
                      editable={false}
                      placeholder={I18n.t('translation.warrantyExpirationDate')} hint
                      value={this.props.device.warranty_expiration_date.toString()}
                    />

                    <TextInput
                      editable={false}
                      placeholder={I18n.t('translation.actualSellPrice')} hint
                      value={this.props.device.actual_sell_price.toString()}
                    />

                    <TextInput
                      editable={false}
                      left={<TextInputIcon.Triangle />}
                      placeholder={I18n.t('translation.status')} hint
                      value={
                        I18n.t(getArrayItemByKey(
                          cashierItemTypes,
                          this.props.device.life_status,
                        ).name)
                      }
                    />
                  </React.Fragment>
                  )
                }
                <TextInput
                  editable={false} placeholder={I18n.t('translation.photos')} hint
                  value={images.length ? I18n.t('translation.amountPhotos', { length: images.length }) : ''}
                  right={<TextInputIcon.Camera />}
                />
                <ImagesGallery images={images} />

              </View>

              <Header text={I18n.t('translation.accountsList')} />

              <View style={styles.scene.listItemsContainer}>
                {this.props.device.ac_info.map(account => (
                  <View key={account.id} style={{ marginBottom: 15 }}>
                    <TextInput
                      editable={false}
                      placeholder={I18n.t('translation.email')} hint
                      value={account.ac_email}
                    />
                    <TextInput
                      editable={false}
                      placeholder={I18n.t('translation.password')} hint
                      value={account.ac_pass}
                    />
                  </View>
                ))}
              </View>

              <Header
                text={I18n.t('translation.projectsHistory')}
                right={(
                  <Button
                    text={I18n.t('translation.createProject')} disabled
                    style={styles.component.textInputButtonContainer}
                    textStyle={styles.component.textInputButtonText}
                  />
)}
                onRightButtonPress={() => Actions.projectFormsScene({
                  client: this.props.client, clientDevice: this.props.device,
                })}
              />
              <View style={styles.scene.listItemsContainer}>
                {this.props.device.history.map(this.renderProjectHistoryItem.bind(this))}
              </View>

              {this.props.device.status !== deviceType.CLIENT && !this.props.device.used_in_project
              && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                <Button
                  onPress={this.sellItem.bind(this)}
                  text={I18n.t('translation.sellToClient')} style={{ marginVertical: 30 }}
                />
              </View>
              )
              }

              {!!this.props.device.device_invoice_url && (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                  <Button
                    onPress={() => Device.printInvoice(this.props.device.device_invoice_url)}
                    text={I18n.t('translation.printInvoice')}
                    style={{ marginTop: 15 }}
                  />
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </Scene>
    );
  }

  static propTypes = {
    device: PropTypes.object.isRequired,
    client: PropTypes.object,
    getProject: PropTypes.func.isRequired,
    backHandler: PropTypes.func,
  };

  static defaultProps = {
    backHandler: () => {},
    client: {},
  };
}

export default connect(() => ({}), { getProject })(Device);
