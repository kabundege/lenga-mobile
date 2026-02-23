import {
  ImpactFeedbackStyle,
  NotificationFeedbackType,
  impactAsync,
  notificationAsync,
  selectionAsync,
} from 'expo-haptics';

type HapticType =
  | 'impactLight'
  | 'impactMedium'
  | 'impactHeavy'
  | 'selection'
  | 'notificationSuccess'
  | 'notificationWarning'
  | 'notificationError';

export const triggerHaptic = (type: HapticType = 'impactMedium') => {
  try {
    switch (type) {
      case 'impactLight':
        impactAsync(ImpactFeedbackStyle.Light);
        break;
      case 'impactMedium':
        impactAsync(ImpactFeedbackStyle.Medium);
        break;
      case 'impactHeavy':
        impactAsync(ImpactFeedbackStyle.Heavy);
        break;
      case 'selection':
        selectionAsync();
        break;
      case 'notificationSuccess':
        notificationAsync(NotificationFeedbackType.Success);
        break;
      case 'notificationWarning':
        notificationAsync(NotificationFeedbackType.Warning);
        break;
      case 'notificationError':
        notificationAsync(NotificationFeedbackType.Error);
        break;
      default:
        impactAsync(ImpactFeedbackStyle.Medium);
    }
  } catch (error) {
    // Silently fail if haptics are not available
    // This can happen on simulators, devices without haptic support, or when the system is unavailable
  }
};
