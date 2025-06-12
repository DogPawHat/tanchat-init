import { optimisticallySendMessage } from "@convex-dev/agent/react";

import { createFileRoute } from "@tanstack/react-router";

import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";
import { Chat, ChatThread } from "~/features/chat/components/chat";

export const Route = createFileRoute("/chat/$threadId")({
	component: ChatThreadPage,
});

function ChatThreadPage() {
	const { threadId } = Route.useParams();

	const sendMessage = useMutation(
		api.chat.streamChatAsynchronously,
	).withOptimisticUpdate(
		optimisticallySendMessage(api.chat.listThreadMessages),
	);

	return (
		<main className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
			<div className="w-full max-w-4xl">
				<Chat sendMessage={(prompt) => void sendMessage({ threadId, prompt })}>
					<ChatThread threadId={threadId} />
				</Chat>
			</div>
		</main>
	);
}
