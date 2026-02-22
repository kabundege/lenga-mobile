import { Dimensions, PixelRatio, StatusBar } from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';

export default {
  // ============ Sizes ============ //
  SIZE_XS: scale(5),
  SIZE_SM: scale(10),
  SIZE_M: scale(15),
  SIZE_L: scale(20),
  SIZE_LG: scale(25),
  SIZE_XL: scale(30),
  SIZE_2XL: scale(35),
  SIZE_3XL: scale(40),
  SIZE_4XL: scale(45),
  SIZE_5XL: scale(50),
  SIZE_6XL: scale(55),
  SIZE_7XL: scale(60),
  SPACING: scale(30),
  // ============ Typography ============ //
  FONT_SIZE_XS: PixelRatio.getFontScale() * 5,
  FONT_SIZE_SM: PixelRatio.getFontScale() * 10,
  FONT_SIZE_M: PixelRatio.getFontScale() * 15,
  FONT_SIZE_L: PixelRatio.getFontScale() * 20,
  FONT_SIZE_LG: PixelRatio.getFontScale() * 25,
  FONT_SIZE_XL: PixelRatio.getFontScale() * 30,
  FONT_SIZE_2XL: PixelRatio.getFontScale() * 35,
  FONT_SIZE_3XL: PixelRatio.getFontScale() * 40,
  FONT_SIZE_4XL: PixelRatio.getFontScale() * 45,
  FONT_SIZE_5XL: PixelRatio.getFontScale() * 50,
  FONT_SIZE_6XL: PixelRatio.getFontScale() * 55,
  FONT_SIZE_7XL: PixelRatio.getFontScale() * 60,
  // ============ Constants ============ //
  STATUS_BAR_HEIGHT: StatusBar.currentHeight,
  WINDOW_WIDTH: Dimensions.get('window').width,
  SCREEN_WIDTH: Dimensions.get('screen').width,
  WINDOW_HEIGHT: Dimensions.get('window').height,
  SCREEN_HEIGHT: Dimensions.get('screen').height,
  // =========== Variables ============ //
  HITSLOP: 24,
  INPUT_WIDTH: '100%',
  BUTTON_WIDTH: '100%',
  INPUT_BORDER_SIZE: 1,
  BUTTON_BORDER_SIZE: 1,
  BORDER_RADIUS: scale(8),
  BUTTON_BORDER_RADIUS: scale(44),
  INPUT_HEIGHT: verticalScale(44),
  BUTTON_HEIGHT: verticalScale(44),
};
