import React, { Component } from 'react';
import { ScrollView, View } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Contacts from 'react-native-contacts';

// eslint-disable-next-line import/extensions,import/no-unresolved
import { requestContactsPermissions } from '../../config/permission';
import { postClient, updateClient, deleteClient} from '../../actions/clients';
import styles from '../../config/styles';
import Scene from '../../components/Scene';
import TextInput from '../../components/TextInput';
import Header, { HeaderIcon } from '../components/Header';
import { Alert } from '../../components/Notification';
import Button from '../../components/Button';
import Validator, { formsValidation } from '../../actions/validators';
import { contactSearch, getContactName, getClientFromContact } from '../../actions/contacts';
import Autocomplete from '../components/Autocomplete';
import I18n from '../../lang/i18n';

class ClientForms extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      isNew: props.isNew,
      contacts: [],
      contactsModal: false,
      client: {
        name: '',
        last_name: '',
        email: '',
        phone: '',
        secondary_phone: '',
        ...props.client,
      },
    };
    this.inputs = {
      name: React.createRef(),
      last_name: React.createRef(),
      email: React.createRef(),
      phone: React.createRef(),
      secondary_phone: React.createRef(),
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      isNew: false,
      client: {
        name: '',
        last_name: '',
        email: '',
        phone: '',
        secondary_phone: '',
        ...props.client,
      },
    });
  }

  handleTextInput(key, value) {
    this.setState({
      client: {
        ...this.state.client,
        [key]: value,
      },
    });
  }

  handleContactPress(contact) {
    const client = {
      ...this.state.client,
      ...getClientFromContact(contact),
    };

    this.setState({ client });
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
    const errors = Validator.getFormErrors(this.state.client, this.props.maxRequired ? formsValidation.CLIENT : formsValidation.CLIENT_MIN);
    if (errors.length > 0) return Alert.showMessage(I18n.t('translation.error'), errors.join('\n'));

    this.setState({ loading: true });

    const request = this.state.client.id
      ? this.props.updateClient
      : this.props.postClient;

    request(this.state.client)
      .then((response) => {
        if (this.state.isNew) {
          /**
           *  Workaround for router replace.
           *  https://github.com/aksonov/react-native-router-flux/issues/2804
           */
          Actions.pop();

          const timer = setTimeout(() => {
            Actions.clientScene({ client: response.user || response.client });

            clearTimeout(timer);
          }, 100);
        } else {
          this.props.onActionsSuccess(response.user || response.client);
        }
      })
      .catch((e) => {
        const error = () => Alert.showMessage(I18n.t('translation.error'), e.message || I18n.t('translation.checkFormData'));
        this.setState({ loading: false }, error);
      });
  }

  handleDeleteButtonPress() {
        this.props.deleteClient(this.props.client.id)
        .then(res => {Actions.clientsScene()})
        .catch(res => {console.log(res)})
      }

  render() {
    return (
      <Scene loading={this.state.loading}>
        <Header
          text={this.state.client.id ? I18n.t('translation.editClient') : I18n.t('translation.addClient')}
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
                ref={this.inputs.name}
                placeholder={I18n.t('translation.firstName')} hint
                value={this.state.client.name}
                onChangeText={this.handleTextInput.bind(this, 'name')}
                onSubmitEditing={() => this.inputs.last_name.current.focus()}
              />
              <TextInput
                requiredMark
                ref={this.inputs.last_name}
                placeholder={I18n.t('translation.lastName')} hint
                value={this.state.client.last_name}
                onChangeText={this.handleTextInput.bind(this, 'last_name')}
                onSubmitEditing={() => this.inputs.email.current.focus()}
              />
              <TextInput
                ref={this.inputs.email}
                placeholder={I18n.t('translation.email')} hint
                value={this.state.client.email}
                onChangeText={this.handleTextInput.bind(this, 'email')}
                onSubmitEditing={() => this.inputs.phone.current.focus()}
                keyboardType="email-address"
              />
              <TextInput
                requiredMark={this.props.maxRequired}
                ref={this.inputs.phone}
                placeholder={I18n.t('translation.phoneNumber')} hint
                value={this.state.client.phone}
                onChangeText={this.handleTextInput.bind(this, 'phone')}
                keyboardType="phone-pad"
              />
              <TextInput
                ref={this.inputs.secondary_phone}
                placeholder={I18n.t('translation.secondaryPhone')} hint
                value={this.state.client.secondary_phone}
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
    isNew: PropTypes.bool,
    maxRequired: PropTypes.bool,
    client: PropTypes.object,
    postClient: PropTypes.func.isRequired,
    updateClient: PropTypes.func.isRequired,
    onActionsSuccess: PropTypes.func,
  };

  static defaultProps = {
    client: {},
    isNew: false,
    maxRequired: true,
    onActionsSuccess: (client) => {
      Actions.pop();

      const timer = setTimeout(() => {
        Actions.refresh({ client });

        clearTimeout(timer);
      }, 600);
    },
  };
}

export default connect(() => ({}), {
  postClient, updateClient, deleteClient
})(ClientForms);
