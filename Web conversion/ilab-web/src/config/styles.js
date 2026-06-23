import { StyleSheet, Platform } from 'react-native';

const barHeight = 0;

export const colors = {
  button: '#00B5B8',
  white: '#ffffff',
  placeholder: '#7F7F7F',
  textInput: '#B1B1B1',
  darkGray: '#888888',
  lightGray: '#DDDDDD',
  blackBackground: '#5D5D5D',
  lightBackground: '#E8E8E8',
  grayBackground: '#C8C8C8',
  lightBlackText: '#393939',
  blackText: '#000000',
  listItemBorder: '#A7A7A7',
  modalBackground: '#00000055',
  dialogBackground: '#555555E0',
  autocompleteBackground: '#F5F5F5EE',
  statusYellow: '#b99112',
  statusGreen: '#39a833',
  statusRed: '#EE2222',
  toastContainer: '#00B5B877',
  toastError: '#FF000099',
};

export const common = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.blackBackground,
  },
  sceneContainer: {
    flex: 1,
  },
  radialGradient: {
    position: 'absolute',
    top: '10%',
    right: 0,
    left: 0,
    bottom: 0,
    opacity: 0.3,
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.modalBackground,
  },
  backgroundBottomContainerGray: {
    flex: 1,
    position: 'absolute',
    justifyContent: 'flex-end',
    backgroundColor: colors.grayBackground,
    bottom: 0,
    top: 0,
    right: 0,
    left: 0,
  },
  backgroundBottomContainerLight: {
    flex: 1,
    position: 'absolute',
    justifyContent: 'flex-end',
    backgroundColor: colors.lightBackground,
    bottom: 0,
    top: 0,
    right: 0,
    left: 0,
  },
  backgroundBottomImage: {
    aspectRatio: 1,
  },
});

