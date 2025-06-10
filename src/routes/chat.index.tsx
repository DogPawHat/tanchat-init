import { createFileRoute, redirect } from "@tanstack/react-router";
import { api } from "convex/_generated/api";

export const Route = createFileRoute("/chat/")({
	beforeLoad: async ({ context }) => {
		const { convexHttpClient } = context;
		const threadId = await convexHttpClient.mutation(api.chat.createThread);
		throw redirect({ to: "/chat/$threadId", params: { threadId } });
	},
});
