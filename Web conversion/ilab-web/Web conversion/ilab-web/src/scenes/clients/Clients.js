import React, { Component } from 'react';
import {
  Text, ScrollView, TouchableOpacity, RefreshControl, View,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { clientSearch, getClients } from '../../actions/clients';
import styles from '../../config/styles';
import Scene from '../../components/Scene';
import TextInput, { TextInputIcon } from '../../components/TextInput';
import Header, { HeaderIcon } from '../components/Header';
import I18n from '../../lang/i18n';

class ClientsScene extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      search: '',
    };
  }

  componentWillMount() {
    this.setState({ loading: true });
    this.props.getClients()
      .finally(() => this.setState({ loading: false }));
  }

  static renderClientsListItem(client) {
    return (
      <TouchableOpacity
        key={client.id}
        onPress={() => Actions.clientScene({ client })}
        style={styles.component.listItemButtonContainer}
      >
        <Text style={styles.component.listItemMainText}>
          {client.name}
          {' '}
          {client.last_name}
        </Text>
        <Text style={styles.component.listItemText}>{client.phone}</Text>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <Scene>
        <Header
          text={I18n.t('translation.clients')}
          left={HeaderIcon.MENU}
          right={HeaderIcon.ADD}
          additionRight={HeaderIcon.CART}
          onAdditionRightButtonPress={() => Actions.cartScene()}
          onLeftButtonPress={() => Actions.menuScene()}
          onRightButtonPress={() => Actions.clientFormsScene({ isNew: true })}
        />

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            <TextInput
              placeholder={I18n.t('translation.namePhone')}
              onChangeText={search => this.setState({ search })}
              left={<TextInputIcon.Search />}
              containerStyle={styles.scene.searchInputContainer}
            />
          </View>
        </View>

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
              {this.props.clients
                .filter(item => clientSearch(item, this.state.search))
                .map(client => ClientsScene.renderClientsListItem(client))
              }
            </View>
          </View>
        </ScrollView>
      </Scene>
    );
  }

  static propTypes = {
    clients: PropTypes.array.isRequired,
    getClients: PropTypes.func.isRequired,
  }
}

export default connect(({ main }) => ({
  clients: main.clients,
}), {
  getClients,
})(ClientsScene);
