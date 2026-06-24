import React from 'react';
import { Text, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';

import styles, { colors } from '../config/styles';
import ModalDialog from './ModalDialog';
import I18n from '../lang/i18n';

const Preloader = ({ visible }) => (
  <ModalDialog onRequestClose={() => {}} visible={visible}>
    <Text style={styles.component.loaderText}>
      {I18n.t('translation.loading')}
    </Text>
    <ActivityIndicator size="large" color={colors.grayBackground} />
  </ModalDialog>
);

Preloader.propTypes = {
  visible: PropTypes.bool,
};

Preloader.defaultProps = {
  visible: false,
};

export default Preloader;
