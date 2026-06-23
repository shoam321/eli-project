import React, { Component } from 'react';
import {
  Image, ScrollView, CameraRoll, TouchableOpacity, View, StatusBar,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { Actions } from 'react-native-router-flux';
import PropTypes from 'prop-types';

// eslint-disable-next-line import/no-unresolved,import/extensions
import { requestImagePickerPermissions } from '../../config/permission';
import styles, { colors } from '../../config/styles';

class ImagesPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      images: [],
      active: props.active,
      permission: false,
    };
  }

  componentWillMount() {
    requestImagePickerPermissions()
      .then(() => {
        this.setState({ permission: true });
        return CameraRoll.getPhotos({ first: 20 });
      })
      .then(result => this.mapGalleryImages(result.edges))
      .catch(() => {});
  }

  mapGalleryImages(edges) {
    this.setState({ images: edges.map(edge => edge.node.image) });
  }

  handleImagePress(image) {
    let images = [...this.state.active];
    const index = images.findIndex(i => i.uri === image.uri);
    if (index >= 0) images.splice(index, 1);
    else images = [...images, image];
    this.setState({ active: images });
  }

  handleTakeButtonPress() {
    this.camera.takePictureAsync()
      .then(photo => this.setState({
        photos: [photo, ...this.state.photos],
        active: [photo, ...this.state.active],
      }))
      .catch(() => {});
  }

  renderImage(image) {
    return (
      <TouchableOpacity key={image.uri} onPress={this.handleImagePress.bind(this, image)}>
        <View style={styles.component.imageCheckIndicator}>
          {(this.state.active.findIndex(i => i.uri === image.uri) >= 0)
          && <MaterialIcon name="done" size={22} color={colors.white} />
          }
        </View>
        <Image source={image} style={styles.component.galleryImage} />
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <View style={styles.component.cameraContainer}>
        <StatusBar hidden animated />
        {this.state.permission
          ? (
            <RNCamera ref={camera => this.camera = camera} style={styles.component.camera}>
              <View style={styles.component.cameraButtonsBar}>
                <TouchableOpacity
                  style={styles.component.cameraSmallButton}
                  onPress={() => Actions.pop()}
                >
                  <MaterialIcon name="close" size={25} color={colors.button} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.component.cameraButton}
                  onPress={this.handleTakeButtonPress.bind(this)}
                >
                  <MaterialIcon name="photo-camera" size={30} color={colors.button} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.component.cameraSmallButton}
                  onPress={() => {
                    this.props.onActionSuccess(this.state.active);
                    Actions.pop();
                  }}
                >
                  <MaterialIcon name="done" size={25} color={colors.button} />
                </TouchableOpacity>
              </View>
            </RNCamera>
          )
          : <View style={{ flex: 1 }} />
        }
        <View style={styles.component.galleryView}>
          <ScrollView horizontal contentContainerStyle={styles.component.galleryContainer}>
            {[...this.state.photos, ...this.state.images].map(this.renderImage.bind(this))}
          </ScrollView>
        </View>
      </View>
    );
  }

  static propTypes = {
    active: PropTypes.array,
    onActionSuccess: PropTypes.func,
  };

  static defaultProps = {
    active: [],
    onActionSuccess: () => Actions.pop(),
  };
}

export default ImagesPicker;
