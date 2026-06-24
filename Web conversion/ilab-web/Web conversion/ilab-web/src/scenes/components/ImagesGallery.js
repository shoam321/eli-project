import React, { Component } from 'react';
import {
  Modal, SafeAreaView, TouchableOpacity, View,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import ImageViewer from 'react-native-image-zoom-viewer';
import PropTypes from 'prop-types';

import styles, { colors } from '../../config/styles';
import ImagesScroll from './ImagesScroll';

class ImagesGallery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      index: 0,
    };
  }

  render() {
    if (!this.props.images.length) return null;
    return (
      <React.Fragment>
        <Modal
          visible={this.state.visible} transparent
          onRequestClose={() => this.setState({ visible: false })}
        >
          <SafeAreaView
            style={{ flex: 1, backgroundColor: styles.colors.blackBackground }}
          >
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={styles.scene.closeButton}
                onPress={() => this.setState({ visible: false })}
              >
                <MaterialIcon name="close" size={30} color={colors.white} />
              </TouchableOpacity>
              <ImageViewer index={this.state.index} imageUrls={this.props.images} />
            </View>
          </SafeAreaView>
        </Modal>
        <ImagesScroll
          images={this.props.images}
          onDeleteImagePress={this.props.onDeleteImagePress}
          onImagePress={index => this.setState({ visible: true, index })}
        />
      </React.Fragment>
    );
  }
}

ImagesGallery.propTypes = {
  images: PropTypes.array.isRequired,
  onDeleteImagePress: PropTypes.func,
};

ImagesGallery.defaultProps = {
  onDeleteImagePress: undefined,
};

export default ImagesGallery;
