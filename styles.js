import { StyleSheet } from 'react-native';
import colors from './styles.colors';
import fontSizes from './styles.fontSizes';
import palettes from './styles.palettes';

const styles = StyleSheet.create({

  container: {
    flex: 1,
    alignItems: 'flex-start',
    backgroundColor: colors.pageBackground,
  },

  scrollContainer: {
    padding: 20,
    flex: 1,
  },

  flexView_wrap_row: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },

  ...Platform.select({
    ios: {},
    android: {}
    }
  ),

  flex_toggle_row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 10
  },

  listRow: {
    flexDirection: 'row'
  },

  formGroup: {
    margin: 20
  },

  inputStyle: {
    backgroundColor: colors.pageBackground,
    height: 36,
    paddingStart:10,
    alignSelf: "flex-start",
    borderColor: colors.borderColor,
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 10,
    margin: 6,
    fontSize: fontSizes.medium,
    minWidth: "98%",
    marginHorizontal: "1%",
    paddingLeft: 2
  },

  header: {
    fontSize: fontSizes.header,
    textAlign: 'center',
    marginBottom: 20
  },

  label: {
    color: colors.pageForeground,
    fontSize: fontSizes.medium,
    marginHorizontal: "1%",
  },

  currentOrganizationView: {
    width: '100%',
    height: 128,
    backgroundColor: colors.primaryColor,
    fontSize: fontSizes.medium,
    fontWeight: 700
  },

  currentOrganizationHeader: {
    fontSize: fontSizes.medium,
    marginBottom: 10,
    marginTop: 10,
    paddingLeft: 4,
  },

  spinner: {
    size: "large",
    color: palettes.accent.normal
  },

  spinnerColor: {
    color: palettes.accent.normal
  },

  spinnerText: {
    fontSize: fontSizes.large,
    paddingBottom: 20
  },

  spinnerView: {
    position: "absolute",
    zIndex: 1,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.pageBackground,
  },

  centeredContent: {
    position: "absolute",
    zIndex: 1,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5FCFF88",
  },

  centeredIcon: {
    textAlign: 'center',
    width: '100%',
    color: palettes.accent.normal,
    fontSize: fontSizes.icon
  },

  buttonPrimary: {
    backgroundColor: colors.primaryColor
  },

  buttonSecondary: {
    backgroundColor: colors.accentColor
  },

  submitButton: {
    backgroundColor: colors.primaryColor,
    borderRadius: 4,
    height: 48,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginHorizontal: "1%",
    margin: 6,
    minWidth: "98%",
    textAlign: "center",
  },

  submitButtonText: {
    color: palettes.primary.white,
    textAlign: "center",
    fontSize: fontSizes.large,
  },

  submitButtonTextLarge: {
    color: palettes.primary.white,
    textAlign: "center",
    fontSize: fontSizes.iconButtonLarge,
  },

  submitButtonTextBlack: {
    color: palettes.primary.black,
    textAlign: "center",
    fontSize: fontSizes.large,
  },

  authActionHeaders: {
    fontSize: fontSizes.medium,
    textAlign: "center",
    color: colors.black
  },

  authActionLink: {
    color: colors.primaryColor
  },

  authCallToActionView: {
    paddingBottom: '14%',
    paddingTop: 10,
    position: 'absolute',
    bottom: 5,
    width: '100%',
    textAlign: 'center'
  },

  authForgotPasswordLink: {
    fontSize: fontSizes.medium,
    margin: 5,
    marginBottom: 10,
    marginTop: 10,
    color: colors.primaryColor
  },

  buttonExternalLogin: {
    borderWidth: 0.5,
    display:'flex',
    flexDirection:'row',
    borderRadius: 4,
    height: 48,
    paddingVertical: 0,
    alignSelf: "flex-start",
    marginHorizontal: "1%",
    margin: 6,
    minWidth: "98%",
    textAlign: "center",
  },

  buttonExternalLoginLogo: {
    width:28,
    height:28,
    marginLeft:10,
    marginTop:10    
  },

  logoImage: {
    marginTop: 100,
    alignSelf: "center",
    marginBottom: 30,    
  },

  navRow: {
    backgroundColor: palettes.primary.white,
    height: 42,
    width: 300,
    borderBottomColor: colors.borderColor,
    borderBottomWidth: 1
  },

  navRowText: {
    color: colors.pageForeground
  },

  btnCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palettes.primary.white,
    shadowColor: palettes.primary.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 1,
    bottom: 28
  },

  btnCircleUp: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8E8E8',
    bottom: 18,
    shadowColor: palettes.primary.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 1,
  },

  imgCircle: {
    width: 30,
    height: 30,
    tintColor: '#48CEF6'
  },

  img: {
    width: 30,
    height: 30,
  },

  item: {
    padding: 20,
    marginTop: 5,
    fontSize: fontSizes.listItem,
  },

  iconButtonCircle: {
    color: colors.primaryColor,
    fontSize: fontSizes.iconButtonLargeBackground,
    padding: 0,
    margin: 0
  },

  iconButtonCircleOverlay: {
    color: colors.white,
    fontSize: fontSizes.iconButtonLarge - 6,
    marginLeft: 0,
    paddingLeft: 0,
    textAlign: 'center',
    top: -(fontSizes.iconButtonLarge + 4)
  },

  loadingIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },

  /* GENERIC STYLES */
  mb_00: {
    marginBottom: 0
  },

  mb_05: {
    marginBottom: 5
  },

  mt_00: {
    marginTop: 0
  },

  mt_10: {
    marginTop: 10
  },

  mt_20: {
    marginTop: 20
  },

  pb_10: {
    paddingBottom: 10,
  },

  pt_10: {
    paddingTop: 10
  },

  alignCenter: {
    textAlign: 'center',
    width: '100%'
  },

  alignVerticalMiddle: {
    height: '100%',
    marginBottom: 10,
  },

});

export default styles;