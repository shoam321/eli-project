import React, { Component } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
  sellHistorySearch,
  getSellHistoryItems,
} from '../../actions/sellHistories';

import { getClient } from '../../actions/clients';

import styles from '../../config/styles';
import Scene from '../../components/Scene';
import TextInput, { TextInputIcon } from '../../components/TextInput';
import Header, { HeaderIcon } from '../components/Header';
import I18n from '../../lang/i18n';
import { cashierItemTypes, sellItemType } from '../../config/constants';

class SellHistoryScene extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      activity: false,
      expanded: -1,
      search: '',
      client: null,
    };
  }

  componentWillMount() {
    this.setState({ loading: true }, () => this.props.getSellHistoryItems()
      .then(() => this.setState({
        loading: false,
      }))
      .catch(() => this.setState({ loading: false })));
  }

  sellHistoryFilter(item) {
    return sellHistorySearch(item, this.state.search);
  }

  handleSellHistoryPress(sellHistory) {
    this.setState({
      expanded: this.state.expanded === sellHistory.id ? false : sellHistory.id,
      client: null,
    }, async () => {
      const { client } = await this.props.getClient(sellHistory.json.data.item.user_id);

      this.setState({
        client,
      });
    });
  }

  renderSellHistoryListItem(sellHistory) {
    const { client } = this.state;

    return (
      <React.Fragment key={sellHistory.id}>
        <View
          style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
        >
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={this.handleSellHistoryPress.bind(this, sellHistory)}
              style={[styles.component.listItemButtonInfoContainer, { alignItems: 'center' }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.component.listItemMainText}>
                  {sellHistory.json.data.item_type === sellItemType.PART
                    ? sellHistory.json.data.item_for_sell.pr_name
                    : I18n.t('translation.device')}
                </Text>
              </View>
              <View style={{ marginRight: 10, alignItems: 'flex-end' }}>
                <Text style={styles.component.listItemMainText}>
                  {sellHistory.json.data.item_for_sell.br_name}
                  {sellHistory.json.data.item_for_sell.brand_name}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.component.listItemMainText}>
                  {sellHistory.json.data.item_for_sell.m_name}
                  {sellHistory.json.data.item_for_sell.model_name}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {this.state.expanded === sellHistory.id
        && (
        <View style={{ padding: 10, marginLeft: 50 }}>
          {!!sellHistory && !!sellHistory.json && !!sellHistory.json.data && !!sellHistory.json.data.item && (
            <View style={styles.scene.listItemSpaceBetween}>
              <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.cost')}</Text>
              <Text style={styles.component.listItemDarkSubText}>{sellHistory.json.data.item.actual_sell_price}</Text>
            </View>
          )}
          {!!sellHistory && !!sellHistory.json && !!sellHistory.json.data && !!sellHistory.json.data.item && (
            <View style={styles.scene.listItemSpaceBetween}>
              <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.warrantyExpirationDate')}</Text>
              <Text style={styles.component.listItemDarkSubText}>{sellHistory.json.data.item.warranty_expiration_date.split(' ')[0]}</Text>
            </View>
          )}
          {!!sellHistory && !!sellHistory.json && !!sellHistory.json.data && !!sellHistory.json.data.item && (
            <View style={styles.scene.listItemSpaceBetween}>
              <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.status')}</Text>
              <Text style={styles.component.listItemDarkSubText}>
                {I18n.t(cashierItemTypes.find(item => item.id === sellHistory.json.data.item.life_status).name)}
              </Text>
            </View>
          )}
          {!!sellHistory && !!sellHistory.json && !!sellHistory.json.data && !!sellHistory.json.data.item && (
            <View style={styles.scene.listItemSpaceBetween}>
              <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.amount')}</Text>
              <Text style={styles.component.listItemDarkSubText}>{sellHistory.json.data.item.amount}</Text>
            </View>
          )}
          {!!sellHistory && !!sellHistory.user && (
            <View style={styles.scene.listItemSpaceBetween}>
              <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.manager')}</Text>
              <Text style={styles.component.listItemDarkSubText}>
                {`${sellHistory.user.name || ''} ${sellHistory.user.last_name || ''}`}
              </Text>
            </View>
          )}
          {!!client && (
            <View style={styles.scene.listItemSpaceBetween}>
              <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.client')}</Text>
              <Text style={styles.component.listItemDarkSubText}>
                {`${client.name || ''} ${client.last_name || ''}`}
              </Text>
            </View>
          )}
          <View style={styles.scene.listItemSpaceBetween}>
            <Text style={styles.component.listItemDarkSubText}>{I18n.t('translation.date')}</Text>
            <Text style={styles.component.listItemDarkSubText}>{sellHistory.date_add}</Text>
          </View>
        </View>
        )
        }
      </React.Fragment>
    );
  }

  render() {
    return (
      <Scene loading={this.state.activity}>
        <Header
          text={I18n.t('translation.salesReport')}
          left={HeaderIcon.MENU}
          onLeftButtonPress={() => Actions.pop()}
        />

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            <View
              style={{ width: '100%' }}
            >
              <TextInput
                placeholder={I18n.t('translation.partBrand')}
                onChangeText={search => this.setState({ search })}
                left={<TextInputIcon.Search />}
                containerStyle={styles.scene.searchInputContainer}
              />
            </View>
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
              {this.props.sellHistories
                .filter(item => this.sellHistoryFilter(item))
                .map(part => this.renderSellHistoryListItem(part))
              }
            </View>
          </View>
        </ScrollView>
      </Scene>
    );
  }

  static propTypes = {
    sellHistories: PropTypes.array.isRequired,
    getSellHistoryItems: PropTypes.func.isRequired,
    getClient: PropTypes.func.isRequired,
  }
}

export default connect(({ main }) => ({
  sellHistories: main.sellHistories,
}), {
  getSellHistoryItems,
  getClient,
})(SellHistoryScene);
