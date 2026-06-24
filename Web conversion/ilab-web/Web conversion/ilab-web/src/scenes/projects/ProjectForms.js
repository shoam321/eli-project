/* eslint-disable import/extensions */
import React, { Component } from 'react';
import {
  ScrollView, TouchableOpacity, Keyboard, BackHandler, View, Text, Image,
} from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import ImageResizer from 'react-native-image-resizer';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';

import I18n from '../../lang/i18n';
import Validator, { formsValidation } from '../../actions/validators';
import { getArrayItemByKey, readFile, handleBackButtonPress } from '../../actions/common';
import {
  postProject, updateProject,
  postProjectImage, removeProjectImage, postProjectSignatureImage,
  postProjectUsedPart, getProjectUsedPart,
  deleteProjectUsedPart, deleteProjectManyUsedPart,
} from '../../actions/projects';
import {
  getClientDevices, getTemporaryDevices,
  deviceSearch, getDeviceName,
} from '../../actions/devices';
import { clientSearch, getClientName } from '../../actions/clients';
import { deviceType, projectStatus, projectStatusItems } from '../../config/constants';
import ConfirmationDialog from '../components/ConfirmationDialog';
import styles, { colors } from '../../config/styles';
import { deleteDraftProject } from '../../actions/draftProjects';
import Scene from '../../components/Scene';
import TextInput, { TextInputIcon } from '../../components/TextInput';
import Header, { HeaderIcon } from '../components/Header';
import Button from '../../components/Button';
import { Alert, Toast } from '../../components/Notification';
import AutocompleteInput from '../components/AutocompleteInput';
import ImagesGallery from '../components/ImagesGallery';
import UsedPartDialog from '../components/UsedPartDialog';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';

