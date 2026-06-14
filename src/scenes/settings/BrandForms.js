import React, { Component } from 'react';
import { View, ScrollView } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { updateBrand } from '../../actions/brands';
import styles from '../../config/styles';
import Scene from '../../components/Scene';
import Header, { HeaderIcon } from '../components/Header';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import { Alert } from '../../components/Notification';
import I18n from '../../lang/i18n';
import Validator, { formsValidation } from '../../actions/validators';

class BrandForms extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      brand: {
        id: props.brand.id,
        name: props.brand.name,
      },
    };
  }

  handleSaveButtonPress() {
    const errors = Validator.getFormErrors(this.state.brand, formsValidation.BRAND);
    if (errors.length > 0) return Alert.showMessage(I18n.t('translation.error'), errors.join('\n'));

    this.setState({ loading: true });
    this.props.updateBrand(this.state.brand)
      .then(() => {
        this.setState({ loading: false }, () => {
          this.props.onActionsSuccess();
        });
      })
      .catch(() => this.setState({ loading: false }));
  }

  handleTextInput(key, value) {
    this.setState({
      brand: {
        ...this.state.brand,
        [key]: value,
      },
    });
  }

  render() {
    return (
      <Scene loading={this.state.loading}>
        <Header
          text={I18n.t('translation.editBrand')} left={HeaderIcon.BACK}
          onLeftButtonPress={() => Actions.pop()}
        />

        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.scene.responsiveWrapper}>
            <View style={styles.scene.responsive}>
              <View style={styles.scene.listItemsContainer}>
                <TextInput
                  placeholder={I18n.t('translation.name')} hint
                  value={this.state.brand.name}
                  onChangeText={this.handleTextInput.bind(this, 'name')}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            <Button
              onPress={this.handleSaveButtonPress.bind(this)}
              text={I18n.t('translation.save')} style={styles.scene.buttonSize}
            />
          </View>
        </View>
      </Scene>
    );
  }

  static propTypes = {
    brand: PropTypes.object.isRequired,
    updateBrand: PropTypes.func.isRequired,
    onActionsSuccess: PropTypes.func,
  };

  static defaultProps = {
    onActionsSuccess: () => {
      Actions.pop();
    },
  };
}

export default connect(() => ({}), { updateBrand })(BrandForms);
