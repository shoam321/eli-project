import React from 'react';
import { Modal, View } from 'react-native';

import styles from '../config/styles';

const ModalDialog = (props) => (
  <Modal transparent {...props}>
    <View style={styles.common.modalContainer}>
      <View style={styles.component.modalDialogContainer}>
        {props.children}
      </View>
    </View>
  </Modal>
);

ModalDialog.propTypes = Modal.propTypes;

export default ModalDialog;
