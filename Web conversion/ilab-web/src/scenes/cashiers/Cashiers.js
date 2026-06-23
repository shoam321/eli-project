import React, { Component } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { deviceSearch, partSearch } from '../../actions/cashiers';
import { getParts } from '../../actions/parts';
import { getMyDevices } from '../../actions/devices';
import { deviceType, getDeviceStatus, sellItemType } from '../../config/constants';
import styles from '../../config/styles';
import Scene from '../../components/Scene';
import TextInput, { TextInputIcon } from '../../components/TextInput';
import Header, { HeaderIcon } from '../components/Header';
import Button from '../../components/Button';
import I18n from '../../lang/i18n';

import Autocomplete from '../components/Autocomplete';
import AutocompleteInput from '../components/AutocompleteInput';


class CashiersScene extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      search: '',
      selectFlowModal: false,
      types: [
        {
          name: 'All'
        },
        {
          name: 'Devices'
        },
        {
          id: 1,
          name: 'Parts'
        },
        {
          id: 2,
          name: 'Products'
        }
      ],
      type: {name: 'All'}
    };
  }

  componentWillMount() {
    this.setState({ loading: true });

    Promise.all([
      this.props.getMyDevices(),
      this.props.getParts(),
    ])
      .finally(() => this.setState({ loading: false }));
  }

  onSuccessSell() {
    Actions.pop();

    setTimeout(() => {
      this.setState({ loading: true });

      Promise.all([
        this.props.getMyDevices(),
        this.props.getParts(),
      ])
        .finally(() => this.setState({ loading: false }));
    }, 300);
  }

  renderPartsListItem(part) {
    return (
      <TouchableOpacity
        key={part.id}
        onPress={() => {}}
        style={styles.component.listItemButtonContainer}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.component.listItemSubText}>
            {I18n.t('translation.amountNumber', {
              number: part.in_stock,
            })}
          </Text>
          <Text style={styles.component.listItemMainText}>
            {part.pr_name}
            {' '}
            {part.color}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', marginLeft: 10 }}>
          <Text style={styles.component.listItemSubText}>{part.sup_name}</Text>
          {part.in_stock > 0
            ? (
              <Button
                text={I18n.t('translation.sellToClient')}
                onPress={() => Actions.cashierFormsScene({
                  itemType: sellItemType.PART,
                  itemForSell: part,
                  onActionsSuccess: () => {
                    this.onSuccessSell();
                  },
                })}
                style={[styles.component.textInputButtonContainer, { alignSelf: 'flex-end' }]}
                textStyle={styles.component.textInputButtonText}
              />
            )
            : <Text style={styles.component.listItemMainText}>&nbsp;</Text>
          }
        </View>
      </TouchableOpacity>
    );
  }

  static selectFlow({ id }) {
    if (id === 1) {
      Actions.deviceFormsScene({
        status: deviceType.OWN,
        onActionsSuccess: (device) => {
          Actions.cashierFormsScene({
            itemType: sellItemType.DEVICE,
            itemForSell: device,
            onActionsSuccess: () => {
              Actions.reset('menuScene');
              Actions.cashiersScene();
            },
          });
        },
      });
    } else if (id === 2) {
      Actions.partFormsScene({
        onActionsSuccess: (part) => {
          Actions.cashierFormsScene({
            itemType: sellItemType.PART,
            itemForSell: part,
            onActionsSuccess: () => {
              Actions.reset('menuScene');
              Actions.cashiersScene();
            },
          });
        },
      });
    }
  }

  renderDevicesListItem(device) {
    const status = getDeviceStatus(device.status, device.used_in_project);

    return (
      <TouchableOpacity
        key={device.id}
        onPress={() => {}}
        style={styles.component.listItemButtonContainer}
      >
        <View style={{ alignItems: 'flex-start' }}>
          <Text style={[styles.component.listItemSubText, { color: status.color }]}>
            {I18n.t(status.name)}
          </Text>
          <View style={styles.component.dropDownTextContainer}>
            <Text style={styles.component.listItemMainText}>{device.model_name}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          {!device.used_in_project
          && (
          <Button
            text={I18n.t('translation.sellToClient')}
            onPress={() => Actions.cashierFormsScene({
              itemType: sellItemType.DEVICE,
              itemForSell: device,
              onActionsSuccess: () => {
                this.onSuccessSell();
              },
            })}
            style={[styles.component.textInputButtonContainer, { alignSelf: 'flex-end' }]}
            textStyle={styles.component.textInputButtonText}
          />
          )
          }

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.component.listItemSubText}>{device.brand_name}</Text>
            <Text style={styles.component.listItemText}>{`${device.price}`}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  handleTypeSelect = (type) => {
    this.setState({
      type
    })
  }

  render() {
    return (
      <Scene>
        <Header
          text={I18n.t('translation.cashier')}
          left={HeaderIcon.MENU}
          right={HeaderIcon.ADD}
          onLeftButtonPress={() => Actions.menuScene()}
          onRightButtonPress={() => this.setState({ selectFlowModal: true })}
          additionRight={HeaderIcon.HISTORY}
          onAdditionRightButtonPress={() => Actions.sellHistoriesScene()}
        />

        <Autocomplete
          title={I18n.t('translation.new')}
          visible={this.state.selectFlowModal}
          items={[{
            id: 1,
            title: 'translation.device',
          }, {
            id: 2,
            title: 'translation.part',
          }]}
          getItemText={({ title }) => I18n.t(title)}
          onItemSelected={CashiersScene.selectFlow}
          onRequestClose={() => this.setState({ selectFlowModal: false })}
        />

        

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            <TextInput
              placeholder={I18n.t('translation.serialNumber')}
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
            <AutocompleteInput
                placeholder={I18n.t('translation.filter')}
                item={this.state.type}
                items={this.state.types}
                getItemText={item => item.name}
                onItemSelected={this.handleTypeSelect.bind(this)}
                
              />
              {this.state.type.name === 'Devices' || this.state.type.name === 'All' ? this.props.devices
                .filter(item => deviceSearch(item, this.state.search))
                .filter(item => item.status !== 4)
                .map(device => this.renderDevicesListItem(device)) : null
              }

              {this.state.type.name === 'Parts' || this.state.type.name === 'Products'
                 || this.state.type.name === 'All' ?
               this.props.parts
                .filter(item => partSearch(item, this.state.search))
                .filter(item => !this.state.type.id || this.state.type.id === item.type)
                .map(part => this.renderPartsListItem(part)) : null
              }
            </View>
          </View>
        </ScrollView>
      </Scene>
    );
  }

  static propTypes = {
    devices: PropTypes.array.isRequired,
    parts: PropTypes.array.isRequired,
    getMyDevices: PropTypes.func.isRequired,
    getParts: PropTypes.func.isRequired,
  };
}

export default connect(({ main }) => ({
  devices: main.devices,
  parts: main.parts,
}), {
  getMyDevices,
  getParts,
})(CashiersScene);
