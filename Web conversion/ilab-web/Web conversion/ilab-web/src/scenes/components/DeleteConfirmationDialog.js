import React, { Component } from 'react';
import { TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';

import { TextInputIcon } from '../../components/TextInput';
import ConfirmationDialog from './ConfirmationDialog';

class DeleteConfirmationDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
    };
  }

  render() {
    return (
      <React.Fragment>
        <TouchableOpacity
          onPress={() => this.setState({ show: true })}
        >
          <TextInputIcon.Clear />
        </TouchableOpacity>

        <ConfirmationDialog
          text={this.props.textConfirmation}
          visible={this.state.show}
          onRequestClose={() => {
            this.setState({ show: false });
          }}
          onAccessButtonPress={() => {
            this.props.onPressConfirm();

            this.setState({ show: false });
          }}
        />
      </React.Fragment>
    );
  }

  static propTypes = {
    textConfirmation: PropTypes.string.isRequired,
    onPressConfirm: PropTypes.func.isRequired,
  };

  static defaultProps = {};
}

export default DeleteConfirmationDialog;
