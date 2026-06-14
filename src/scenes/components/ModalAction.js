import React, { Component } from 'react';
import { Modal, View, Text } from 'react-native';
import PropTypes from 'prop-types';

import styles from '../../config/styles';
import Header, { HeaderIcon } from './Header';
import Button from '../../components/Button';
import I18n from '../../lang/i18n';

class ModalAction extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Modal
        visible={this.props.visible}
        animationType="fade" transparent
        onRequestClose={this.props.onRequestClose}
      >
        <View style={styles.component.autocompleteRootContainer}>
          <View style={styles.scene.responsiveWrapper}>
            <View style={styles.scene.responsive}>
              <View style={styles.component.inputDialogContainer}>
                <Header
                  right={HeaderIcon.CLOSE}
                  onRightButtonPress={this.props.onRequestClose}
                />

                <View style={{ paddingHorizontal: 25, marginBottom: 15 }}>
                  <Text style={{ fontSize: 16 }}>{this.props.title}</Text>
                </View>

                <View style={[styles.component.modalDialogButtonsBar, { paddingHorizontal: 25 }]}>
                  <Button
                    text={this.props.leftButtonText}
                    onPress={() => {
                      this.props.onLeftHandler();
                      this.props.onRequestClose();
                    }}
                  />
                  <Button
                    text={this.props.rightButtonText}
                    onPress={() => {
                      this.props.onRightHandler();
                      this.props.onRequestClose();
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  static propTypes = {
    title: PropTypes.string,
    visible: PropTypes.bool.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    onLeftHandler: PropTypes.func.isRequired,
    onRightHandler: PropTypes.func.isRequired,
    leftButtonText: PropTypes.string.isRequired,
    rightButtonText: PropTypes.string.isRequired,
  };

  static defaultProps = {
    title: I18n.t('translation.inputValue'),
  };
}

export default ModalAction;
