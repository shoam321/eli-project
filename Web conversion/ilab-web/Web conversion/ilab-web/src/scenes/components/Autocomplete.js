import React, { Component } from 'react';
import {
  Modal, ScrollView, Text, TouchableOpacity, View,
} from 'react-native';
import PropTypes from 'prop-types';

import styles from '../../config/styles';
import TextInput, { TextInputIcon } from '../../components/TextInput';
import Header, { HeaderIcon } from './Header';
import I18n from '../../lang/i18n';

class Autocomplete extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      items: props.items,
      result: props.items,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.items !== state.items) {
      return {
        ...state,
        search: '',
        items: props.items,
        result: props.items,
      };
    }
    return null;
  }

  handleTextInput(text) {
    this.setState({
      search: text,
      result: this.state.items.filter(i => this.props.autocompleteFilter(i, text)),
    });
  }

  handleItemPress(item) {
    this.props.onItemSelected(item);
    this.props.onRequestClose(true);
  }

  handleSubmitButton() {
    if (this.props.enableManualInput) {
      this.props.onItemSelected(this.state.search);
      this.props.onRequestClose(true);
    }
  }

  renderItem(item) {
    return (
      <TouchableOpacity
        key={item.id || item.recordID || item}
        onPress={this.handleItemPress.bind(this, item)}
        style={styles.component.textInputContainer}
      >
        <Text style={styles.component.autocompleteItem}>
          {this.props.getItemText(item)}
        </Text>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <Modal
        visible={this.props.visible}
        animationType="fade" transparent
        onRequestClose={this.props.onRequestClose}
      >
        <View style={styles.component.autocompleteRootContainer}>
          <View style={styles.component.autocompleteContainer}>
            <Header
              text={this.props.title}
              left={this.props.onAddButtonPress && HeaderIcon.ADD}
              onLeftButtonPress={this.props.onAddButtonPress}
              right={HeaderIcon.CLOSE}
              onRightButtonPress={this.props.onRequestClose}
            />

            {this.props.autocompleteFilter
            && (
            <TextInput
              value={this.state.search} autoFocus
              left={<TextInputIcon.Search />}
              placeholder={this.props.placeholder}
              containerStyle={styles.component.autocompleteInput}
              onChangeText={this.handleTextInput.bind(this)}
              onSubmitEditing={this.handleSubmitButton.bind(this)}
            />
            )
            }

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.component.autocompleteItemsContainer}
            >
              {this.state.result.map(item => this.renderItem(item))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

  static propTypes = {
    items: PropTypes.array,
    title: PropTypes.string,
    placeholder: PropTypes.string,
    getItemText: PropTypes.func,
    onItemSelected: PropTypes.func,
    enableManualInput: PropTypes.bool,
    visible: PropTypes.bool.isRequired,
    onAddButtonPress: PropTypes.func,
    onRequestClose: PropTypes.func.isRequired,
    autocompleteFilter: PropTypes.func,
  };

  static defaultProps = {
    items: [],
    title: I18n.t('translation.search'),
    placeholder: I18n.t('translation.search'),
    onItemSelected: () => {},
    enableManualInput: false,
    onAddButtonPress: undefined,
    autocompleteFilter: undefined,
    getItemText: item => (item.name || item.text || item),
  };
}

export default Autocomplete;
