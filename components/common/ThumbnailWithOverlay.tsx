import { Image, ImageBackground, ImageResizeMode, ImageStyle, StyleProp, ViewStyle } from 'react-native';

interface ThumbnailWithOverlayProps {
  uri?: string;
  overlayStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  imageResizeMode?: ImageResizeMode;
}

const ThumbnailWithOverlay = ({
  uri,
  overlayStyle,
  imageStyle,
  imageResizeMode = 'contain',
}: ThumbnailWithOverlayProps) => (
  <>
    <ImageBackground source={{ uri }} style={overlayStyle} />
    <Image resizeMode={imageResizeMode} source={{ uri }} style={imageStyle} />
  </>
);

export default ThumbnailWithOverlay;
