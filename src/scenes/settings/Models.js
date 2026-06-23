import React, { Component } from 'react';
import {
  Text, View, Switch, ScrollView, RefreshControl,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import styles, { colors } from '../../config/styles';
import Scene from '../../components/Scene';
import Header, { HeaderIcon } from '../components/Header';
import { getModels, postModel, setModelStatus } from '../../actions/models';
import TextInput from '../../components/TextInput';
import AutocompleteInput from '../components/AutocompleteInput';
import { brandSearch } from '../../actions/brands';
import Button from '../../components/Button';
import I18n from '../../lang/i18n';

class Models extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      expander: !!props.brand.id,
      brand: props.brand,
      model: {
        br_id: props.brand && props.brand.id ? props.brand.id : undefined,
        m_name: '',
      },
    };
  }

  componentWillMount() {
    this.setState({ loading: true });
    this.props.getModels()
      .finally(() => this.setState({ loading: false }));
  }

  componentWillUnmount() {
    this.props.backHandler();
  }

  handleTextInput(key, value) {
    this.setState({
      model: {
        ...this.state.model,
        [key]: value,
      },
    });
  }

  handleBrandSelect(brand) {
    this.setState({
      brand,
      model: {
        ...this.state.model,
        br_id: brand.id,
      },
    });
  }

  handleAddButtonPress() {
    this.setState({ loading: true });
    this.props.postModel(this.state.model)
      .then(() => this.setState({ model: { br_id: this.state.brand.id }, loading: false }))
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  handleModelStatusChange(id) {
    const model = { ...this.props.models[id] };
    model.status = !model.status;
    this.setState({ loading: true });
    this.props.setModelStatus(model.id, model.status)
      .finally(() => this.setState({ loading: false }));
  }

  renderModelButton(model, id) {
    return (
      <View key={model.id} style={[styles.component.listItemButtonContainer, { height: 40 }]}>
        <Text style={styles.component.listItemMainText}>{model.m_name}</Text>
        <Text style={styles.component.listItemMainText}>{model.brand ? model.brand.name : ''}</Text>
        <Switch
          style={styles.component.switchButton}
          onValueChange={() => this.handleModelStatusChange(id)}
          value={!!model.status} tintColor={colors.darkGray}
          thumbTintColor={colors.white} onTintColor={colors.button}
        />
      </View>
    );
  }

  render() {
    return (
      <Scene>
        <Header
          text={I18n.t('translation.models')} left={HeaderIcon.BACK}
          onLeftButtonPress={() => Actions.pop()}
          right={this.state.expander ? HeaderIcon.CLOSE : HeaderIcon.ADD}
          onRightButtonPress={() => this.setState({ expander: !this.state.expander })}
        />

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            {this.state.expander
            && (
            <View style={styles.scene.listItemsContainer}>
              <AutocompleteInput
                requiredMark
                placeholder={I18n.t('translation.brand')}
                searchPlaceholder={I18n.t('translation.name')}
                item={this.state.brand}
                items={this.props.brands}
                autocompleteFilter={brandSearch}
                getItemText={item => item.name}
                onItemSelected={this.handleBrandSelect.bind(this)}
              />
              <TextInput
                requiredMark
                placeholder={I18n.t('translation.name')} hint value={this.state.model.m_name}
                onChangeText={this.handleTextInput.bind(this, 'm_name')}
              />
              <Button
                onPress={this.handleAddButtonPress.bind(this)}
                text={I18n.t('translation.addModel')} style={{ marginTop: 30 }}
              />
            </View>
            )
            }
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
              {this.props.models.map(this.renderModelButton.bind(this))}
            </View>
          </View>
        </ScrollView>
      </Scene>
    );
  }

  static propTypes = {
    brand: PropTypes.object,
    models: PropTypes.array.isRequired,
    brands: PropTypes.array.isRequired,
    getModels: PropTypes.func.isRequired,
    postModel: PropTypes.func.isRequired,
    setModelStatus: PropTypes.func.isRequired,
    backHandler: PropTypes.func,
  };

  static defaultProps = {
    brand: {},
    backHandler: () => {},
  };
}

export default connect(({ main }) => ({
  models: main.models.map(model => ({
    ...model,
    brand: main.brands.find(brand => model.brand_id === brand.id),
  })),
  brands: main.brands.filter(b => b.status),
}), {
  getModels, postModel, setModelStatus,
})(Models);
