import {
	type UIMessage,
	optimisticallySendMessage,
	toUIMessages,
	useSmoothText,
	useThreadMessages,
} from "@convex-dev/agent/react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";
import { Loader2, Send } from "lucide-react";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/chat/$threadId")({
	component: ChatThread,
});

function MessageFormWrapper({ children }: { children: React.ReactNode }) {
	return (
		<div className="absolute bottom-0 left-0 w-full">
			<div className="pointer-events-none absolute bottom-0 z-10 w-full px-2">
				<div className="relative mx-auto flex w-full max-w-3xl flex-col text-center">
					<div className="pointer-events-auto">
						<div className="p-2 pb-0">{children}</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function MessageForm({
	sendMessage,
}: { sendMessage: (message: string) => void }) {
	const form = useForm({
		defaultValues: {
			message: "",
		},
		onSubmit: ({ value }) => {
			sendMessage(value.message);
		},
	});

	return (
		<form
			className="relative flex items-center space-x-2"
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<div className="flex flex-grow flex-col">
				<div className="flex flex-grow flex-row items-start">
					<form.Field name="message">
						{(field) => (
							<textarea
								id={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="Press Enter to send, Shift + Enter for new line"
								className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none min-h-[52px] max-h-32 text-sm bg-gray-50 focus:bg-white transition-all duration-200"
								rows={1}
							/>
						)}
					</form.Field>
				</div>
				<div className="-mb-px mt-2 flex w-full flex-row-reverse justify-between">
					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
					>
						{([canSubmit, isSubmitting]) => (
							<button
								type="submit"
								className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
								disabled={!canSubmit}
							>
								{isSubmitting ? (
									<Loader2 className="w-4 h-4 animate-spin" />
								) : (
									<Send className="w-4 h-4" />
								)}
							</button>
						)}
					</form.Subscribe>
				</div>
			</div>
		</form>
	);
}

function ChatThread() {
	const { threadId } = Route.useParams();
	const messages = useThreadMessages(
		api.chat.listThreadMessages,
		{
			threadId: threadId,
		},
		{ initialNumItems: 10, stream: true },
	);
	const sendMessage = useMutation(
		api.chat.streamChatAsynchronously,
	).withOptimisticUpdate(
		optimisticallySendMessage(api.chat.listThreadMessages),
	);

	return (
		<main className="flex w-full flex-1 flex-col overflow-hidden transition-[width,height] bg-gray-50">
			{/* Chat Messages Area */}
			<div
				className={cn(
					"absolute bottom-0 top-0 w-full overflow-hidden border-l border-t",
					"bg-fixed pb-[140px] transition-all",
				)}
			>
				{messages.results.length === 0 ? (
					<div className="px-8 text-center">
						<h2 className="mb-2 text-3xl font-semibold tracking-tight text-gray-800 md:text-3xl">
							How can I help you?
						</h2>
					</div>
				) : null}
				{messages.results.length > 0
					? toUIMessages(messages.results).map((message) => (
							<Message key={message.id} message={message} />
						))
					: null}
			</div>

			{/* Input Area */}
			<MessageFormWrapper>
				<MessageForm
					sendMessage={(prompt) => void sendMessage({ threadId, prompt })}
				/>
			</MessageFormWrapper>
		</main>
	);
}

function Message({ message }: { message: UIMessage }) {
	const isUser = message.role === "user";
	const [visibleText] = useSmoothText(message.content);
	return (
		<div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
			<div
				className={`rounded-lg px-4 py-2 max-w-lg whitespace-pre-wrap shadow-sm ${
					isUser ? "bg-blue-100 text-blue-900" : "bg-gray-200 text-gray-800"
				}`}
			>
				{visibleText}
			</div>
		</div>
	);
}
