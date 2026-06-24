import React, { Component } from 'react';
import { ScrollView, View } from 'react-native';
import Contacts from 'react-native-contacts';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

// eslint-disable-next-line import/extensions,import/no-unresolved
import { requestContactsPermissions } from '../../config/permission';
import { postSupplier, updateSupplier, deleteSupplier } from '../../actions/suppliers';
import { getContactName, contactSearch, getSupplierFromContact } from '../../actions/contacts';
import styles from '../../config/styles';
import Scene from '../../components/Scene';
import TextInput from '../../components/TextInput';
import Header, { HeaderIcon } from '../components/Header';
import { Alert } from '../../components/Notification';
import Autocomplete from '../components/Autocomplete';
import Button from '../../components/Button';
import Validator, { formsValidation } from '../../actions/validators';
import I18n from '../../lang/i18n';

class SupplierForms extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      contacts: [],
      contactsModal: false,
      supplier: {
        sup_name: '',
        sup_email: '',
        sup_phone: '',
        secondary_phone: '',

        ...props.supplier,
      },
    };
    this.inputs = {
      sup_name: React.createRef(),
      sup_email: React.createRef(),
      sup_phone: React.createRef(),
      secondary_phone: React.createRef(),
    };
  }

  handleTextInput(key, value) {
    this.setState({
      supplier: {
        ...this.state.supplier,
        [key]: value,
      },
    });
  }

  handleContactPress(contact) {
    const supplier = {
      ...this.state.supplier,
      ...getSupplierFromContact(contact),
    };
    this.setState({ supplier });
  }

  handleImportContactPress() {
    if (this.state.contacts.length > 0) {
      this.setState({ contactsModal: true });
      return;
    }

    this.setState({ loading: true });
    requestContactsPermissions()
      .then((data) => {
        if (data && data !== 'denied' && data !== 'never_ask_again') {
          Contacts.getAll((error, contacts) => {
            if (!error) {
              this.setState({ contacts, contactsModal: true, loading: false });
            } else {
              Alert.showMessage(I18n.t('translation.error'), I18n.t('translation.noPermissionContacts'));
              this.setState({ loading: false });
            }
          });
        } else {
          Alert.showMessage(I18n.t('translation.error'), I18n.t('translation.noPermissionContacts'));
          this.setState({ loading: false });
        }
      })
      .catch(() => this.setState({ loading: false }));
  }

  handleSaveButtonPress() {
    const errors = Validator.getFormErrors(this.state.supplier, formsValidation.SUPPLIER);
    if (errors.length > 0) return Alert.showMessage(I18n.t('translation.error'), errors.join('\n'));

    this.setState({ loading: true });

    const request = this.state.supplier.id
      ? this.props.updateSupplier
      : this.props.postSupplier;

    request(this.state.supplier)
      .then(response => this.props.onActionsSuccess(response.suplier))
      .catch(() => {
        const error = () => Alert.showMessage(I18n.t('translation.error'), I18n.t('translation.checkFormData'));
        this.setState({ loading: false }, error);
      });
  }

  handleDeleteButtonPress() {
      this.props.deleteSupplier(this.props.supplier.id)
        .then(res => {Actions.suppliersScene()})
        .catch(res => {console.log(res)})
        }

  render() {
    return (
      <Scene loading={this.state.loading}>
        <Header
          text={this.state.supplier.id ? I18n.t('translation.editSupplier') : I18n.t('translation.addSupplier')}
          left={HeaderIcon.BACK}
          right={HeaderIcon.IMPORT}
          onLeftButtonPress={() => Actions.pop()}
          onRightButtonPress={() => this.handleImportContactPress()}
        />

        <Autocomplete
          title={I18n.t('translation.contacts')}
          placeholder={I18n.t('translation.search')}
          items={this.state.contacts}
          visible={this.state.contactsModal}
          getItemText={getContactName}
          autocompleteFilter={contactSearch}
          onItemSelected={this.handleContactPress.bind(this)}
          onRequestClose={() => this.setState({ contactsModal: false })}
        />

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scene.listItemsContainer}
        >
          <View style={styles.scene.responsiveWrapper}>
            <View style={styles.scene.responsive}>
              <TextInput
                requiredMark
                ref={this.inputs.sup_name}
                placeholder={I18n.t('translation.firstName')} hint
                value={this.state.supplier.sup_name}
                onChangeText={this.handleTextInput.bind(this, 'sup_name')}
                onSubmitEditing={() => this.inputs.sup_email.current.focus()}
              />
              <TextInput
                ref={this.inputs.sup_email}
                placeholder={I18n.t('translation.email')} hint
                value={this.state.supplier.sup_email}
                onChangeText={this.handleTextInput.bind(this, 'sup_email')}
                onSubmitEditing={() => this.inputs.sup_phone.current.focus()}
                keyboardType="email-address"
              />
              <TextInput
                ref={this.inputs.sup_phone}
                placeholder={I18n.t('translation.phoneNumber')} hint
                value={this.state.supplier.sup_phone}
                onChangeText={this.handleTextInput.bind(this, 'sup_phone')}
                keyboardType="phone-pad"
              />
              <TextInput
                ref={this.inputs.secondary_phone}
                placeholder={I18n.t('translation.secondaryPhone')} hint
                value={this.state.supplier.secondary_phone}
                onChangeText={this.handleTextInput.bind(this, 'secondary_phone')}
                keyboardType="phone-pad"
              />

              <Button
                onPress={this.handleSaveButtonPress.bind(this)}
                text={I18n.t('translation.save')} style={{ marginTop: 30 }}
              />
             {this.props.delete ? <Button
                onPress={this.handleDeleteButtonPress.bind(this)}
                text={I18n.t('translation.delete')} style={{ marginTop: 15, backgroundColor: '#dc3545'}}
              /> : null} 
            </View>
          </View>
        </ScrollView>
      </Scene>
    );
  }

  static propTypes = {
    supplier: PropTypes.object,
    postSupplier: PropTypes.func.isRequired,
    updateSupplier: PropTypes.func.isRequired,
    onActionsSuccess: PropTypes.func,
  };

  static defaultProps = {
    supplier: {},
    onActionsSuccess: (supplier) => {
      Actions.pop();

      const timer = setTimeout(() => {
        Actions.refresh({ supplier });

        clearTimeout(timer);
      }, 600);
    },
  };
}

export default connect(() => ({}), {
  postSupplier, updateSupplier, deleteSupplier
})(SupplierForms);
