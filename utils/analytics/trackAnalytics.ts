/**
 * Fire-and-forget analytics calls — never block learner UX on reporting failures.
 */
export const trackAnalytics = (task: () => Promise<unknown>, label: string) => {
  task().catch((error) => {
    if (__DEV__) {
      console.warn(`[analytics] ${label}`, error);
    }
  });
};
