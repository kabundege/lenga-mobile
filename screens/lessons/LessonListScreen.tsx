import { useMe } from '@/hooks/useAuth';
import colors from '@/utils/theme/colors';
import { StrapiLesson } from '@/types/api';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo } from 'react';
import { useLessons } from '@/hooks/useLessons';
import Spacer from '@/components/common/spacer';
import { themeToken } from '@/utils/theme/styles';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import LessonCard from '@/components/cards/LessonCard';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import IconButton from '@/components/buttons/iconButton';
import LogoutModal from '@/components/modals/LogoutModal';
import { flexBetween, globalStyles } from '@/utils/styles';
import { TextBody } from '@/components/typography/textBody';
import { LessonsListSkeleton } from '@/components/skeletons';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { EmptyListWithSkeleton } from '@/components/empty-states';
import Animated, { CurvedTransition } from 'react-native-reanimated';
import { ControlledInput } from '@/components/inputs/ControlledInput';
import { ListRenderItemInfo, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '@/hooks/useRedux';

const LessonListScreen = () => {
  useOfflineSync();
  const { user } = useMe();
  const insets = useSafeAreaInsets();
  const { byRemoteUrl } = useAppSelector(state => state.offlineAssets);
  const { lessons, isLoading, isRefetching, error, refetch } = useLessons();


  const { control } = useForm({
    defaultValues: {
      search: '',
    },
  });

  const { search } = useWatch({ control });

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => lesson.title.toLowerCase().includes(search?.toLowerCase() ?? ''));
  }, [lessons, search]);

  if (error && lessons.length === 0) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="defaultSemiBold">Hari ikitagenze neza mu kubona amasomo.</ThemedText>
        <Pressable onPress={() => refetch()}>
          <TextBody variant="body2" color="primary">Subiramo</TextBody>
        </Pressable>
      </ThemedView>
    );
  }

  const formattedUsername = useMemo(() => {
    return user?.email.split('@')[0].split('_').join(' ');
  }, [user?.email])

  const RenderHeader = useCallback(({ editable = true }: { editable?: boolean }) => (
    <SafeAreaView edges={['top']} style={[globalStyles.pt_sm, globalStyles.gap_2xs, globalStyles.px_md, globalStyles.pb_sm, globalStyles.border_b]}>
      <StatusBar style="dark" />
      <View style={[flexBetween, globalStyles.gap_sm]}>
        <View style={[globalStyles.flex_row, globalStyles.gap_2xs, globalStyles.flex_wrap, globalStyles.w_60]}>
          <TextBody strong color='tertiary'>Muraho,</TextBody>
          <TextBody strong numberOfLines={1} style={globalStyles.capitalize}>{formattedUsername}</TextBody>
        </View>
        <LogoutModal
          toggleBtn={({ onPress }) => (
            <IconButton
              size="sm"
              icon="user"
              iconType="antd"
              onPress={onPress}
              iconFill={colors.text.inverted}
              backgroundColor={colors.primary}
              style={[globalStyles.border_primary, globalStyles.p_sm]}
            />
          )}
        />
      </View>

      <View>
        <ThemedText type="title" numberOfLines={2} style={[globalStyles.line_height_4xl, globalStyles.text_secondary, globalStyles.w_60]}>
          Shakisha
        </ThemedText>
        <ControlledInput control={control} editable={editable} placeholder='Amasono akunogeye' name="search" icon="search" iconType="antd" isClearable />
      </View>
    </SafeAreaView>
  ), [control, user]);


  const renderLessons = useCallback(({ item, index }: ListRenderItemInfo<StrapiLesson>) => (
    <LessonCard key={item.documentId} lesson={item} index={index} />
  ), []);

  const renderEmptyComponent = useCallback(() => (
    <Controller
      control={control}
      name="search"
      render={({ field: { value } }) => (
        <EmptyListWithSkeleton
          title={!value ? 'Nta masomo yabonetse' : `Nta somo ribonetse rihuye na "${value}"`}
          description={!value ? 'Nta masomo yabonetse kuri iki gihe. Reba vuba.' : 'Gerageza guhindura amagambo ushakisha.'}
        />
      )}
    />
  ), [control]);

  if (isLoading && lessons.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <RenderHeader editable={false} />
        <LessonsListSkeleton />
      </ThemedView>
    );
  }


  return (
    <View style={styles.container}>
      <RenderHeader />
      <Animated.FlatList
        numColumns={2}
        onRefresh={refetch}
        data={filteredLessons}
        layout={CurvedTransition}
        refreshing={isRefetching}
        renderItem={renderLessons}
        keyExtractor={(item) => item.documentId}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.contentContainer}
        ListFooterComponent={<Spacer height={insets.bottom} />}
      />
    </View>
  );
};

export default LessonListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  contentContainer: {
    gap: themeToken.spacing,
    paddingVertical: themeToken.spacing,
    paddingHorizontal: themeToken.paddingLg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: themeToken.paddingLg,
  },
});
