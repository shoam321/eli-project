import React, { Component } from 'react';
import {
  ScrollView, Text, TouchableOpacity, View, Linking, Image, Clipboard,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import Share from 'react-native-share';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import I18n from '../../lang/i18n';
import { getClient } from '../../actions/clients';
import { getDevice } from '../../actions/devices';
import { getProjectUsedPart, projectInvoice } from '../../actions/projects';
import { getArrayItemByKey } from '../../actions/common';
import { getAppLanguage } from '../../actions/user';
import { remote, projectStatusItems, projectStatus } from '../../config/constants';
import styles, { colors } from '../../config/styles';
import Scene from '../../components/Scene';
import TextInput, { TextInputIcon } from '../../components/TextInput';
import Header, { HeaderIcon } from '../components/Header';
import ImagesGallery from '../components/ImagesGallery';
import Button from '../../components/Button';
import TextInfo from '../../components/TextInfo';
import InvoiceModal from '../components/InvoiceModal';
import { Toast } from '../../components/Notification';
import GesturePasswordView from '../../components/GesturePasswordView';

class ProjectInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      secureCost: true,
      invoiceModal: false,
      invoiceUrl: this.props.project.invoice_url,
      usedParts: [],
    };
  }

  componentWillMount() {
    if (this.props.project.id) {
      this.props.getProjectUsedPart(this.props.project.id)
        .then(({ used_parts }) => this.setState({ usedParts: used_parts }))
        .catch(() => {});
    }
  }

  handleEditProjectPress() {
    Actions.projectFormsScene({
      project: this.props.project,
      client: {
        name: this.props.project.name,
        last_name: this.props.project.last_name,
      },
      clientDevice: { device_name: `${this.props.project.brand_name || ''} ${this.props.project.model_name || ''}` },
      tempDevice: { device_name: `${this.props.project.tmp_brand_name || ''} ${this.props.project.tmp_model_name || ''}` },
    });
  }

  handleViewClientPress() {
    this.setState({ loading: true });
    this.props.getClient(this.props.project.cl_id)
      .then(data => Actions.clientScene({ client: data.client }))
      .finally(() => this.setState({ loading: false }));
  }

  handleViewDevicePress() {
    this.setState({ loading: true });
    this.props.getDevice(this.props.project.device_id)
      .then(data => Actions.deviceScene({ device: data.devices }))
      .finally(() => this.setState({ loading: false }));
  }

  handleShareButtonPress() {
    this.props.getAppLanguage().then((lang) => {
      new Promise((resolve) => {
        Clipboard.setString(`${this.props.project.phone || ''}`);
        Toast.showMessage(I18n.t('translation.phoneNumber'), I18n.t('translation.copiedToClipboard'));

        const timer = setTimeout(() => {
          resolve();
          clearTimeout(timer);
        }, 1000);
      }).then(() => {
        const url = `${remote.sharing}/project/${this.props.client_id}/${this.props.project.id}?lang=${lang.code}`;

        Share.open({
          title: I18n.t('translation.shareProjectTitle'),
          message: I18n.t('translation.shareProjectMessage'),
          url,
        }).catch(() => {});
      });
    });
  }

  handlePrintInvoiceButtonPress(paymentInfo = null) {
    this.setState({
      invoiceModal: false,
    }, () => {
      const timer = setTimeout(() => {
        if (!this.state.invoiceUrl) {
          this.setState({ loading: true });

          this.props.projectInvoice({
            project_id: this.props.project.id,
            payment_type: paymentInfo.invoicePaymentType,
            cc_type: paymentInfo.invoicePaymentMethod,
            cc_number: paymentInfo.invoiceLast4Digits,
          }).then((data) => {
            this.setState({
              loading: false,
              invoiceUrl: data.invoice.link,
            });

            Linking.canOpenURL(data.invoice.link).then((supported) => {
              if (supported) {
                Linking.openURL(data.invoice.link);
              }
            });
          }).finally(() => {
            this.setState({
              loading: false,
            });
          });
        } else {
          Linking.canOpenURL(this.state.invoiceUrl).then((supported) => {
            if (supported) {
              Linking.openURL(this.state.invoiceUrl);
            }
          });
        }

        clearTimeout(timer);
      }, 200);
    });
  }

  handlePrintButtonPress() {
    this.props.getAppLanguage().then((lang) => {
      const url = `${remote.sharing}/project/${this.props.client_id}/${this.props.project.id}?lang=${lang.code}`;

      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        }
      });
    });
  }

  getGalleryImages() {
    return (this.props.project.images || [])
      .map(image => ({ ...image, url: image.photo }));
  }

  handlePartListItemPress(id) {
    if (id === this.state.expanded) this.setState({ expanded: -1 });
    else this.setState({ expanded: id });
  }

  renderUsedPart(part, id) {
    return (
      <React.Fragment key={part.id}>
        <View style={styles.component.removePartContainer}>
          <TouchableOpacity
            onPress={this.handlePartListItemPress.bind(this, part.id)}
            style={[styles.component.listItemButtonContainer, { height: 42, flex: 1 }]}
          >
            <Text style={styles.component.listItemMainText}>
              {this.state.expanded === part.id
                ? <TextInputIcon.Expanded />
                : <TextInputIcon.Triangle />
              }
              {part.pr_name}
            </Text>
            <Text style={styles.component.listItemText}>{part.quantity}</Text>
          </TouchableOpacity>
        </View>
        {this.state.expanded === part.id
        && (
        <View style={{ padding: 10, marginLeft: 50 }}>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.supplier')}</Text>
            <Text style={styles.component.listItemDarkSubText}>{part.sup_name}</Text>
          </View>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{ I18n.t('translation.name') }</Text>
            <Text style={styles.component.listItemDarkSubText}>
              {part.pr_name}
-
              {part.color}
-
              {part.m_name}
            </Text>
          </View>
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{ I18n.t('translation.amount') }</Text>
            <Text style={styles.component.listItemDarkSubText}>{part.quantity}</Text>
          </View>
        </View>
        )
        }
      </React.Fragment>
    );
  }

  render() {
    const parts = this.state.usedParts.filter(item => 1 === item.type);
    const products = this.state.usedParts.filter(item => 2 === item.type);
    const images = this.getGalleryImages();
    return (
      <Scene loading={this.state.loading}>
        <Header
          text={`${this.props.project.brand_name || ''} ${this.props.project.model_name || ''}`}
          left={HeaderIcon.BACK}
          right={HeaderIcon.EDIT}
          onLeftButtonPress={() => Actions.pop()}
          onRightButtonPress={() => this.handleEditProjectPress()}
        />

        <InvoiceModal
          visible={this.state.invoiceModal}
          onRequestClose={() => {
            this.setState({
              invoiceModal: false,
            });
          }}
          handlePrintInvoiceButtonPress={this.handlePrintInvoiceButtonPress.bind(this)}
        />

        <ScrollView contentContainerStyle={styles.scene.listItemsContainer}>
          <View style={styles.scene.responsiveWrapper}>
            <View style={styles.scene.responsive}>
              <TextInput
                editable={false}
                placeholder={I18n.t('translation.client')} hint
                left={<TextInputIcon.Triangle />}
                right={<TextInputIcon.GoRight />}
                onRightButtonPress={this.handleViewClientPress.bind(this)}
                value={`${this.props.project.name} ${this.props.project.last_name}`}
              />
              <TextInput
                editable={false}
                placeholder={I18n.t('translation.device')} hint
                left={<TextInputIcon.Triangle />}
                right={<TextInputIcon.GoRight />}
                onRightButtonPress={this.handleViewDevicePress.bind(this)}
                value={`${this.props.project.brand_name || ''} ${this.props.project.model_name || ''}`}
              />
              <TextInput
                editable={false}
                placeholder={I18n.t('translation.devicePassword')} hint
                value={this.props.project.dev_pass}
              />
              <GesturePasswordView
                value={this.props.project.scr_pass}
                placeholder={I18n.t('translation.screenPassword')}
              />
              <TextInfo
                label={I18n.t('translation.problem')}
                value={this.props.project.problem}
              />
              <TextInput
                editable={false}
                placeholder={I18n.t('translation.cost')} hint
                secureTextEntry={this.state.secureCost}
                right={<TextInputIcon.Eye color={this.state.secureCost ? colors.blackBackground : colors.button} />}
                onRightButtonPress={() => this.setState({ secureCost: !this.state.secureCost })}
                value={this.state.secureCost ? '******' : this.props.project.cost.toString()}
              />
              <TextInput
                editable={false}
                placeholder={I18n.t('translation.price')} hint
                value={this.props.project.price.toString()}
              />
              <TextInput
                editable={false}
                placeholder={I18n.t('translation.dueDate')} hint
                value={this.props.project.due_date}
              />
              <TextInput
                editable={false}
                left={<TextInputIcon.Triangle />}
                placeholder={I18n.t('translation.temporaryDevice')} hint
                value={`${this.props.project.tmp_brand_name || ''} ${this.props.project.tmp_model_name || ''}`}
              />
              <TextInput
                editable={false}
                left={<TextInputIcon.Triangle />}
                placeholder={I18n.t('translation.status')} hint
                value={
                  I18n.t(getArrayItemByKey(
                    projectStatusItems,
                    this.props.project.status,
                  ).name)
                }
              />
              <TextInfo
                label={I18n.t('translation.summary')}
                value={this.props.project.summary}
              />
              <TextInput
                editable={false} placeholder={I18n.t('translation.photos')} hint
                value={images.length ? I18n.t('translation.amountPhotos', { length: images.length }) : ''}
                right={<TextInputIcon.Camera />}
              />
              <ImagesGallery images={images} />

              {!!this.props.project.signature_image
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
                  source={{ uri: this.props.project.signature_image }}
                />
              </View>
              )
              }

              {this.props.project.id
              && (
              <React.Fragment>
                <Header
                  text={I18n.t('translation.usedParts')}
                />
                <View style={styles.scene.innerListItemsContainer}>
                  {parts.map(this.renderUsedPart.bind(this))}
                </View>
                <Header
                  text={I18n.t('translation.usedProducts')}
                  />
                <View style={styles.scene.innerListItemsContainer}>
                  {products.map(this.renderUsedPart.bind(this))}
                </View>
              </React.Fragment>
              )
              }


              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                <Button
                  onPress={this.handleShareButtonPress.bind(this)}
                  text={I18n.t('translation.share')} style={{ marginVertical: 30 }}
                />
                <Button
                  onPress={this.handlePrintButtonPress.bind(this)}
                  text={I18n.t('translation.print')} style={{ marginVertical: 30 }}
                />
              </View>

              {this.props.project.status === projectStatus.FINISHED
              && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                <Button
                  disabled={this.props.user && this.props.user.company && this.props.user.company.invoice_api_key === ''}
                  onPress={this.state.invoiceUrl ? this.handlePrintInvoiceButtonPress.bind(this) : () => {
                    this.setState({
                      invoiceModal: true,
                    });
                  }}
                  text={I18n.t('translation.printInvoice')} style={{ marginBottom: 30 }}
                />
              </View>
              )
              }
            </View>
          </View>
        </ScrollView>
      </Scene>
    );
  }

  static propTypes = {
    project: PropTypes.object,
    user: PropTypes.object.isRequired,
    client_id: PropTypes.string.isRequired,
    getClient: PropTypes.func.isRequired,
    getDevice: PropTypes.func.isRequired,
    getProjectUsedPart: PropTypes.func.isRequired,
    getAppLanguage: PropTypes.func.isRequired,
    projectInvoice: PropTypes.func.isRequired,
  };

  static defaultProps = {
    project: {},
  };
}

export default connect(({ user }) => ({
  client_id: user.profile.client_id,
  user: user.profile,
}), {
  getClient, getDevice, getProjectUsedPart, getAppLanguage, projectInvoice,
})(ProjectInfo);
