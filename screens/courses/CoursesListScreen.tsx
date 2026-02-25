import IconButton from '@/components/buttons/iconButton';
import CourseCard from '@/components/cards/CourseCard';
import { EmptyListWithSkeleton } from '@/components/empty-states';
import { ControlledInput } from '@/components/inputs/ControlledInput';
import LogoutModal from '@/components/modals/LogoutModal';
import { CoursesListSkeleton } from '@/components/skeletons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TextHeading } from '@/components/typography';
import { TextBody } from '@/components/typography/textBody';
import { useCourses } from '@/hooks/useCourses';
import { useAppSelector } from '@/hooks/useRedux';
import { StrapiCourse } from '@/types/api';
import { flexBetween, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import { useCallback, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ListRenderItemInfo, Pressable, StyleSheet, View } from 'react-native';
import Animated, { CurvedTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const CoursesListScreen = () => {
  const user = useAppSelector((s) => s.auth.user);
  const locale = useAppSelector((s) => s.preferences.locale);
  const { courses, isLoading, isRefetching, error, refetch } = useCourses(locale);

  const { control } = useForm({
    defaultValues: {
      search: '',
    },
  });

  const { search } = useWatch({ control });

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => course.title.toLowerCase().includes(search?.toLowerCase() ?? ''));
  }, [courses, search]);

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="defaultSemiBold">Hari ikitagenze neza mu kubona amasomo.</ThemedText>
        <Pressable onPress={() => refetch()}>
          <TextBody variant="body2" color="primary">Subiramo</TextBody>
        </Pressable>
      </ThemedView>
    );
  }

  const renderHeader = useCallback(({ editable = true }: { editable?: boolean }) => (
    <SafeAreaView style={[globalStyles.py_sm, globalStyles.gap_sm]}>
      {
        user ? (
          <View style={[flexBetween, globalStyles.gap_sm]}>
            <View>
              <TextBody strong color='tertiary'>Muraho,</TextBody>
              <TextHeading variant="subTitle">{user?.full_name}</TextHeading>
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
        ) : null
      }

      <View>
        <ThemedText type="title" numberOfLines={2} style={[globalStyles.line_height_4xl, globalStyles.text_secondary, globalStyles.w_60]}>
          Shakisha
        </ThemedText>
        <ControlledInput control={control} editable={editable} placeholder='Amasono akunogeye' name="search" icon="search" iconType="antd" isClearable />
      </View>
    </SafeAreaView>
  ), [control, user]);

  if (isLoading && courses.length === 0) {
    return (
      <ThemedView style={styles.list}>
        {renderHeader({ editable: false })}
        <CoursesListSkeleton />
      </ThemedView>
    );
  }

  const renderCourse = useCallback(({ item, index }: ListRenderItemInfo<StrapiCourse>) => (
    <CourseCard course={item} index={index} style={index ? globalStyles.mt_sm : null} />
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

  return (
    <Animated.FlatList
      onRefresh={refetch}
      data={filteredCourses}
      layout={CurvedTransition}
      renderItem={renderCourse}
      refreshing={isRefetching}
      ListHeaderComponent={renderHeader}
      contentContainerStyle={styles.list}
      keyExtractor={(item) => item.documentId}
      ListEmptyComponent={renderEmptyComponent}
    />
  );
};

export default CoursesListScreen;

const styles = StyleSheet.create({
  list: {
    flex: 1,
    paddingHorizontal: themeToken.paddingLg,
    backgroundColor: colors.background.primary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: themeToken.paddingLg,
  },
});
