import React from 'react';
import { Text, View } from 'react-native';
import PropTypes from 'prop-types';

import styles from '../../config/styles';
import Button from '../../components/Button';
import ModalDialog from '../../components/ModalDialog';
import I18n from '../../lang/i18n';

const ConfirmationDialog = props => (
  <ModalDialog
    visible={props.visible}
    onRequestClose={props.onRequestClose}
  >
    <Text style={styles.component.modalDialogText}>{props.text}</Text>
    <View style={styles.component.modalDialogButtonsBar}>
      <Button
        onPress={props.onRequestClose} text={I18n.t('translation.no')}
        style={styles.component.buttonGray}
      />
      <Button
        text={I18n.t('translation.yes')}
        onPress={() => {
          props.onAccessButtonPress();
          props.onRequestClose();
        }}
      />
    </View>
  </ModalDialog>
);

ConfirmationDialog.propTypes = {
  text: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  onAccessButtonPress: PropTypes.func.isRequired,
};

export default ConfirmationDialog;
