import { BUTTON_HIT_SLOP } from "@/utils/constants";
import { Dimensions, globalStyles } from "@/utils/styles";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
} from "@gorhom/bottom-sheet";
import { PressableScale } from "pressto";
import React, {
  forwardRef,
  Fragment,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { StyleProp, ViewStyle } from "react-native";

export interface BaseModalProps {
  children: ReactNode;
  hitSlop?: number;
  onClose?: () => void;
  detached?: boolean;
  canSnapToPoints?: boolean;
  canSwipeToClose?: boolean;
  useSnapPointStrict?: boolean;
  style?: StyleProp<ViewStyle>;
  isToggleBtnDisabled?: boolean;
  toggleBtnCallBack?: () => void;
  toggleBtnStyle?: StyleProp<ViewStyle>;
  backgroundStyle?: StyleProp<ViewStyle>;
  containerStyles?: StyleProp<ViewStyle>;
  snapPoints?: BottomSheetModalProps["snapPoints"];
  toggleBtn?: ReactNode | (({ onPress }: { onPress: () => void }) => ReactNode);
}

const BaseModal = forwardRef<BottomSheetModal, BaseModalProps>(
  (
    {
      style,
      children,
      toggleBtn,
      snapPoints,
      onClose,
      detached = false,
      toggleBtnStyle,
      backgroundStyle,
      useSnapPointStrict,
      canSwipeToClose = true,
      canSnapToPoints = true,
      hitSlop = BUTTON_HIT_SLOP,
    },
    ref
  ) => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const renderBackdrop = useCallback(
      (backDropProps: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...backDropProps}
          appearsOnIndex={1}
          disappearsOnIndex={-1}
        />
      ),
      []
    );

    const currSnapPoints = useMemo(
      () => (canSnapToPoints ? snapPoints || ["90%"] : undefined),
      [snapPoints, canSnapToPoints]
    );

    React.useImperativeHandle(ref, () => bottomSheetModalRef.current!, [
      bottomSheetModalRef,
    ]);

    const toggleBtnPress = () => {
      bottomSheetModalRef.current?.present();
    };

    return (
      <Fragment>
        {typeof toggleBtn === "function" ? (
          toggleBtn({ onPress: toggleBtnPress })
        ) : toggleBtn ? (
          <PressableScale
            hitSlop={hitSlop}
            style={toggleBtnStyle}
            onPress={toggleBtnPress}
          >
            {toggleBtn}
          </PressableScale>
        ) : null}

        <BottomSheetModal
          detached={detached}
          keyboardBehavior="interactive"
          backgroundStyle={[globalStyles.bg_background, backgroundStyle]}
          maxDynamicContentSize={Dimensions.SCREEN_HEIGHT * 0.9}
          enablePanDownToClose={canSwipeToClose}
          backdropComponent={renderBackdrop}
          onDismiss={onClose}
          index={useSnapPointStrict ? 1 : 0}
          snapPoints={currSnapPoints}
          ref={bottomSheetModalRef}
          style={[
            detached && {
              marginHorizontal: 16,
              marginBottom: 16,
            },
            style,
          ]}
          bottomInset={detached ? 16 : 0}
        >
          {children}
        </BottomSheetModal>
      </Fragment>
    );
  }
);

BaseModal.displayName = "BaseModal";

export default BaseModal;
