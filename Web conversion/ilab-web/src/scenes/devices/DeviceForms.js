/* eslint-disable import/extensions */
import React, { Component } from 'react';
import {
  ScrollView, TouchableOpacity, View, Keyboard, BackHandler, Modal, Text, Switch,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import ImageResizer from 'react-native-image-resizer';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import GesturePassword from '../../components/GesturePassword';

import { readFile, handleBackButtonPress } from '../../actions/common';
import { brandSearch, postBrand } from '../../actions/brands';
import { clientSearch, getClientName } from '../../actions/clients';
import {
  postDevice, updateDevice, buyDevice, deleteDevice,
  postDeviceImage, removeDeviceImage,
} from '../../actions/devices';
import { deviceType } from '../../config/constants';
import styles, { colors } from '../../config/styles';
import Scene from '../../components/Scene';
import TextInput, { TextInputIcon } from '../../components/TextInput';
import TextInputMask from '../../components/TextInputMask';
import Header, { HeaderIcon } from '../components/Header';
import { Alert } from '../../components/Notification';
import Button from '../../components/Button';
import AutocompleteInput from '../components/AutocompleteInput';
import ConfirmationDialog from '../components/ConfirmationDialog';
import ImagesGallery from '../components/ImagesGallery';
import Validator, { formsValidation } from '../../actions/validators';
import ModalInput from '../components/ModalInput';
import GesturePasswordView from '../../components/GesturePasswordView';
import { modelSearch, getBrandModels } from '../../actions/models';
import I18n from '../../lang/i18n';

class DeviceForms extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      buyConfirmation: false,
      deleteConfirmation: false,
      addBrandDialog: false,
      priceDialog: false,
      screenDeviceModal: false,
      client: props.client,
      brand: props.brand,
      model: props.model,
      models: [],
      photos: [],
      removeImages: [],
      device: {
        user_id: props.client.id,
        brand_id: props.brand.id,
        model_id: props.model.id,
        status: props.status,
        images: [],

        device_name: '',
        dev_pass: '',
        scr_pass: '',
        dev_imei: '',
        serial_number: '',
        price: '',
        used_in_project: 0,

        ac_info: [],

        ...props.device,
      },
    };
    this.inputs = {
      device_name: React.createRef(),
      dev_pass: React.createRef(),
      scr_pass: React.createRef(),
      dev_imei: null,
      price: React.createRef(),
      accountsEmail: [],
      accountsPass: [],
    };
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonPress);

    if (this.state.brand.id) {
      this.loadBrandModels(this.state.brand.id);
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', handleBackButtonPress);
  }

  loadBrandModels(brandId) {
    return this.props.getBrandModels(brandId)
      .then(data => this.setState({ models: data.models }));
  }

  handleModelSelect(model) {
    this.handleAutocompleteItemSelect('model', 'model_id', model);
  }

  getGalleryImages() {
    const images = [...this.state.photos, ...this.state.device.images];
    return images.reduce((previous, current) => {
      if (current.id && this.state.removeImages.findIndex(i => i.id === current.id) > -1) return previous;
      else return [...previous, { ...current, url: (current.photo || current.uri) }];
    }, []);
  }

  confirmPriceInputModal(value) {
    this.handleTextInput('price', value);

    this.setState({
      buyConfirmation: true,
      priceDialog: false,
    });
  }

  handleTextInput(key, value) {
    this.setState({ device: { ...this.state.device, [key]: value } });
  }

  handleAddBrandAction(name) {
    const timer = setTimeout(() => {
      this.setState({ loading: true });

      this.props.postBrand(name)
        .then(result => this.handleBrandSelect({ name, id: result.brand.id }))
        .finally(() => {
          this.setState({ loading: false });

          clearTimeout(timer);
        });
    }, 300);
  }

  async handleBrandSelect(brand) {
    if (!brand.id) return this.handleAddBrandAction(brand);
    await this.handleAutocompleteItemSelect('brand', 'brand_id', brand);
    this.handleModelSelect({});

    if (brand.id) {
      this.loadBrandModels(brand.id);
    }
  }

  handleAccountTextInput(id, key, value) {
    const accounts = [...this.state.device.ac_info];
    accounts[id][key] = value;
    this.setState({
      device: {
        ...this.state.device,
        ac_info: accounts,
      },
    });
  }

  handleAddAccountButtonPress() {
    this.state.device.ac_info.push({ id: Date.now() });
    this.setState({ device: this.state.device });
  }

  handleAutocompleteItemSelect(key, keyId, item) {
    return new Promise((resolve) => {
      const state = {
        [key]: item,
        device: {
          ...this.state.device,
          [keyId]: item.id,
        },
      };

      this.setState(state, () => { resolve(); });
    });
  }

  handleImagePickerPress() {
    Keyboard.dismiss();
    Actions.imagesPickerScene({
      active: this.state.photos,
      onActionSuccess: photos => this.setState({ photos }),
    });
  }

  uploadDeviceImages(deviceId) {
    return Promise.all(
      this.state.photos.map(image => ImageResizer.createResizedImage(image.uri, 1000, 1000, 'JPEG', 100)
        .then(image => readFile(image.uri))
        .then(image => this.props.postDeviceImage(deviceId, image))),
    );
  }

  handleBuyButtonPress() {
    const errors = Validator.getFormErrors({
      ...this.state.device,
      dev_imei: this.inputs.dev_imei.getRawValue(),
    }, formsValidation.DEVICE);

    if (errors.length > 0) return Alert.showMessage(I18n.t('translation.error'), errors.join('\n'));

    this.setState({ loading: true });

    this.props.buyDevice(this.props.device.id)
      .catch(() => this.setState({ loading: false }));

    this.handleSaveButtonPress();
  }

  handleDeleteImagePress(image) {
    if (image.id) {
      const images = [...this.state.device.images];
      const index = images.findIndex(i => i.id === image.id);
      if (index >= 0) {
        this.state.removeImages.push(image);
        this.setState({ removeImages: this.state.removeImages });
      }
    } else if (image.uri) {
      const images = [...this.state.photos];
      const index = images.findIndex(i => i.uri === image.uri);
      if (index >= 0) {
        images.splice(index, 1);
        this.setState({ photos: images });
      }
    }
  }

  removeDeviceImages() {
    return Promise.all(
      this.state.removeImages.map(image => this.props.removeDeviceImage(image.id)),
    );
  }

  handleRemoveAccountPress(index) {
    this.state.device.ac_info.splice(index, 1);
    this.setState({ device: this.state.device });
  }

  handleDeletePress() {
    this.setState({ loading: true }, () => {
      this.props.deleteDevice(this.state.device)
        .then(() => {
          this.setState({ loading: false }, () => {
            Actions.popTo('devicesScene');
          });
        })
        .catch(() => {
          this.setState({ loading: false });
        });
    });
  }

  handleSaveButtonPress() {
    const errors = Validator.getFormErrors({
      ...this.state.device,
      dev_imei: this.inputs.dev_imei.getRawValue(),
    }, formsValidation.DEVICE);

    if (this.inputs.dev_imei.getRawValue() === '' && this.state.device.serial_number === '') {
      errors.push(I18n.t('translation.fillImeiOrSerialNumber'));
    }

    this.state.device.ac_info.forEach((ac_info) => {
      const accountErrors = Validator.getFormErrors(ac_info, formsValidation.ACCOUNT);

      if (accountErrors.length > 0) {
        errors.push(...accountErrors);
      }
    });

    if (errors.length > 0) return Alert.showMessage(I18n.t('translation.error'), errors.join('\n'));

    this.setState({ loading: true });

    const request = this.state.device.id
      ? this.props.updateDevice
      : this.props.postDevice;

    const preparedDevise = {
      ...this.state.device,
      dev_imei: this.inputs.dev_imei.getRawValue(),
      price: this.state.device.price !== '' ? this.state.device.price : '0',
    };

    request(preparedDevise, false)
      .then(response => this.removeDeviceImages()
        .then(() => this.uploadDeviceImages(response.device.id))
        .finally(() => this.props.updateDevice(response.device))
        .then(({ device }) => {
          this.setState({ loading: false }, () => {
            if (!this.props.problem) {
              this.props.onActionsSuccess(response.device, this.state.client);
            } else {
              this.props.onActionsSuccess({
                id: this.props.draftProjectId,
                user: this.props.client,
                device: response.device,
                problem: this.props.problem,
              });
            }
          });
        }))
      .catch(() => {
        const error = () => Alert.showMessage(I18n.t('translation.error'), I18n.t('translation.checkFormData'));
        this.setState({ loading: false }, error);
      });
  }

  render() {
    console.log(this.props);
    const images = this.getGalleryImages();
    return (
      <Scene loading={this.state.loading}>
        <Header
          text={this.state.device.id ? I18n.t('translation.editDevice') : I18n.t('translation.addDevice')}
          left={HeaderIcon.BACK}
          onLeftButtonPress={() => Actions.pop()}
          onRightButtonPress={() => Actions.deviceFormsScene({ status: 2 })}
        />

        <ConfirmationDialog
          text={I18n.t('translation.areYouSureYouWantToBuyThisDevice')}
          visible={this.state.buyConfirmation}
          onRequestClose={() => this.setState({ buyConfirmation: false })}
          onAccessButtonPress={this.handleBuyButtonPress.bind(this)}
        />

        <ConfirmationDialog
          text={I18n.t('translation.doYouWantDeleteDevice')}
          visible={this.state.deleteConfirmation}
          onRequestClose={() => this.setState({ deleteConfirmation: false })}
          onAccessButtonPress={this.handleDeletePress.bind(this)}
        />

        <ModalInput
          title={I18n.t('translation.addNewBrand')}
          placeholder={I18n.t('translation.brandName')}
          visible={this.state.addBrandDialog}
          onPressConfirm={this.handleBrandSelect.bind(this)}
          onRequestClose={() => this.setState({ addBrandDialog: false })}
        />

        <ModalInput
          title={I18n.t('translation.enterPrice')}
          placeholder={I18n.t('translation.price')}
          keyboardType="numeric"
          visible={this.state.priceDialog}
          onPressConfirm={this.confirmPriceInputModal.bind(this)}
          onRequestClose={() => this.setState({ priceDialog: false })}
        />

        <Modal
          visible={this.state.screenDeviceModal}
          onRequestClose={() => this.setState({ screenDeviceModal: false })}
        >
          <GesturePassword
            message={I18n.t('translation.inputDeviceScreenPassword')}
            allowCross={false}
            onEnd={(value) => {
              this.handleTextInput('scr_pass', value);
              this.setState({ screenDeviceModal: false });
            }}
          />
        </Modal>

        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.scene.responsiveWrapper}>
            <View style={styles.scene.responsive}>
              <View style={styles.scene.listItemsContainer}>
                {this.state.device.status === deviceType.CLIENT
                && (
                <AutocompleteInput
                  requiredMark
                  placeholder={I18n.t('translation.owner')}
                  searchPlaceholder={I18n.t('translation.name')}
                  item={this.state.client}
                  items={this.props.clients}
                  autocompleteFilter={clientSearch}
                  getItemText={getClientName}
                  onItemSelected={this.handleAutocompleteItemSelect.bind(this, 'client', 'user_id')}
                />
                )
                }
                <AutocompleteInput
                  requiredMark
                  placeholder={I18n.t('translation.brand')}
                  searchPlaceholder={I18n.t('translation.name')}
                  item={this.state.brand}
                  items={this.props.brands}
                  autocompleteFilter={brandSearch}
                  getItemText={item => item.name}
                  onItemSelected={this.handleBrandSelect.bind(this)}
                  onAddButtonPress={() => this.setState({ addBrandDialog: true })}
                />
                <AutocompleteInput
                  requiredMark
                  placeholder={I18n.t('translation.model')}
                  searchPlaceholder={I18n.t('translation.name')}
                  item={this.state.model}
                  items={this.state.models}
                  autocompleteFilter={modelSearch}
                  getItemText={item => item.name || item.m_name}
                  disabled={!this.state.brand.id}
                  onItemSelected={this.handleModelSelect.bind(this)}
                  onAddButtonPress={() => Actions.modelsScene({
                    backHandler: this.loadBrandModels.bind(this, this.state.brand.id),
                    brand: this.state.brand,
                  })}
                />
                {this.state.device.status !== deviceType.CLIENT
                && (
                <View style={[styles.component.listItemButtonContainer, { height: 40, paddingHorizontal: 15, alignItems: 'center' }]}>
                  <Text style={styles.component.listItemMainText}>{I18n.t('translation.canUsedTemporary')}</Text>
                  <Switch
                    style={styles.component.switchButton}
                    onValueChange={value => this.handleTextInput('status', value ? deviceType.TEMPORARY : deviceType.OWN)}
                    value={this.state.device.status === deviceType.TEMPORARY}
                    tintColor={colors.darkGray}
                    thumbTintColor={colors.white}
                    onTintColor={colors.button}
                    disabled={this.state.device.used_in_project === 1}
                  />
                </View>
                )
                }
                <TextInput
                  ref={this.inputs.device_name}
                  placeholder={I18n.t('translation.additionalInfo')} hint
                  value={this.state.device.device_name}
                  onChangeText={this.handleTextInput.bind(this, 'device_name')}
                  onRightButtonPress={() => this.setState({ priceDialog: true })}
                  right={(this.state.device.status === deviceType.CLIENT && this.state.device.id)
                  && (
                  <Button
                    text={I18n.t('translation.buy')} disabled
                    style={styles.component.textInputButtonContainer}
                    textStyle={styles.component.textInputButtonText}
                  />
                  )
                  }
                />

                <TextInputMask
                  requiredMark
                  type="custom"
                  maxLength={17}
                  options={{
                    mask: '99999-99999-99999',
                    getRawValue: value => value.replace(/\D/g, ''),
                  }}
                  forwardedRef={ref => this.inputs.dev_imei = ref}
                  placeholder={I18n.t('translation.imei')} hint
                  keyboardType="numeric"
                  value={this.state.device.dev_imei}
                  onChangeText={this.handleTextInput.bind(this, 'dev_imei')}
                  onSubmitEditing={() => this.inputs.dev_pass.current.focus()}
                />
                <TextInput
                  placeholder={I18n.t('translation.serialNumber')} hint
                  value={this.state.device.serial_number}
                  onChangeText={this.handleTextInput.bind(this, 'serial_number')}
                />
                <TextInput
                  ref={this.inputs.dev_pass}
                  placeholder={I18n.t('translation.devicePassword')} hint
                  value={this.state.device.dev_pass}
                  onChangeText={this.handleTextInput.bind(this, 'dev_pass')}
                />
                <TouchableOpacity onPress={() => { this.setState({ screenDeviceModal: true }); }}>
                  <GesturePasswordView
                    value={this.state.device.scr_pass}
                    placeholder={I18n.t('translation.screenPassword')}
                  />
                </TouchableOpacity>
                {
                  this.state.device.status !== deviceType.CLIENT
                  && (
                  <TextInput
                    ref={this.inputs.price}
                    placeholder={I18n.t('translation.price')} hint
                    keyboardType="numeric"
                    value={this.state.device.price.toString()}
                    onChangeText={this.handleTextInput.bind(this, 'price')}
                  />
                  )
                }
                <TouchableOpacity onPress={this.handleImagePickerPress.bind(this)}>
                  <TextInput
                    editable={false} placeholder={I18n.t('translation.photos')} hint
                    value={images.length ? I18n.t('translation.amountPhotos', { length: images.length }) : ''}
                    right={<TextInputIcon.Camera />}
                  />
                </TouchableOpacity>
                <ImagesGallery images={images} onDeleteImagePress={this.handleDeleteImagePress.bind(this)} />
              </View>

              <Header
                text={I18n.t('translation.accountsList')}
                left={HeaderIcon.ADD}
                onLeftButtonPress={this.handleAddAccountButtonPress.bind(this)}
              />

              <View style={styles.scene.listItemsContainer}>
                {this.state.device.ac_info.map((account, id) => (
                  <View key={account.id} style={{ marginBottom: 15 }}>
                    <TextInput
                      requiredMark
                      ref={ref => this.inputs.accountsEmail[id] = ref}
                      placeholder={I18n.t('translation.email')} hint
                      value={account.ac_email}
                      keyboardType="email-address"
                      onChangeText={this.handleAccountTextInput.bind(this, id, 'ac_email')}
                      onSubmitEditing={() => this.inputs.accountsPass[id].focus()}
                    />
                    <TextInput
                      requiredMark
                      ref={ref => this.inputs.accountsPass[id] = ref}
                      placeholder={I18n.t('translation.password')} hint
                      value={account.ac_pass}
                      onChangeText={this.handleAccountTextInput.bind(this, id, 'ac_pass')}
                      onSubmitEditing={() => {
                        if (this.inputs.accountsEmail[id + 1]) this.inputs.accountsEmail[id + 1].focus();
                      }}
                    />
                    {!account.dev_id
                    && (
                    <TouchableOpacity
                      onPress={this.handleRemoveAccountPress.bind(this, id)}
                      style={[styles.component.imageCheckIndicator, styles.component.removeAccountButton]}
                    >
                      <MaterialIcon name="close" size={22} color={colors.white} />
                    </TouchableOpacity>
                    )
                    }
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
              <Button
                onPress={this.handleSaveButtonPress.bind(this)}
                text={I18n.t('translation.save')} style={styles.scene.buttonSize}
              />

              {this.state.device.id && this.state.device.used_in_project !== 1
              && (
              <Button
                onPress={() => this.setState({ deleteConfirmation: true })}
                text={I18n.t('translation.delete')} style={[styles.scene.buttonSize, { backgroundColor: colors.statusRed }]}
              />
              )
              }
            </View>
          </View>
        </View>
      </Scene>
    );
  }

  static propTypes = {
    device: PropTypes.object,
    status: PropTypes.number,
    draftProjectId: PropTypes.number,
    client: PropTypes.object,
    brand: PropTypes.object,
    model: PropTypes.object,
    problem: PropTypes.string,
    clients: PropTypes.array.isRequired,
    brands: PropTypes.array.isRequired,
    postBrand: PropTypes.func.isRequired,
    postDevice: PropTypes.func.isRequired,
    updateDevice: PropTypes.func.isRequired,
    buyDevice: PropTypes.func.isRequired,
    postDeviceImage: PropTypes.func.isRequired,
    getBrandModels: PropTypes.func.isRequired,
    removeDeviceImage: PropTypes.func.isRequired,
    deleteDevice: PropTypes.func.isRequired,
    onActionsSuccess: PropTypes.func,
  };

  static defaultProps = {
    status: deviceType.CLIENT,
    device: {},
    client: {},
    brand: {},
    model: {},
    problem: '',
    draftProjectId: 0,
    onActionsSuccess: (device) => {
      const timer = setTimeout(() => {
        Actions.refresh({ device });
        clearTimeout(timer);
      }, 600);
        Actions.pop();
    },
  };
}

export default connect(({ main }) => ({
  clients: main.clients,
  brands: main.brands.filter(b => b.status),
}), {
  postDevice,
  updateDevice,
  buyDevice,
  postBrand,
  deleteDevice,
  postDeviceImage,
  removeDeviceImage,
  getBrandModels,
})(DeviceForms);
