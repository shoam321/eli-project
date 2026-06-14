import React, { Component } from 'react';
import { TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import TextInput, { TextInputIcon } from '../../components/TextInput';
import Autocomplete from './Autocomplete';
import I18n from '../../lang/i18n';
import { appLanguages } from '../../config/constants';
import { getAppLanguage, setAppLanguage } from '../../actions/user';

class LanguageSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      appLanguage: {},
    };
  }

  static getItemText(item) {
    return I18n.t(`translation.${item.code}`);
  }

  onSelect(data) {
    I18n.setLocale(data.code);

    this.setState({
      appLanguage: data,
    });

    this.props.setAppLanguage(data);
    this.props.onSelect(data);
  }

  componentDidMount() {
    this.props.getAppLanguage().then((data) => {
      this.setState({
        appLanguage: data,
      });
    });
  }

  render() {
    return (
      <React.Fragment>
        <Autocomplete
          title={I18n.t('translation.language')}
          visible={this.state.modalVisible}
          items={appLanguages}
          getItemText={LanguageSelect.getItemText}
          onItemSelected={this.onSelect.bind(this)}
          onRequestClose={() => this.setState({ modalVisible: false })}
        />
        <TouchableOpacity
          disabled={this.props.disabled}
          onPress={() => this.setState({ modalVisible: true })}
        >
          <TextInput
            editable={false} hint
            placeholder={I18n.t('translation.language')}
            left={<TextInputIcon.Triangle />}
            value={LanguageSelect.getItemText(this.state.appLanguage)}
          />
        </TouchableOpacity>
      </React.Fragment>
    );
  }

  static propTypes = {
    onSelect: PropTypes.func,
    disabled: PropTypes.bool,
    getAppLanguage: PropTypes.func.isRequired,
    setAppLanguage: PropTypes.func.isRequired,
  };

  static defaultProps = {
    onSelect: () => {},
    disabled: false,
  };
}

export default connect(() => ({}), {
  getAppLanguage, setAppLanguage,
})(LanguageSelect);
