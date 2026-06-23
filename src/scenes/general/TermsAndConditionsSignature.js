import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
//import { SketchCanvas } from '@terrylinla/react-native-sketch-canvas';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import I18n from '../../lang/i18n';
import styles, { colors } from '../../config/styles';
import Scene from '../../components/Scene';
import Header, { HeaderIcon } from '../components/Header';
import Button from '../../components/Button';
import Checkbox from '../../components/Checkbox';
import SignatureCapture from 'react-native-signature-capture';

class TermsAndConditionsSignature extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSignature: false,
      isChecked: false,
      signatureImage: null
    };

    this.inputs = {
      signature: null,
    };
  }

  saveSign() {
    this.refs["sign"].saveImage();
  }

  _onSaveEvent = (result) => {

    let base64 = result.encoded;

    this.props.onActionsSuccess({
      isSignature: true,
      signatureImage: base64,
    });
  }

  resetSign() {
    this.refs["sign"].resetImage();
  }

  onDragEvent = () => {
    this.setState({
      isSignature: !this.state.isSignature && true
    })
  }

  render() {
    console.log(this.state);
    return (
      <Scene>
        <Header
          text={I18n.t('translation.termsAndConditions')}
          left={HeaderIcon.BACK}
          onLeftButtonPress={() => Actions.pop()}
        />

        <ScrollView
          contentContainerStyle={styles.scene.listItemsContainer}
        >
          <View style={styles.scene.responsiveWrapper}>
            <View style={styles.scene.responsive}>
              <View style={{ flex: 1 }}>
                <Text>
                  { this.props.user.company.terms_conditions }
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.scene.responsiveWrapper}>
          <View style={styles.scene.responsive}>
            <View style={{ flexDirection: 'column', height: 260, paddingHorizontal: 30 }}>
              <View style={{ flexDirection: 'row', marginTop: 15, marginBottom: 5 }}>
                <View style={{ paddingRight: 5 }}>
                  <Text style={{ fontSize: 16, color: colors.placeholder, paddingVertical: 3 }}>
                    {I18n.t('translation.signature')}
                  </Text>
                </View>
                <View>
                  <Button
                    text={I18n.t('translation.clear')}
                    style={styles.component.textInputButtonContainer}
                    textStyle={styles.component.textInputButtonText}
                    onPress={() => {
                      this.setState({
                        isSignature: false,
                        signatureImage: null
                      });
                      this.resetSign();
                    }}
                  />
                </View>
              </View>
              <SignatureCapture
                    style={[{flex: 1, borderWidth: 1, borderColor: colors.blackText}]}
                    ref="sign"
                    onSaveEvent={this._onSaveEvent}
                    onDragEvent={this.onDragEvent}
                    saveImageFileInExtStorage={false}
                    showNativeButtons={false}
                    showTitleLabel={false}
                    viewMode={"portrait"}
                    />
              {/*<SketchCanvas
                style={{
                  flex: 1, borderWidth: 1, borderColor: colors.blackText, backgroundColor: '#ffffff',
                }}
                strokeColor="black"
                strokeWidth={2}
                onStrokeStart={() => {
                  this.setState({
                    isSignature: true,
                  });
                }}
                ref={ref => this.inputs.signature = ref}
              />*/}
            </View>

            <View style={{
              flexDirection: 'row', marginTop: 10, paddingHorizontal: 25, alignItems: 'center',
            }}
            >
              <Checkbox
                value={this.state.isChecked}
                onChange={value => this.setState({
                  isChecked: value,
                })}
              />
              <Text>
                { I18n.t('translation.iAgree') }
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
              <Button
                disabled={!this.state.isChecked || !this.state.isSignature}
                onPress={() => {
                    this.saveSign();
                }}
                text={I18n.t('translation.ok')} style={{ marginVertical: 30 }}
              />
            </View>
          </View>
        </View>
      </Scene>
    );
  }

  static propTypes = {
    user: PropTypes.object.isRequired,
    onActionsSuccess: PropTypes.func,
  };

  static defaultProps = {
    onActionsSuccess: (signature) => {
      Actions.pop();

      const timer = setTimeout(() => {
        Actions.refresh(signature);

        clearTimeout(timer);
      }, 600);
    },
  };
}

export default connect(({ user }) => ({
  user: user.profile,
}), {})(TermsAndConditionsSignature);
