import IconButton from '@/components/buttons/iconButton';
import { flexBetween, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { router } from 'expo-router';
import { View } from 'react-native';

export function CourseDetailHeader() {
  return (
    <View style={flexBetween}>
      <IconButton
        icon="chevron-left"
        iconType="feather"
        onPress={router.back}
        style={globalStyles.p_md}
        iconFill={colors.text.primary}
        backgroundColor={colors.primary_light}
      />
    </View>
  );
}
