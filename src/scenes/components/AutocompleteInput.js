import React, { Component } from 'react';
import { TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';

import TextInput, { TextInputIcon } from '../../components/TextInput';
import Autocomplete from './Autocomplete';
import I18n from '../../lang/i18n';

class AutocompleteInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
    };
  }

  render() {
    return (
      <React.Fragment>
        <Autocomplete
          title={this.props.placeholder}
          placeholder={this.props.searchPlaceholder}
          visible={this.state.modalVisible}
          items={this.props.items}
          autocompleteFilter={this.props.autocompleteFilter}
          enableManualInput={this.props.enableManualInput}
          getItemText={this.props.getItemText}
          onItemSelected={this.props.onItemSelected}
          onRequestClose={() => this.setState({ modalVisible: false })}
          onAddButtonPress={this.props.onAddButtonPress && (() => {
            this.props.onAddButtonPress();
            this.setState({ modalVisible: false });
          })}
        />
        <TouchableOpacity
          disabled={this.props.disabled}
          onPress={() => this.setState({ modalVisible: true })}
        >
          <TextInput
            editable={false} hint
            placeholder={this.props.placeholder}
            left={<TextInputIcon.Triangle />}
            right={this.props.clearable && <TextInputIcon.Clear />}
            onRightButtonPress={() => this.props.onItemSelected({})}
            value={this.props.getItemText(this.props.item)}
            requiredMark={this.props.requiredMark}
          />
        </TouchableOpacity>
      </React.Fragment>
    );
  }

  static propTypes = {
    item: PropTypes.any,
    disabled: PropTypes.bool,
    clearable: PropTypes.bool,
    enableManualInput: PropTypes.bool,
    placeholder: PropTypes.string,
    searchPlaceholder: PropTypes.string,
    items: PropTypes.array.isRequired,
    getItemText: Autocomplete.propTypes.getItemText,
    onItemSelected: PropTypes.func.isRequired,
    onAddButtonPress: PropTypes.func,
    autocompleteFilter: PropTypes.func,
    requiredMark: PropTypes.bool,
  };

  static defaultProps = {
    item: '',
    disabled: false,
    clearable: false,
    requiredMark: false,
    enableManualInput: false,
    placeholder: I18n.t('translation.searchDots'),
    searchPlaceholder: I18n.t('translation.searchDots'),
    onAddButtonPress: undefined,
    autocompleteFilter: undefined,
    getItemText: Autocomplete.defaultProps.getItemText,
  };
}

export default AutocompleteInput;
