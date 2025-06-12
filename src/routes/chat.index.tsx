import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { Chat } from "~/features/chat/components/chat";
import { api } from "convex/_generated/api";
import { useCallback } from "react";
import { optimisticallySendMessage } from "@convex-dev/agent/react";

export const Route = createFileRoute("/chat/")({
	component: ChatInitialPage,
});

function ChatInitialPage() {
	const navigate = Route.useNavigate();
	const createThreadWithFirstMessage = useMutation(
		api.chat.createThreadWithFirstMessage,
	).withOptimisticUpdate(
		optimisticallySendMessage(api.chat.listThreadMessages),
	);

	const sendMessage = useCallback(
		async (prompt: string) => {
			const { threadId } = await createThreadWithFirstMessage({
				prompt,
			});
			navigate({ to: "/chat/$threadId", params: { threadId } });
		},
		[navigate, createThreadWithFirstMessage],
	);

	return (
		<Chat sendMessage={sendMessage}>
			<div className="px-8 text-center">
				<h2 className="mb-2 text-3xl font-semibold tracking-tight text-gray-800 md:text-3xl">
					How can I help you?
				</h2>
			</div>
		</Chat>
	);
}
