import IconButton from '@/components/buttons/iconButton';
import CourseCard from '@/components/cards/CourseCard';
import { EmptyListWithSkeleton } from '@/components/empty-states';
import { ControlledInput } from '@/components/inputs/ControlledInput';
import LogoutModal from '@/components/modals/LogoutModal';
import { CoursesListSkeleton } from '@/components/skeletons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TextBody } from '@/components/typography/textBody';
import { useCourses } from '@/hooks/useCourses';
import { useAppSelector } from '@/hooks/useRedux';
import { StrapiCourse } from '@/types/api';
import { flexBetween, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import { useCallback, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CoursesListScreen = () => {
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

  if (isLoading && courses.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.header}>
          <View style={flexBetween}>
            <ThemedText type="title" numberOfLines={2} style={[globalStyles.line_height_4xl, globalStyles.text_secondary, globalStyles.w_60]}>
              Shakisha
            </ThemedText>
            <LogoutModal
              toggleBtn={({ onPress }) => (
                <IconButton
                  size="sm"
                  icon="user"
                  iconType="antd"
                  onPress={onPress}
                  style={globalStyles.border_primary}
                  backgroundColor={colors.primary_light}
                />
              )}
            />
          </View>
          <ControlledInput control={control} placeholder='Amasono akunogeye' name="search" icon="search" iconType="antd" isClearable />
        </SafeAreaView>
        <CoursesListSkeleton />
      </ThemedView>
    );
  }

  const renderCourse = useCallback(({ item }: { item: StrapiCourse }) => (
    <CourseCard course={item} />
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
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.header}>
        <View style={flexBetween}>
          <ThemedText type="title" numberOfLines={2} style={[globalStyles.line_height_4xl, globalStyles.text_secondary, globalStyles.w_60]}>
            Shakisha
          </ThemedText>
          <LogoutModal
            toggleBtn={({ onPress }) => (
              <IconButton
                size="sm"
                icon="user"
                iconType="antd"
                onPress={onPress}
                style={globalStyles.border_primary}
                backgroundColor={colors.primary_light}
              />
            )}
          />
        </View>
        <ControlledInput control={control} placeholder='Amasono akunogeye' name="search" icon="search" iconType="antd" isClearable />
      </SafeAreaView>
      <FlatList
        onRefresh={refetch}
        data={filteredCourses}
        renderItem={renderCourse}
        refreshing={isRefetching}
        contentContainerStyle={styles.list}
        keyExtractor={(item) => item.documentId}
        ListEmptyComponent={renderEmptyComponent}
      />
    </ThemedView>
  );
};

export default CoursesListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    ...globalStyles.gap_xs,
    padding: themeToken.paddingLg,
    paddingBottom: 0,
  },
  list: {
    paddingHorizontal: themeToken.paddingLg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: themeToken.paddingLg,
  },
});
