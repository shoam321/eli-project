import React, { Component } from 'react';
import { View } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import styles from '../../config/styles';
import Scene from '../../components/Scene';
import TextInput, { TextInputIcon } from '../../components/TextInput';
import Header, { HeaderIcon } from '../components/Header';
import Button from '../../components/Button';
import I18n from '../../lang/i18n';
import { sellItemType } from '../../config/constants';

class PartView extends Component {
  handleAddToCartButtonPress() {
    const { part } = this.props;
    Actions.cartFormsScene({
      supplier: { id: part.sup_id, sup_name: part.sup_name },
      brand: { id: part.pr_brand_id, name: part.br_name },
      model: { id: part.md_id, m_name: part.m_name },
      part,
    });
  }

  handleEditPartPress() {
    const { part } = this.props;
    Actions.partFormsScene({
      supplier: { id: part.sup_id, sup_name: part.sup_name },
      brand: { id: part.pr_brand_id, name: part.br_name },
      model: { id: part.md_id, m_name: part.m_name },
      part,
    });
  }

  sellItem() {
    Actions.cashierFormsScene({
      itemType: sellItemType.PART,
      itemForSell: this.props.part,
      onActionsSuccess: () => {
        Actions.reset('menuScene');
        Actions.partsScene();
      },
    });
  }

  render() {
    return (
      <Scene>
        <Header
          text={this.props.part.pr_name}
          left={HeaderIcon.BACK}
          right={HeaderIcon.EDIT}
          onLeftButtonPress={() => Actions.pop()}
          onRightButtonPress={() => this.handleEditPartPress()}
        />

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            <View style={styles.scene.listItemsContainer}>
              <TextInput
                editable={false}
                left={<TextInputIcon.Triangle />}
                placeholder={I18n.t('translation.supplier')} hint
                value={this.props.part.sup_name}
              />
              <TextInput
                editable={false}
                placeholder={I18n.t('translation.partName')} hint
                value={this.props.part.pr_name}
              />
              <TextInput
                editable={false}
                left={<TextInputIcon.Triangle />}
                placeholder={I18n.t('translation.brand')} hint
                value={this.props.part.br_name}
              />
              <TextInput
                editable={false}
                left={<TextInputIcon.Triangle />}
                placeholder={I18n.t('translation.model')} hint
                value={this.props.part.m_name}
              />
              <TextInput
                editable={false}
                placeholder={I18n.t('translation.color')} hint
                value={this.props.part.color.toString()}
              />
              <TextInput
                editable={false}
                placeholder={I18n.t('translation.serial')} hint
                value={this.props.part.serial}
              />
              <TextInput
                editable={false}
                placeholder={I18n.t('translation.inStock')} hint
                value={this.props.part.in_stock.toString()}
              />
              <TextInput
                editable={false}
                placeholder={I18n.t('translation.price')} hint
                value={this.props.part.price.toString()}
              />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
              <Button
                onPress={this.handleAddToCartButtonPress.bind(this)}
                text={I18n.t('translation.addToCart')} style={{ marginVertical: 30 }}
              />

              {this.props.part.in_stock > 0
              && (
              <Button
                onPress={this.sellItem.bind(this)}
                text={I18n.t('translation.sellToClient')} style={{ marginVertical: 30 }}
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
    part: PropTypes.object.isRequired,
  };

  static defaultProps = {};
}

export default connect(() => ({}), {})(PartView);
