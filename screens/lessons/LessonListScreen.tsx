import IconButton from "@/components/buttons/iconButton";
import LessonCard from "@/components/cards/LessonCard";
import Spacer from "@/components/common/spacer";
import { EmptyListWithSkeleton } from "@/components/empty-states";
import { ControlledInput } from "@/components/inputs/ControlledInput";
import LogoutModal from "@/components/modals/LogoutModal";
import { LessonsListSkeleton } from "@/components/skeletons";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TextBody } from "@/components/typography/textBody";
import { useMe } from "@/hooks/useAuth";
import { useLessons } from "@/hooks/useLessons";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { StrapiLesson } from "@/types/api";
import { flexBetween, globalStyles } from "@/utils/styles";
import colors from "@/utils/theme/colors";
import { themeToken } from "@/utils/theme/styles";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ListRenderItemInfo, Pressable, StyleSheet, View } from "react-native";
import Animated, { CurvedTransition } from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const LessonListScreen = () => {
  const { user } = useMe();
  const insets = useSafeAreaInsets();
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const { isSyncing, refreshAllLessonOfflineData } = useOfflineSync();
  const { lessons, isLoading, isRefetching, error, refetch } = useLessons();

  const { control } = useForm({
    defaultValues: {
      search: "",
    },
  });

  const { search } = useWatch({ control });

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) =>
      lesson.title.toLowerCase().includes(search?.toLowerCase() ?? ""),
    );
  }, [lessons, search]);

  const formattedUsername = useMemo(() => {
    return user?.email.split("@")[0].split("_").join(" ");
  }, [user?.email]);

  const RenderHeader = useCallback(
    ({ editable = true }: { editable?: boolean }) => (
      <SafeAreaView
        edges={["top"]}
        style={[
          globalStyles.pt_sm,
          globalStyles.gap_2xs,
          globalStyles.px_md,
          globalStyles.pb_sm,
          globalStyles.border_b,
        ]}
      >
        <StatusBar style="dark" />
        <View style={[flexBetween, globalStyles.gap_sm]}>
          <View
            style={[
              globalStyles.flex_row,
              globalStyles.gap_2xs,
              globalStyles.flex_wrap,
              globalStyles.w_60,
            ]}
          >
            <TextBody strong color="tertiary">
              Muraho,
            </TextBody>
            <TextBody strong numberOfLines={1} style={globalStyles.capitalize}>
              {formattedUsername}
            </TextBody>
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
          <ThemedText
            type="title"
            numberOfLines={2}
            style={[
              globalStyles.line_height_4xl,
              globalStyles.text_secondary,
              globalStyles.w_60,
            ]}
          >
            Shakisha
          </ThemedText>
          <ControlledInput
            control={control}
            editable={editable}
            placeholder="Amasono akunogeye"
            name="search"
            icon="search"
            iconType="antd"
            isClearable
          />
        </View>
      </SafeAreaView>
    ),
    [control, user],
  );

  const renderLessons = useCallback(
    ({ item, index }: ListRenderItemInfo<StrapiLesson>) => (
      <LessonCard key={item.documentId} lesson={item} index={index} />
    ),
    [],
  );

  const renderEmptyComponent = useCallback(
    () => (
      <Controller
        control={control}
        name="search"
        render={({ field: { value } }) => (
          <EmptyListWithSkeleton
            title={
              !value
                ? "Nta masomo yabonetse"
                : `Nta somo ribonetse rihuye na "${value}"`
            }
            description={
              !value
                ? "Nta masomo yabonetse kuri iki gihe. Reba vuba."
                : "Gerageza guhindura amagambo ushakisha."
            }
          />
        )}
      />
    ),
    [control],
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshingAll(true);
    try {
      const refreshed = await refreshAllLessonOfflineData();
      if (!refreshed) {
        await refetch();
      }
    } catch {
      await refetch();
    } finally {
      setIsRefreshingAll(false);
    }
  }, [refetch, refreshAllLessonOfflineData]);

  if (error && lessons.length === 0) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="defaultSemiBold">
          Hari ikitagenze neza mu kubona amasomo.
        </ThemedText>
        <Pressable onPress={() => refetch()}>
          <TextBody variant="body2" color="primary">
            Subiramo
          </TextBody>
        </Pressable>
      </ThemedView>
    );
  }

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
        onRefresh={onRefresh}
        data={filteredLessons}
        layout={CurvedTransition}
        renderItem={renderLessons}
        keyExtractor={(item) => item.documentId}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.contentContainer}
        ListFooterComponent={<Spacer height={insets.bottom} />}
        refreshing={isRefetching || isRefreshingAll || isSyncing}
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
    alignItems: "center",
    justifyContent: "center",
    padding: themeToken.paddingLg,
  },
});