export const component = StyleSheet.create({
  buttonContainer: {
    backgroundColor: colors.button,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    maxWidth: '45%',
    alignSelf: 'center',
  },
  buttonText: {
    color: colors.white,
    textAlign: 'center',
    fontSize: 15,
    flex: 1,
  },
  buttonGray: {
    backgroundColor: colors.darkGray,
  },

  textInputContainer: {
    borderBottomWidth: 1,
    borderColor: colors.textInput,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    minHeight: 28, // for ios
  },
  textInputText: {
    flex: 1,
    padding: 0,
    paddingHorizontal: 15,
    fontSize: 16,
    color: 'black',
  },
  integerInputText: {
    textAlign: 'center',
    flex: undefined,
    paddingHorizontal: 7,
  },
  textInputHintText: {
    padding: 0,
    marginBottom: -3,
    alignSelf: 'flex-start',
    color: colors.placeholder,
    fontSize: 12,
    paddingHorizontal: 15,
  },
  textInputLeftIcon: {
    fontSize: 19,
    marginRight: -10,
    marginLeft: 15,
    color: colors.button,
  },
  textInputButtonContainer: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    maxWidth: undefined,
    borderRadius: 8,
    margin: 2,
  },
  textInputButtonText: {
    flex: undefined,
    fontSize: 13,
  },

  headerContainer: {
    padding: 15,
    marginBottom: 5,
    minHeight: 54,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    fontSize: 20,
    alignSelf: 'center',
    textAlign: 'center',
    color: colors.blackText,
  },
  headerTextMenu: {
    flex: 1,
    marginTop: -8,
    fontSize: 20,
    alignSelf: 'center',
    textAlign: 'center',
    color: colors.blackText,
  },
  subHeaderTextMenu: {
    flex: 1,
    marginBottom: -17,
    fontSize: 12,
    alignSelf: 'center',
    textAlign: 'center',
    color: colors.button,
    backgroundColor: 'transparent',
  },
  headerLeftButton: {
    padding: 10,
    position: 'absolute',
    left: 10,
    top: 0,
    zIndex: 1,
  },
  headerRightButton: {
    padding: 10,
    position: 'absolute',
    right: 10,
    top: 0,
    zIndex: 1,
  },
  headerAdditionRightButton: {
    padding: 10,
    position: 'absolute',
    right: 60,
    top: 0,
    zIndex: 1,
  },
  headerCircleButton: {
    height: 34,
    width: 34,
    borderWidth: 1,
    borderRadius: 17,
    borderColor: colors.button,
    justifyContent: 'center',
    alignItems: 'center',
  },

  listItemButtonContainer: {
    height: 52,
    paddingHorizontal: 10,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: colors.listItemBorder,
  },
  listItemButtonInfoContainer: {
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: colors.listItemBorder,
  },
  listItemMainText: {
    fontSize: 17,
    color: colors.blackText,
  },
  listItemText: {
    fontSize: 17,
    color: colors.lightBlackText,
  },
  listItemSubText: {
    fontSize: 12,
    color: colors.placeholder,
    paddingVertical: 3,
  },
  listItemDarkSubText: {
    fontSize: 13,
    color: colors.lightBlackText,
    paddingVertical: 3,
  },
  blockListItemDarkSubText: {
    paddingVertical: 3,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  dropDownTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  menuContainer: {
    marginTop: barHeight,
    backgroundColor: colors.white,
    justifyContent: 'flex-start',
    flex: 1,
  },
  menuHeader: {
    padding: 15,
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    backgroundColor: colors.white,
    elevation: 5,
  },
  menuItemContainerWrapper: {
    paddingLeft: 36,
    paddingRight: 36,
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuMainContainer: {
    flex: 1,
  },
  menuContainerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 143,
  },
  menuContainerBackgroundImage: {
    flex: 1,
  },
  menuLogoImage: {
    height: 68,
    alignSelf: 'center',
    marginTop: 26,
    marginBottom: 24,
  },
  menuItemContainer: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowRadius: 1,
    borderRadius: 3,
    backgroundColor: colors.white,
    elevation: 5,
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    padding: 14,
  },
  menuItemContainerText: {
    marginTop: 7,
    fontSize: 16,
    alignSelf: 'center',
    textAlign: 'center',
    color: colors.blackText,
  },
  menuItemText: {
    color: colors.white,
    fontSize: 18,
    alignSelf: 'center',
    padding: 15,
  },
  menuBadge: {
    position: 'absolute',
    zIndex: 6,
    elevation: 6,
    top: -5,
    right: -5,
    backgroundColor: colors.statusRed,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 30,
    padding: 5,
    borderRadius: 16,
  },
  menuBadgeText: {
    color: colors.white,
    fontSize: 13,
  },

  modalDialogContainer: {
    width: '70%',
    maxWidth: 500,
    backgroundColor: colors.dialogBackground,
    alignItems: 'center',
    borderRadius: 10,
    padding: 20,
  },
  modalDialogText: {
    color: colors.white,
    fontSize: 18,
    textAlign: 'center',
  },
  modalDialogButtonsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    width: '100%',
  },
  errorDialogText: {
    width: '100%',
    color: colors.white,
    paddingVertical: 10,
    marginBottom: 15,
  },
  errorDialogButtonsBar: {
    alignItems: 'center',
  },
  toastContainer: {
    padding: 10,
    position: 'absolute',
    bottom: 0, // height: 50,
    left: 0,
    right: 0,
    backgroundColor: colors.toastContainer,
  },
  toastTitleText: {
    fontSize: 16,
    color: colors.white,
    alignSelf: 'center',
    textAlign: 'center',
  },
  toastMessageText: {
    color: colors.white,
    alignSelf: 'center',
    textAlign: 'center',
  },
  hideToastButton: {
    position: 'absolute',
    alignSelf: 'center',
    top: -15,
    right: -15,
    padding: 20,
  },

  loaderText: {
    fontSize: 16,
    color: colors.white,
    marginBottom: 15,
  },

  autocompleteRootContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.modalBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  autocompleteContainer: {
    flex: 1,
    maxHeight: 400,
    maxWidth: 500,
    width: '100%',
    backgroundColor: colors.autocompleteBackground,
    paddingBottom: 10,
  },
  autocompleteInput: {
    marginHorizontal: 20,
    borderColor: colors.blackText,
  },
  autocompleteItemsContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  autocompleteItem: {
    color: colors.lightBlackText,
    padding: 7,
  },
  inputDialogContainer: {
    backgroundColor: colors.autocompleteBackground,
    paddingBottom: 20,
  },

  filterContainer: {
    backgroundColor: colors.autocompleteBackground,
  },
  filterBodyContainer: {
    paddingHorizontal: 25,
    paddingBottom: 15,
  },
  filterHint: {
    fontSize: 17,
    color: colors.blackText,
    alignSelf: 'center',
    marginBottom: 5,
  },
  filterRow: {
    backgroundColor: colors.autocompleteBackground,
    paddingTop: 3,
    paddingHorizontal: 10,
    marginHorizontal: -10,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    backgroundColor: colors.black,
  },
  cameraButtonsBar: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  cameraButton: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    width: 60,
    height: 60,
  },
  cameraSmallButton: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    width: 36,
    height: 36,
    opacity: 0.9,
  },
  galleryView: {
    height: 140,
  },
  gallerySmallView: {
    height: 96,
  },
  galleryContainer: {
    flexGrow: 1,
    flexDirection: 'row',
    padding: 3,
    alignItems: 'center',
  },
  galleryImage: {
    height: 128,
    width: 128,
    margin: 3,
  },
  gallerySmallImage: {
    height: 84,
    width: 84,
    margin: 3,
  },

  imageCheckIndicator: {
    position: 'absolute',
    zIndex: 1,
    right: 10,
    top: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0004',
    borderWidth: 2,
    borderColor: '#EEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeAccountButton: {
    right: -25,
  },
  removePartButton: {
    position: undefined,
    top: undefined,
    right: undefined,
    marginLeft: 5,
    marginRight: -5,
  },

  removePartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  partListCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },
  partListCountLabel: {
    color: 'black',
    minWidth: 20,
    textAlign: 'center',
  },

  usedPartsDialogQuantityLabel: {
    textAlign: 'center',
    fontSize: 20,
    color: 'black',
    minWidth: 50,
  },
  switchButton: {
    transform: Platform.select({
      ios: [{ scaleX: 0.75 }, { scaleY: 0.75 }],
      android: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
    }),
  },

  thumbnailPasswordMain: {
    flex: 1,
    flexDirection: 'column',
  },

  thumbnailPasswordHintText: {
    padding: 0,
    alignSelf: 'flex-start',
    color: colors.placeholder,
    fontSize: 16,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 8,
  },

  thumbnailPasswordContainer: {
    flex: 1,
    flexDirection: 'column',
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderColor: colors.textInput,
    borderStyle: 'solid',
  },

  thumbnailPasswordItems: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-around',
  },

  thumbnailPasswordItem: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.button,
    borderStyle: 'solid',
  },

  thumbnailPasswordItemText: {
    color: colors.white,
  },

  thumbnailPasswordItemActive: {
    backgroundColor: colors.button,
  },

  textInfoWrapper: {
    minHeight: 40,
    paddingHorizontal: 15,
    paddingTop: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: colors.listItemBorder,
    marginBottom: 5,
  },

  textInfoTitle: {
    fontSize: 12,
    color: colors.placeholder,
    paddingVertical: 3,
  },

  textInfoTitleEmpty: {
    fontSize: 16,
    paddingBottom: 0,
  },

  textInfoText: {
    fontSize: 17,
    color: colors.blackText,
    paddingBottom: 10,
  },

  textInfoTextEmpty: {
    height: 0,
    paddingBottom: 0,
  },
});

export const scene = StyleSheet.create({
  splashLogoContainer: {
    height: '70%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogoImage: {
    width: '45%',
  },

  loginLogoImage: {
    width: '45%',
    maxWidth: 300,
    maxHeight: 150,
    alignSelf: 'center',
  },
  loginFormsContainer: {
    alignSelf: 'center',
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 400,
    width: '100%',
  },

  searchInputContainer: {
    marginHorizontal: 35,
    marginVertical: 20,
  },
  listItemsContainer: {
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  innerListItemsContainer: {
    paddingVertical: 5,
  },
  listItemSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  orderTotalStatusText: {
    marginTop: 15,
    paddingHorizontal: 10,
    fontSize: 18,
    color: colors.blackText,
  },

  closeButton: {
    zIndex: 1,
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0005',
    justifyContent: 'center',
    alignItems: 'center',
  },

  responsiveWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  responsive: {
    width: '100%',
    maxWidth: 500,
  },
  buttonSize: {
    marginBottom: 50,
    marginTop: 10,
  },
});

export default {
  common, component, scene, colors,
};
