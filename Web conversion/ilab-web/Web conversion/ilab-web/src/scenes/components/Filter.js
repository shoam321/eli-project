import React, { Component } from 'react';
import { Modal, View } from 'react-native';
import PropTypes from 'prop-types';

import styles from '../../config/styles';
import Header, { HeaderIcon } from './Header';
import Button from '../../components/Button';
import I18n from '../../lang/i18n';

class Filter extends Component {
  handleResetFilter() {
    this.props.onResetFilter();
    // this.props.onRequestClose();
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
              <View style={styles.component.filterContainer}>
                <Header
                  text={this.props.title}
                  right={HeaderIcon.CLOSE}
                  onRightButtonPress={this.props.onRequestClose}
                />
                <View style={styles.component.filterBodyContainer}>
                  {this.props.children}
                  <View style={styles.component.modalDialogButtonsBar}>
                    <Button
                      text={I18n.t('translation.reset')} style={styles.component.buttonGray}
                      onPress={this.handleResetFilter.bind(this)}
                    />
                    <Button text={I18n.t('translation.submit')} onPress={this.props.onRequestClose} />
                  </View>
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
    children: PropTypes.node,
    onResetFilter: PropTypes.func,
    visible: PropTypes.bool.isRequired,
    onRequestClose: PropTypes.func.isRequired,
  };

  static defaultProps = {
    title: '',
    children: null,
    onResetFilter: () => {},
  };
}

export default Filter;
