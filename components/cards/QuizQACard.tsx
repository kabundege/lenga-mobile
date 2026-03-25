import type { StrapiQA } from '@/types/api';
import { flexBetween, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import { PressableScale } from 'pressto';
import { StyleSheet, View } from 'react-native';
import { TextBody } from '../typography';

export type QuizQACardRevealState = 'idle' | 'correct' | 'wrong' | 'unknown';

type QuizQACardProps = {
  qa: StrapiQA;
  onPress: () => void;
  revealState?: QuizQACardRevealState;
};

function getRevealStyles(state: QuizQACardRevealState) {
  if (state === 'correct') {
    return {
      borderColor: colors.success.primary,
      backgroundColor: colors.success.tertiary,
      label: 'Correct',
      labelBg: colors.success.primary,
    };
  }
  if (state === 'wrong') {
    return {
      borderColor: colors.danger.primary,
      backgroundColor: colors.danger.tertiary,
      label: 'Wrong',
      labelBg: colors.danger.primary,
    };
  }
  if (state === 'unknown') {
    return {
      borderColor: colors.border.primary,
      backgroundColor: colors.background.secondary,
      label: 'Selected',
      labelBg: colors.primary,
    };
  }
  return {
    borderColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
    label: null,
    labelBg: colors.primary,
  };
}

const QuizQACard = ({ qa, onPress, revealState = 'idle' }: QuizQACardProps) => {
  const reveal = getRevealStyles(revealState);

  return (
    <PressableScale
      onPress={onPress}
      style={[
        styles.card,
        {
          borderColor: reveal.borderColor,
          backgroundColor: reveal.backgroundColor,
        },
      ]}
    >
      <View style={[flexBetween, globalStyles.gap_sm]}>
        <TextBody variant="body2" strong style={globalStyles.flex_1}>
          {qa.qa_desc}
        </TextBody>
        {reveal.label ? (
          <View style={[styles.pill, { backgroundColor: reveal.labelBg }]}>
            <TextBody variant="caption" strong color="inverted">
              {reveal.label}
            </TextBody>
          </View>
        ) : null}
      </View>
    </PressableScale>
  );
};

export default QuizQACard;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: themeToken.borderRadius,
    padding: themeToken.padding,
  },
  pill: {
    paddingHorizontal: themeToken.paddingSm,
    paddingVertical: themeToken.paddingXs,
    borderRadius: 999,
    ...globalStyles.overflow_hidden,
  },
});

