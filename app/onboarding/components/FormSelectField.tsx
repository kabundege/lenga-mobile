import BaseModal from "@/components/modals/BaseModal";
import { Icon } from "@/components/common/icon";
import { TextBody } from "@/components/typography";
import { TextHeading } from "@/components/typography/textHeading";
import { Dimensions, flexBetween, globalStyles } from "@/utils/styles";
import colors from "@/utils/theme/colors";
import { themeToken } from "@/utils/theme/styles";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  BottomSheetScrollView,
  BottomSheetTextInput,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { PressableOpacity, PressableScale } from "pressto";
import { useMemo, useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

export type SelectOption<T> = {
  value: T;
  label: string;
};

type FormSelectFieldProps<T> = {
  label: string;
  placeholder: string;
  value: T | undefined;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  errorMessage?: string;
  modalTitle?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  isOptionEqual?: (left: T, right: T) => boolean;
};

const defaultIsEqual = <T,>(left: T, right: T) => left === right;

export function FormSelectField<T>({
  label,
  placeholder,
  value,
  options,
  onChange,
  errorMessage,
  modalTitle,
  disabled = false,
  searchable = false,
  searchPlaceholder = "Shaka...",
  isOptionEqual = defaultIsEqual,
}: FormSelectFieldProps<T>) {
  const modalRef = useRef<BottomSheetModal>(null);
  const [sheetKey, setSheetKey] = useState(0);
  const hasError = Boolean(errorMessage);
  const selectedLabel = options.find((option) =>
    value !== undefined ? isOptionEqual(option.value, value) : false,
  )?.label;

  return (
    <View style={globalStyles.gap_xs}>
      <TextBody variant="caption" strong>
        {label}
      </TextBody>

      <BaseModal
        ref={modalRef}
        snapPoints={[searchable ? "65%" : "55%"]}
        onClose={() => setSheetKey((current) => current + 1)}
        toggleBtn={({ onPress }) => (
          <PressableScale
            onPress={disabled ? undefined : onPress}
            style={[
              styles.trigger,
              hasError ? styles.triggerError : undefined,
              disabled ? styles.triggerDisabled : undefined,
            ]}
          >
            <TextBody
              variant="body2"
              color={selectedLabel ? "default" : "secondary"}
              style={globalStyles.flex_grow}
            >
              {selectedLabel ?? placeholder}
            </TextBody>
            <Icon
              name="chevron-down"
              type="feather"
              size={Dimensions.FONT_SIZE_L}
              color={hasError ? colors.danger.primary : colors.text.secondary}
            />
          </PressableScale>
        )}
      >
        <SelectOptionsSheet
          key={sheetKey}
          title={modalTitle ?? label}
          options={options}
          selectedValue={value}
          isOptionEqual={isOptionEqual}
          searchable={searchable}
          searchPlaceholder={searchPlaceholder}
          onSelect={(nextValue) => {
            onChange(nextValue);
            modalRef.current?.dismiss();
          }}
        />
      </BaseModal>

      {hasError ? (
        <View style={globalStyles.px_xs}>
          <TextBody
            variant="caption"
            color="danger"
            style={globalStyles.text_right}
          >
            {errorMessage}
          </TextBody>
        </View>
      ) : null}
    </View>
  );
}

type SelectOptionsSheetProps<T> = {
  title: string;
  options: SelectOption<T>[];
  selectedValue: T | undefined;
  onSelect: (value: T) => void;
  isOptionEqual: (left: T, right: T) => boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
};

function SelectOptionsSheet<T>({
  title,
  options,
  selectedValue,
  onSelect,
  isOptionEqual,
  searchable = false,
  searchPlaceholder = "Shaka...",
}: SelectOptionsSheetProps<T>) {
  const { dismiss } = useBottomSheetModal();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchable) return options;

    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return options;

    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedQuery),
    );
  }, [options, searchQuery, searchable]);

  return (
    <BottomSheetScrollView
      contentContainerStyle={styles.sheetContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[flexBetween, globalStyles.mb_md]}>
        <TextHeading variant="subTitle">{title}</TextHeading>
        <PressableScale onPress={() => dismiss()} style={styles.closeButton}>
          <Icon
            type="antd"
            name="close"
            color={colors.text.primary}
            size={Dimensions.FONT_SIZE_M}
          />
        </PressableScale>
      </View>

      {searchable ? (
        <View style={[styles.searchBar, globalStyles.mb_sm]}>
          <Icon
            name="search1"
            type="antd"
            size={Dimensions.FONT_SIZE_M}
            color={colors.text.secondary}
          />
          <BottomSheetTextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.text.secondary}
            style={styles.searchInput}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searchQuery.length > 0 ? (
            <PressableScale onPress={() => setSearchQuery("")} hitSlop={8}>
              <Icon
                name="close"
                type="antd"
                size={Dimensions.FONT_SIZE_XS}
                color={colors.text.secondary}
              />
            </PressableScale>
          ) : null}
        </View>
      ) : null}

      <View style={[globalStyles.rounded_sm, globalStyles.overflow_hidden]}>
        {filteredOptions.length === 0 ? (
          <TextBody
            variant="body2"
            color="secondary"
            style={globalStyles.text_center}
          >
            Nta bisubizo bibonetse
          </TextBody>
        ) : (
          filteredOptions.map((option, index) => {
            const isSelected =
              selectedValue !== undefined &&
              isOptionEqual(option.value, selectedValue);

            return (
              <PressableOpacity
                key={String(option.value)}
                onPress={() => onSelect(option.value)}
                style={[
                  flexBetween,
                  globalStyles.p_sm,
                  globalStyles.bg_black_10,
                  isSelected ? styles.optionRowSelected : undefined,
                ]}
              >
                <TextBody variant="body2" strong={isSelected}>
                  {option.label}
                </TextBody>
                {isSelected ? (
                  <Icon
                    name="check"
                    type="feather"
                    color={colors.text.default}
                    size={Dimensions.FONT_SIZE_M}
                  />
                ) : null}
              </PressableOpacity>
            );
          })
        )}
      </View>
    </BottomSheetScrollView>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: Dimensions.INPUT_HEIGHT,
    borderRadius: themeToken.borderRadius,
    paddingHorizontal: themeToken.padding,
    backgroundColor: colors.primary_light,
  },
  triggerError: {
    backgroundColor: colors.danger.light,
  },
  triggerDisabled: {
    opacity: 0.6,
  },
  sheetContent: {
    paddingHorizontal: themeToken.paddingLg,
    paddingBottom: themeToken.paddingLg,
  },
  closeButton: {
    padding: themeToken.paddingSm,
    borderRadius: themeToken.borderRadius,
    backgroundColor: colors.primary_light,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: themeToken.spacingSm,
    minHeight: Dimensions.INPUT_HEIGHT,
    borderRadius: themeToken.borderRadius,
    paddingHorizontal: themeToken.padding,
    backgroundColor: colors.primary_light,
  },
  searchInput: {
    flex: 1,
    fontSize: Dimensions.FONT_SIZE_M,
    color: colors.text.default,
    paddingVertical: themeToken.paddingSm,
  },
  optionRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary_light,
  },
});
