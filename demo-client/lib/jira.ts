export const isJiraConfigured = () => false;

export const createJiraIssueForCheck = async (): Promise<never> => {
  throw new Error("Jira integration is disabled in the demo copy.");
};
