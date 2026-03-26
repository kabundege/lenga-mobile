import IconButton from '@/components/buttons/iconButton';
import PlayAudioButton from '@/components/buttons/playAudioButton';
import { useOfflineAssetUri } from '@/hooks/useOfflineAssetUri';
import { TextBody, TextHeading } from '@/components/typography';
import { flexBetween, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { SafeAreaView, type SafeAreaViewProps } from 'react-native-safe-area-context';
import { Image, ImageBackground, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { scale } from 'react-native-size-matters';

type Props = {
  title: string;
  subtitle?: string;
  thumbnailUrl?: string | null;
  audioUrl?: string | null;
  onBack: () => void;
  edges?: SafeAreaViewProps['edges'];
};

export default function ContentThumbnailHeader({
  title,
  subtitle,
  thumbnailUrl,
  audioUrl,
  onBack,
  edges = ['top'],
}: Props) {
  const img = useOfflineAssetUri(thumbnailUrl);
  const source: ImageSourcePropType | undefined = img ? { uri: img } : undefined;

  return (
    <View style={[globalStyles.bg_primary_light]}>

      {source ? <ImageBackground source={source} style={styles.thumbnailBackground} /> : null}
      <SafeAreaView edges={edges} style={[globalStyles.p_md, globalStyles.gap_sm]}>
        <View>
          <View style={flexBetween}>
            <IconButton onPress={onBack} icon="chevron-left" iconType="feather" backgroundColor={colors.primary_light} iconFill={colors.primary} />
            <PlayAudioButton audioUrl={audioUrl ?? undefined} />
          </View>


          <View style={[flexBetween, globalStyles.gap_sm, globalStyles.mt_sm]}>
            {source ? <Image resizeMode="contain" source={source} style={styles.thumbnail} /> : <View style={styles.thumbnailPlaceholder} />}
            <View style={globalStyles.flex_1}>
              {subtitle ? (
                <TextBody variant="body2" color="primary" style={globalStyles.mt_xs}>
                  {subtitle}
                </TextBody>
              ) : null}
              <TextHeading variant="title">{title}</TextHeading>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  thumbnail: {
    width: scale(60),
    height: scale(60),
  },
  thumbnailPlaceholder: {
    width: scale(60),
    height: scale(60),
    borderRadius: 12,
    backgroundColor: colors.border.tertiary,
  },
  thumbnailBackground: {
    ...StyleSheet.absoluteFillObject,
    ...globalStyles.overflow_hidden,
    ...globalStyles.rounded_md,
    ...globalStyles.opacity_025,
  },
});

