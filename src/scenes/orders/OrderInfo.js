import React, { Component } from 'react';
import { ScrollView, View } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { updateOrderPart } from '../../actions/orders';
import { getArrayItemByKey } from '../../actions/common';
import { orderStatus, orderStatusItems } from '../../config/constants';
import styles from '../../config/styles';
import Scene from '../../components/Scene';
import TextInput from '../../components/TextInput';
import IntegerInput from '../../components/IntegerInput';
import Header, { HeaderIcon } from '../components/Header';
import I18n from '../../lang/i18n';

class OrderInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...props.part,
      amount: props.part.amount,
      statusItem: getArrayItemByKey(
        orderStatusItems,
        props.part.status,
      ),
    };
  }

  componentWillUnmount() {
    if (this.state.amount !== this.props.part.amount) this.props.onActionSuccess(this.state);
  }

  handleAmountChange(amount) {
    const prevAmount = this.state.amount;
    this.setState({ amount });
    this.props.updateOrderPart(this.props.part.id, amount)
      .catch(() => {
        if (this.state.amount === amount) this.setState({ amount: prevAmount });
      });
  }

  render() {
    return (
      <Scene>
        <Header
          text={I18n.t('translation.orderPartInfo')}
          left={HeaderIcon.BACK}
          onLeftButtonPress={() => Actions.pop()}
        />

        <ScrollView>
          <View style={styles.scene.listItemsContainer}>
            <TextInput
              editable={false}
              placeholder={I18n.t('translation.partName')} hint
              value={this.props.part.pr_name}
            />
            <TextInput
              editable={false}
              placeholder={I18n.t('translation.partBrandName')} hint
              value={this.props.part.br_name}
            />
            <TextInput
              editable={false}
              placeholder={I18n.t('translation.model')} hint
              value={this.props.part.model}
            />
            <TextInput
              editable={false}
              placeholder={I18n.t('translation.supplier')} hint
              value={this.props.part.sup_name}
            />
            <TextInput
              editable={false}
              placeholder={I18n.t('translation.serial')} hint
              value={this.props.part.serial}
            />
            <IntegerInput
              editable={this.state.status === orderStatus.EXPECTED}
              onChangeValue={this.handleAmountChange.bind(this)}
              value={this.state.amount.toString()} min={0}
              placeholder={I18n.t('translation.amount')} hint
            />
            <TextInput
              editable={false}
              placeholder={I18n.t('translation.orderNumber')} hint
              value={this.props.part.ord_id}
            />
            <TextInput
              editable={false}
              placeholder={I18n.t('translation.status')} hint
              value={I18n.t(this.state.statusItem.name)}
            />
            <TextInput
              editable={false}
              placeholder={I18n.t('translation.color')} hint
              value={this.props.part.color}
            />
            <TextInput
              editable={false}
              placeholder={I18n.t('translation.date')} hint
              value={this.props.part.date_add}
            />
          </View>
        </ScrollView>
      </Scene>
    );
  }

  static propTypes = {
    part: PropTypes.object.isRequired,
    updateOrderPart: PropTypes.func.isRequired,
    onActionSuccess: PropTypes.func,
  };

  static defaultProps = {
    onActionSuccess: () => {},
  };
}

export default connect(() => ({}), { updateOrderPart })(OrderInfo);