class ProjectForms extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      datePicker: false,
      usedPartDialog: false,
      usedProductsDialog: false,
      client: props.client,
      clientDevice: props.clientDevice,
      tempDevice: props.tempDevice,
      clientDevices: [],
      photos: [],
      removeImages: [],
      status: getArrayItemByKey(
        projectStatusItems,
        props.project.status,
      ),
      project: {
        cl_id: props.client.id,
        device_id: props.clientDevice.id,
        tmp_id: props.tempDevice.id,
        status: projectStatus.OPEN,
        images: [],

        problem: '',
        cost: '',
        price: '',
        signature_image: null,
        due_date: '',
        summary: '',

        ...props.project,
      },
      types: [
        {
          id: 1,
          name: 'Parts'
        },
        {
          id: 2,
          name: 'Products'
        }
      ],
      type: {
        id: 1,
        name: 'Parts'
      },
      usedParts: [],
      usedPartConfirm: false,
      cancelUsedPartConfirm: false,
    };
    this.inputs = {
      problem: React.createRef(),
      cost: React.createRef(),
      price: React.createRef(),
      summary: React.createRef(),
    };
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonPress);

    if (this.props.project.id) {
      this.props.getProjectUsedPart(this.props.project.id)
        .then(({ used_parts }) => this.setState({ usedParts: used_parts }))
        .catch(() => {});
    }

    this.props.getTemporaryDevices().catch(() => {});
    if (this.props.client.id || this.props.project.cl_id) {
      this.props.getClientDevices(this.props.client.id || this.props.project.cl_id)
        .then(({ devices }) => this.setState({ clientDevices: devices }))
        .catch(() => {});
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', handleBackButtonPress);
  }

  componentWillReceiveProps(props) {
    this.setState({
      project: {
        ...this.state.project,
        signature_image: props.isSignature ? props.signatureImage : this.state.project.signature_image,
      },
    });
  }

  getGalleryImages() {
    const images = [...this.state.photos, ...this.state.project.images];
    return images.reduce((previous, current) => {
      if (current.id && this.state.removeImages
        .findIndex(i => i.id === current.id) > -1) return previous;
      else return [...previous, { ...current, url: (current.photo || current.uri) }];
    }, []);
  }

  handleTextInput(key, value) {
    this.setState({
      project: {
        ...this.state.project,
        [key]: value,
      },
    });
  }

  checkStatus(item) {
    this.handleAutocompleteItemSelect('status', 'status', item);

    if (item.id === projectStatus.FINISHED && this.state.usedParts.length === 0) {
      this.setState({
        usedPartConfirm: true,
      });
    } else if (item.id === projectStatus.CANCELED && this.state.usedParts.length > 0) {
      this.setState({
        cancelUsedPartConfirm: true,
      });
    } else if (item.id === projectStatus.DELAYED) {
      this.setState({
        datePicker: true,
      });
    }
  }

  handleAutocompleteItemSelect(key, keyId, item) {
    this.setState({
      [key]: item,
      project: {
        ...this.state.project,
        [keyId]: item.id,
      },
    });
  }

  handleClientSelect(client) {
    this.setState({
      client,
      clientDevice: {},
      clientDevices: [],
      project: {
        ...this.state.project,
        cl_id: client.id,
        device_id: undefined,
      },
    });

    this.props.getClientDevices(client.id)
      .then(response => this.setState({ clientDevices: response.devices }))
      .catch(() => {});
  }

  handleImagePickerPress() {
    Keyboard.dismiss();
    Actions.imagesPickerScene({
      active: this.state.photos,
      onActionSuccess: photos => this.setState({ photos }),
    });
  }

  handleDeleteImagePress(image) {
    if (image.id) {
      const images = [...this.state.project.images];
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

  removeProjectImages() {
    return Promise.all(
      this.state.removeImages.map(image => this.props.removeProjectImage(image.id)),
    );
  }

  uploadProjectImages(projectId) {
    return Promise.all(
      this.state.photos.map(image => ImageResizer.createResizedImage(image.uri, 1000, 1000, 'JPEG', 100)
        .then(image => readFile(image.uri))
        .then(image => this.props.postProjectImage(projectId, image))),
    );
  }

  handleDatePick(date) {
    this.setState({
      datePicker: false,
      project: {
        ...this.state.project,
        due_date: moment(date).format('YYYY-MM-DD HH:mm'),
      },
    });
  }

  onRequestOrder(part) {
    this.setState({ usedPartDialog: false });

    Actions.orderFormsScene({
      supplier: { id: part.sup_id, sup_name: part.sup_name },
      brand: { id: part.pr_brand_id, name: part.br_name },
      model: { id: part.md_id, m_name: part.m_name },
      part,
    });
  }

  handleConfirmUsedPartPress(part) {
    this.setState({ loading: true });
    this.props.postProjectUsedPart(part)
      .then(() => this.props.getProjectUsedPart(this.props.project.id))
      .then(({ used_parts }) => this.setState({ usedParts: used_parts }))
      .catch(() => Alert.showMessage(I18n.t('translation.error')))
      .finally(() => this.setState({ loading: false }));
  }

  deleteAllUserParts() {
    this.setState({ cancelUsedPartConfirm: false });

    this.setState({ loading: true });
    this.props.deleteProjectManyUsedPart(this.props.project.id, this.state.usedParts)
      .then(() => this.props.getProjectUsedPart(this.props.project.id))
      .then(({ used_parts }) => this.setState({ usedParts: used_parts }))
      .catch(() => Alert.showMessage(I18n.t('translation.error')))
      .finally(() => this.setState({ loading: false }));
  }

  handleDeleteUsedPartPress(part) {
    part.pr_id = this.props.project.id;

    this.setState({ loading: true });
    this.props.deleteProjectUsedPart(part)
      .then(() => this.props.getProjectUsedPart(this.props.project.id))
      .then(({ used_parts }) => this.setState({ usedParts: used_parts }))
      .catch(() => Alert.showMessage(I18n.t('translation.error')))
      .finally(() => this.setState({ loading: false }));
  }

  handleSaveButtonPress() {
    const customRules = {};

    if (this.state.project.status === projectStatus.FINISHED) {
      customRules.summary = new Validator(Validator.string.required, 'translation.summary');
    }

    const errors = Validator.getFormErrors(this.state.project, {
      ...formsValidation.PROJECT,
      ...customRules,
    });

    if (errors.length > 0) return Alert.showMessage(I18n.t('translation.error'), errors.join('\n'));

    this.setState({ loading: true });

    const request = this.state.project.id
      ? this.props.updateProject
      : this.props.postProject;

    request({
      ...this.state.project,
      signature_image: null,
    }, false)
      .then(response => this.removeProjectImages()
        .then(() => this.uploadProjectImages(response.project.id))
        .then(() => {
          if (this.props.isSignature) {
            return this.props.postProjectSignatureImage(response.project.id, this.state.project.signature_image.replace(/\n/g, ''));
          } else {
            return Promise.resolve(true);
          }
        })
        .then(() => this.props.updateProject(response.project))
        .then(({ project }) => this.props.onActionsSuccess(project)))
      .catch((e) => {
        const error = () => Alert.showMessage(I18n.t('translation.error'), e.message || I18n.t('translation.checkFormData'));
        this.setState({ loading: false }, error);
      });
  }

  handleApproveButtonPress() {
    const customRules = {};

    if (this.state.project.status === projectStatus.FINISHED) {
      customRules.summary = new Validator(Validator.string.required, 'translation.summary');
    }

    const errors = Validator.getFormErrors(this.state.project, {
      ...formsValidation.PROJECT,
      ...customRules,
    });

    if (errors.length > 0) return Alert.showMessage(I18n.t('translation.error'), errors.join('\n'));

    this.setState({ loading: true });

    this.props.postProject({
      ...this.state.project,
      signature_image: null,
    }, false)
      .then(response => this.removeProjectImages()
        .then(() => this.uploadProjectImages(response.project.id))
        .then(() => this.props.postProjectSignatureImage(response.project.id, this.state.project.signature_image.replace(/\n/g, '')))
        .then(() => this.props.deleteDraftProject(this.props.draftProjectId))
        .then(() => this.props.updateProject(response.project))
        .then(({ project }) => this.props.onActionsSuccess(project)))
      .then(() => {
        Toast.showMessage(I18n.t('translation.project'), I18n.t('translation.approved'));
      })
      .catch((e) => {
        const error = () => Alert.showMessage(I18n.t('translation.error'), e.message || I18n.t('translation.checkFormData'));
        this.setState({ loading: false }, error);
      });
  }

  handleDeclineButtonPress() {
    this.props.deleteDraftProject(this.props.draftProjectId)
      .then(() => {
        Toast.showMessage(I18n.t('translation.project'), I18n.t('translation.declined'));
      })
      .then(() => this.props.onActionsSuccess())
      .catch((e) => {
        Alert.showMessage(I18n.t('translation.error'), e.message || I18n.t('translation.checkFormData'));
      });
  }

  handlePartListItemPress(id) {
    if (id === this.state.expanded) this.setState({ expanded: -1 });
    else this.setState({ expanded: id });
  }

  renderUsedPart(part, id) {
    return (
      <React.Fragment key={id}>
        <View style={styles.component.removePartContainer}>
          <TouchableOpacity
            onPress={this.handlePartListItemPress.bind(this, id)}
            style={[styles.component.listItemButtonContainer, { height: 42, flex: 1 }]}
          >
            <Text style={styles.component.listItemMainText}>
              {this.state.expanded === id
                ? <TextInputIcon.Expanded />
                : <TextInputIcon.Triangle />
              }
              {part.pr_name}
            </Text>
            <Text style={styles.component.listItemText}>{part.quantity}</Text>
          </TouchableOpacity>
          <DeleteConfirmationDialog
            textConfirmation={I18n.t('translation.doYouWantDeletePart')}
            onPressConfirm={this.handleDeleteUsedPartPress.bind(this, part)}
          />
        </View>
        {this.state.expanded === id
        && (
        <View style={{ padding: 10, marginLeft: 50 }}>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.supplier')}</Text>
            <Text style={styles.component.listItemDarkSubText}>{part.sup_name}</Text>
          </View>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.name')}</Text>
            <Text style={styles.component.listItemDarkSubText}>
              {part.pr_name}
-
              {part.color}
-
              {part.m_name}
            </Text>
          </View>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.amount')}</Text>
            <Text style={styles.component.listItemDarkSubText}>{part.quantity}</Text>
          </View>
        </View>
        )
        }
      </React.Fragment>
    );
  }

  render() {
    const images = this.getGalleryImages();
    const parts = this.state.usedParts ? this.state.usedParts.filter(item => 1 === item.type) : [];
    const listParts =  this.state.project.list_parts ? this.state.project.list_parts.filter(item => 1 === item.type) : [];
    const listProducts = this.state.project.list_parts ? this.state.project.list_parts.filter(item => 2 === item.type) : [];
    const products = this.state.usedParts ? this.state.usedParts.filter(item => 2 === item.type) : [];
    return (
      <Scene loading={this.state.loading}>
        <Header
          text={this.state.project.id ? I18n.t('translation.editProject') : I18n.t('translation.addProject')}
          left={!this.props.isTemporaryDevice && HeaderIcon.BACK}
          onLeftButtonPress={() => Actions.pop()}
        />

        <ConfirmationDialog
          text={I18n.t('translation.didYouUsedParts')}
          visible={this.state.usedPartConfirm}
          onRequestClose={() => this.setState({ usedPartConfirm: false })}
          onAccessButtonPress={() => this.setState({ usedPartConfirm: false, usedPartDialog: true })}
        />

        <ConfirmationDialog
          text={I18n.t('translation.doRemovePartsFromUsedPartList')}
          visible={this.state.cancelUsedPartConfirm}
          onRequestClose={() => this.setState({ cancelUsedPartConfirm: false })}
          onAccessButtonPress={this.deleteAllUserParts.bind(this)}
        />

        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.scene.responsiveWrapper}>
            <View style={styles.scene.responsive}>
              <View style={styles.scene.listItemsContainer}>
                <AutocompleteInput
                  requiredMark
                  placeholder={I18n.t('translation.client')}
                  searchPlaceholder={I18n.t('translation.name')}
                  item={this.state.client}
                  items={this.props.clients}
                  autocompleteFilter={clientSearch}
                  getItemText={getClientName}
                  onItemSelected={this.handleClientSelect.bind(this)}
                  onAddButtonPress={() => Actions.clientFormsScene({
                    onActionsSuccess: (client) => {
                      this.handleClientSelect({ ...client, id: client.id || client.user_id });
                      Actions.pop();
                    },
                  })}
                />
                <AutocompleteInput
                  requiredMark
                  placeholder={I18n.t('translation.device')}
                  searchPlaceholder={I18n.t('translation.name')}
                  item={this.state.clientDevice}
                  items={this.state.clientDevices}
                  autocompleteFilter={deviceSearch}
                  getItemText={getDeviceName}
                  disabled={!this.state.client.id && !this.props.project.cl_id}
                  onItemSelected={this.handleAutocompleteItemSelect.bind(this, 'clientDevice', 'device_id')}
                  onAddButtonPress={() => Actions.deviceFormsScene({
                    client: this.state.client,
                    status: deviceType.CLIENT,
                    onActionsSuccess: (device, client) => {
                      this.handleClientSelect(client); Actions.pop();
                      this.handleAutocompleteItemSelect('clientDevice', 'device_id', device);
                    },
                  })}
                />
                <TextInput
                  ref={this.inputs.problem}
                  placeholder={I18n.t('translation.problem')} hint
                  value={this.state.project.problem}
                  onChangeText={this.handleTextInput.bind(this, 'problem')}
                  onSubmitEditing={() => this.inputs.cost.current.focus()}
                  requiredMark
                />
                <TextInput
                  requiredMark
                  ref={this.inputs.cost}
                  placeholder={I18n.t('translation.cost')} hint
                  value={this.state.project.cost.toString()}
                  onChangeText={this.handleTextInput.bind(this, 'cost')}
                  onSubmitEditing={() => this.inputs.price.current.focus()}
                  keyboardType="numeric"
                />
                <TextInput
                  requiredMark
                  ref={this.inputs.price}
                  placeholder={I18n.t('translation.price')} hint
                  value={this.state.project.price.toString()}
                  onChangeText={this.handleTextInput.bind(this, 'price')}
                  onSubmitEditing={() => {
                    if (this.inputs.summary.current) this.inputs.summary.current.focus();
                  }}
                  keyboardType="numeric"
                />
                <TouchableOpacity onPress={() => this.setState({ datePicker: true })}>
                  <TextInput
                    requiredMark
                    editable={false}
                    placeholder={I18n.t('translation.dueDate')} hint
                    value={this.state.project.due_date}
                    onChangeText={this.handleTextInput.bind(this, 'due_date')}
                  />
                </TouchableOpacity>
                <AutocompleteInput
                  placeholder={I18n.t('translation.temporaryDevice')}
                  searchPlaceholder={I18n.t('translation.name')}
                  clearable={!!this.state.project.tmp_id}
                  item={this.state.tempDevice}
                  items={this.props.tempDevices}
                  autocompleteFilter={deviceSearch}
                  getItemText={getDeviceName}
                  onItemSelected={this.handleAutocompleteItemSelect.bind(this, 'tempDevice', 'tmp_id')}
                  onAddButtonPress={() => Actions.deviceFormsScene({
                    status: deviceType.TEMPORARY,
                    onActionsSuccess: (device) => {
                      this.handleAutocompleteItemSelect('tempDevice', 'tmp_id', device);
                      Actions.pop(); /* this.props.getTemporaryDevices(); */
                    },
                  })}
                />
                {!!this.props.project.id
                && (
                <React.Fragment>
                  <AutocompleteInput
                    requiredMark
                    placeholder={I18n.t('translation.status')}
                    searchPlaceholder={I18n.t('translation.name')}
                    item={this.state.status}
                    items={projectStatusItems}
                    getItemText={item => I18n.t(item.name)}
                    onItemSelected={this.checkStatus.bind(this)}
                  />
                  <TextInput
                    ref={this.inputs.summary}
                    placeholder={I18n.t('translation.summary')} hint
                    value={this.state.project.summary}
                    onChangeText={this.handleTextInput.bind(this, 'summary')}
                  />
                </React.Fragment>
                )
                }
                <TouchableOpacity onPress={this.handleImagePickerPress.bind(this)}>
                  <TextInput
                    editable={false} placeholder={I18n.t('translation.photos')} hint
                    value={images.length ? I18n.t('translation.amountPhotos', { length: images.length }) : ''}
                    right={<TextInputIcon.Camera />}
                    onRightButtonPress={this.handleImagePickerPress.bind(this)}
                  />
                </TouchableOpacity>

                <ImagesGallery images={images} onDeleteImagePress={this.handleDeleteImagePress.bind(this)} />
                {!!this.state.project.signature_image
                && (
                <View style={{ flexDirection: 'column', height: 260 }}>
                  <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 5 }}>
                    <View style={{ paddingLeft: 15 }}>
                      <Text style={{ fontSize: 16, color: colors.placeholder, paddingVertical: 3 }}>
                        {I18n.t('translation.signature')}
                      </Text>
                    </View>
                  </View>
                  <Image
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: colors.blackText,
                      width: '100%',
                      height: 210,
                    }}
                   // source={{ uri: this.state.project.signature_image.indexOf('http') === 0 ? this.state.project.signature_image : `data:image/jpeg;base64,${this.state.project.signature_image}` }}
                  />
                </View>
                )
                }
              </View>

              {this.props.project.id
              && (
              <React.Fragment>
                {this.state.usedPartDialog
                  && (
                  <UsedPartDialog
                    project={this.props.project}
                    usedParts={parts}
                    listParts={listParts}
                    type={'usedParts'}
                    onPressConfirm={this.handleConfirmUsedPartPress.bind(this)}
                    onRequestClose={() => this.setState({ usedPartDialog: false })}
                    onRequestOrder={this.onRequestOrder.bind(this)}
                  />
                  )
                }
                {this.state.usedProductsDialog
                  && (
                  <UsedPartDialog
                    project={this.props.project}
                    usedParts={products}
                    listParts={listProducts}
                    type={'usedProducts'}
                    onPressConfirm={this.handleConfirmUsedPartPress.bind(this)}
                    onRequestClose={() => this.setState({ usedProductsDialog: false })}
                    onRequestOrder={this.onRequestOrder.bind(this)}
                  />
                  )
                }
                <Header
                  text={I18n.t('translation.usedParts')} left={HeaderIcon.ADD}
                  onLeftButtonPress={() => this.setState({ usedPartDialog: true })}
                />
                <View style={styles.scene.listItemsContainer}>
                  {parts.map(this.renderUsedPart.bind(this))}
                </View>

                <Header
                  text={I18n.t('translation.usedProducts')} left={HeaderIcon.ADD}
                  onLeftButtonPress={() => this.setState({ usedProductsDialog: true })}
                />
                <View style={styles.scene.listItemsContainer}>
                  {products.map(this.renderUsedPart.bind(this))}
                </View>
              </React.Fragment>
              )
              }
            </View>
          </View>
        </ScrollView>

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            {!this.props.isTemporaryProject
              ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                  {(this.state.project.signature_image || '').indexOf('http') !== 0 && (
                    <Button
                      onPress={() => Actions.termsAndConditionsSignatureScene()}
                      text={I18n.t('translation.clientSignature')} style={styles.scene.buttonSize}
                    />
                  )}

                  <Button
                    onPress={this.handleSaveButtonPress.bind(this)}
                    text={I18n.t('translation.save')} style={styles.scene.buttonSize}
                  />
                </View>
              ) : (
                <React.Fragment>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                    <Button
                      onPress={() => Actions.termsAndConditionsSignatureScene()}
                      text={I18n.t('translation.clientSignature')} style={[styles.scene.buttonSize, { marginBottom: 10 }]}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                    <Button
                      onPress={this.handleApproveButtonPress.bind(this)}
                      text={I18n.t('translation.approve')} style={styles.scene.buttonSize}
                    />
                    <Button
                      onPress={this.handleDeclineButtonPress.bind(this)}
                      text={I18n.t('translation.decline')} style={[styles.scene.buttonSize, { backgroundColor: colors.statusRed }]}
                    />
                  </View>
                </React.Fragment>
              )}
          </View>
        </View>

        <DateTimePicker
          mode="datetime"
          isVisible={this.state.datePicker}
          date={moment(this.state.project.due_date || moment()).toDate()}
          onConfirm={date => this.handleDatePick(date)}
          onCancel={() => this.setState({ datePicker: false })}
        />
      </Scene>
    );
  }

  static propTypes = {
    project: PropTypes.object,
    client: PropTypes.object,
    clientDevice: PropTypes.object,
    tempDevice: PropTypes.object,
    tempDevices: PropTypes.array.isRequired,
    clients: PropTypes.array.isRequired,
    draftProjectId: PropTypes.number,
    isTemporaryProject: PropTypes.bool,
    isTemporaryDevice: PropTypes.bool,
    getClientDevices: PropTypes.func.isRequired,
    getTemporaryDevices: PropTypes.func.isRequired,
    postProject: PropTypes.func.isRequired,
    getProjectUsedPart: PropTypes.func.isRequired,
    postProjectUsedPart: PropTypes.func.isRequired,
    deleteProjectUsedPart: PropTypes.func.isRequired,
    updateProject: PropTypes.func.isRequired,
    deleteProjectManyUsedPart: PropTypes.func.isRequired,
    postProjectImage: PropTypes.func.isRequired,
    postProjectSignatureImage: PropTypes.func.isRequired,
    removeProjectImage: PropTypes.func.isRequired,
    deleteDraftProject: PropTypes.func.isRequired,
    onActionsSuccess: PropTypes.func,
    signatureImage: PropTypes.any,
    isSignature: PropTypes.bool,
  };

  static defaultProps = {
    project: {},
    client: {},
    clientDevice: {},
    tempDevice: {},
    draftProjectId: 0,
    isTemporaryProject: false,
    isTemporaryDevice: false,
    signatureImage: null,
    isSignature: false,
    onActionsSuccess: (project) => {
      Actions.pop();
      console.log(project);

      const timer = setTimeout(() => {
        Actions.refresh({ project });

        clearTimeout(timer);
      }, 600);
    },
  };
}

export default connect(({ main }) => ({
  clients: main.clients,
  tempDevices: main.tempDevices,
}), {
  getClientDevices,
  getTemporaryDevices,
  postProject,
  updateProject,
  postProjectImage,
  removeProjectImage,
  getProjectUsedPart,
  postProjectUsedPart,
  deleteProjectUsedPart,
  deleteProjectManyUsedPart,
  deleteDraftProject,
  postProjectSignatureImage,
})(ProjectForms);
