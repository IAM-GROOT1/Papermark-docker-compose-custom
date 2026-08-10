// [self-host] Upstream also re-exported `sendConversationMentionNotificationTask`
// here, but the enterprise module it imports from exports no such symbol and
// nothing else in the tree references it, so the re-export is dropped.
import {
  sendConversationMessageNotificationTask,
  sendConversationTeamMemberNotificationTask,
} from "@/ee/features/conversations/lib/trigger/conversation-message-notification";

export {
  sendConversationMessageNotificationTask,
  sendConversationTeamMemberNotificationTask,
};
