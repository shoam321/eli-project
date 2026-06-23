import React, { Component } from 'react';
import {
  Linking, RefreshControl, ScrollView, Text, TouchableOpacity, View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import styles, { colors } from '../../config/styles';
import Scene from '../../components/Scene';
import TextInput, { TextInputIcon } from '../../components/TextInput';
import Header, { HeaderIcon } from '../components/Header';
import Button from '../../components/Button';
import { getSupplierParts } from '../../actions/parts';
import { cutString } from '../../utils/strings';
import I18n from '../../lang/i18n';

class SupplierForms extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      parts: [],
    };
  }

  componentWillMount() {
    this.setState({ loading: true });
    this.props.getSupplierParts(this.props.supplier.id)
      .then(response => this.setState({ parts: response.suplier, loading: false }))
      .catch(() => this.setState({ loading: false }));
  }

  handleEditPartPress(part) {
    Actions.partFormsScene({
      part,
      brand: { name: part.br_name },
      supplier: { sup_name: part.sup_name },
      model: { m_name: part.m_name },
      onActionsSuccess: () => {
        this.componentWillMount();
        Actions.pop();
      },
    });
  }

  handleAddPartButtonPress() {
    Actions.partFormsScene({
      supplier: this.props.supplier,
      onActionsSuccess: () => {
        this.componentWillMount();
        Actions.pop();
      },
    });
  }

  handleCreateOrderButtonPress() {
    const parts = this.state.parts.reduce((order, part, id) => {
      if (!part.amount) return order;
      else {
        return [...order, {
          id,
          part,
          sup_id: part.sup_id,
          brand_id: part.pr_brand_id,
          pr_id: part.id,
          md_id: part.md_id,
          amount: part.amount,
          m_name: part.m_name,
        }];
      }
    }, []);

    Actions.orderFormsScene({ supplier: this.props.supplier, order: { parts } });
  }

  handlePartAmountChange(id, amount) {
    if (amount < 0) return;
    const part = { ...this.state.parts[id], amount };
    const parts = [...this.state.parts]; parts[id] = part;
    this.setState({ parts });
  }

  renderSupplierPart(part, id) {
    return (
      <TouchableOpacity
        key={part.id}
        onPress={this.handleEditPartPress.bind(this, part)}
        style={styles.component.listItemButtonInfoContainer}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.component.listItemSubText}>{part.br_name}</Text>
          <Text style={styles.component.listItemMainText}>
            {part.pr_name}
            {' '}
            {part.m_name}
          </Text>
        </View>

        <View style={{ marginRight: 10 }}>
          <Text style={styles.component.listItemSubText}>{I18n.t('translation.price')}</Text>
          <Text style={styles.component.listItemMainText}>
            {part.price}
          </Text>
        </View>

        <View style={{ marginRight: 10 }}>
          <View style={styles.component.partListCountContainer}>
            <TouchableOpacity onPress={() => this.handlePartAmountChange(id, (+part.amount || 0) - 1)}>
              <Icon name="minus-circle" size={25} color={colors.button} />
            </TouchableOpacity>
            <Text style={styles.component.partListCountLabel}>{part.amount || 0}</Text>
            <TouchableOpacity onPress={() => this.handlePartAmountChange(id, (+part.amount || 0) + 1)}>
              <Icon name="plus-circle" size={25} color={colors.button} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <Scene>
        <Header
          text={cutString(this.props.supplier.sup_name, 14)}
          left={HeaderIcon.BACK}
          right={HeaderIcon.EDIT}
          onLeftButtonPress={() => Actions.pop()}
          onRightButtonPress={() => Actions.supplierFormsScene({ supplier: this.props.supplier, delete: true })}
        />

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            <View style={styles.scene.listItemsContainer}>
              <TextInput
                editable={false}
                placeholder={I18n.t('translation.firstName')} hint
                value={this.props.supplier.sup_name}
              />
              <TextInput
                editable={false}
                placeholder={I18n.t('translation.email')} hint
                value={this.props.supplier.sup_email}
                right={<TextInputIcon.Mail />}
                onRightButtonPress={() => Linking.openURL(`mailto:${this.props.supplier.sup_email}`)}
              />
              <TextInput
                editable={false}
                placeholder={I18n.t('translation.phoneNumber')} hint
                value={this.props.supplier.sup_phone}
                right={<TextInputIcon.Phone />}
                onRightButtonPress={() => Linking.openURL(`tel:${this.props.supplier.sup_phone}`)}
              />
              {this.props.supplier.secondary_phone
                && (
                <TextInput
                  editable={false}
                  placeholder={I18n.t('translation.secondaryPhone')} hint
                  value={this.props.supplier.secondary_phone}
                  right={<TextInputIcon.Phone />}
                  onRightButtonPress={() => Linking.openURL(`tel:${this.props.supplier.secondary_phone}`)}
                />
                )
              }
            </View>
          </View>
        </View>

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            <Header
              text={I18n.t('translation.parts')}
              left={HeaderIcon.ADD}
              onLeftButtonPress={this.handleAddPartButtonPress.bind(this)}
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
              {this.state.parts.map(this.renderSupplierPart.bind(this))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            <Button
              onPress={this.handleCreateOrderButtonPress.bind(this)}
              text={I18n.t('translation.createOrder')} style={{ marginVertical: 30 }}
            />
          </View>
        </View>

      </Scene>
    );
  }

  static propTypes = {
    supplier: PropTypes.object,
    getSupplierParts: PropTypes.func.isRequired,
  };

  static defaultProps = {
    supplier: {},
  };
}

export default connect(() => ({}), {
  getSupplierParts,
})(SupplierForms);
