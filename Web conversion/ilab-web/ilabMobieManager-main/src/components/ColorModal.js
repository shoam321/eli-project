import React from 'react';
import { Modal, View } from 'react-native';
import Button from './Button';
import CLOSE from '../content/images/close.png';
import GREY_CLOSE from '../content/images/grey_button.png';

import { component } from '../config/styles';

const ColorModal = (props) => (
  <Modal animationType="none" {...props} transparent>
    <View
      style={[component.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
    >
      <View style={{ flexDirection: 'column' }}>
        {!props.innerCloseButton && (
          <Button
            style={component.closeButton}
            icon={CLOSE}
            iconStyle={{ width: 32, height: 32 }}
            onPress={props.closeModal}
          />
        )}
        <View style={[component.modalWindow, props.styleContainer]}>
          {props.innerCloseButton && (
            <Button
              style={component.innerCloseButton}
              icon={GREY_CLOSE}
              iconStyle={{ width: 36, height: 36 }}
              onPress={props.closeModal}
            />
          )}
          {props.children}
        </View>
      </View>
    </View>
  </Modal>
);

export default ColorModal;
