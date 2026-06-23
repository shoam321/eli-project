import React from 'react';
import {
  ScrollView, View, TouchableOpacity, Image,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import PropTypes from 'prop-types';

import styles, { colors } from '../../config/styles';

const ImagesScroll = props => (
  <View style={styles.component.gallerySmallView}>
    <ScrollView horizontal contentContainerStyle={styles.component.galleryContainer}>
      {props.images.map(({ id, uri, photo }, index) => (
        <TouchableOpacity key={uri || photo} onPress={props.onImagePress.bind(null, index)}>
          <Image source={{ uri: (uri || photo) }} style={styles.component.gallerySmallImage} />
          {props.onDeleteImagePress
          && (
          <TouchableOpacity
            onPress={() => props.onDeleteImagePress({ id, uri })}
            style={styles.component.imageCheckIndicator}
          >
            <MaterialIcon name="close" size={22} color={colors.white} />
          </TouchableOpacity>
          )
          }
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

ImagesScroll.propTypes = {
  images: PropTypes.array.isRequired,
  onImagePress: PropTypes.func,
  onDeleteImagePress: PropTypes.func,
};

ImagesScroll.defaultProps = {
  onImagePress: undefined,
  onDeleteImagePress: undefined,
};

export default ImagesScroll;
