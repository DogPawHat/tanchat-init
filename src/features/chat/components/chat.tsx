import { StickToBottom } from "use-stick-to-bottom";
import { useForm } from "@tanstack/react-form";
import {
	type UIMessage,
	useSmoothText,
	useThreadMessages,
	toUIMessages,
} from "@convex-dev/agent/react";
import { Loader2, Send } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { api } from "convex/_generated/api";

export function Chat(props: {
	children: React.ReactNode;
	sendMessage: (prompt: string) => void;
}) {
	return (
		<StickToBottom className="h-[60vh] relative" resize="smooth">
			<StickToBottom.Content className="flex flex-col gap-4 px-4">
				{props.children}
			</StickToBottom.Content>

			{/* Input Area */}
			<div className="px-4 pt-4">
				<ChatBox sendMessage={props.sendMessage} />
			</div>
		</StickToBottom>
	);
}

export function ChatThread(props: { threadId: string }) {
	const { threadId } = props;
	const messages = useThreadMessages(
		api.chat.listThreadMessages,
		{
			threadId: threadId,
		},
		{ initialNumItems: 10, stream: true },
	);

	return (
		<>
			{toUIMessages(messages?.results ?? []).map((message) => (
				<Message key={message.id} message={message} />
			))}
		</>
	);
}

function Message(props: { message: UIMessage }) {
	const isUser = props.message.role === "user";
	const [visibleText] = useSmoothText(props.message.content);
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

function ChatBox({ sendMessage }: { sendMessage: (message: string) => void }) {
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
							<Textarea
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
							<Button
								type="submit"
								className="p-3 bg-purple-600 hover:bg-purple-700"
								disabled={!canSubmit}
							>
								{isSubmitting ? (
									<Loader2 className="w-4 h-4 animate-spin" />
								) : (
									<Send className="w-4 h-4" />
								)}
							</Button>
						)}
					</form.Subscribe>
				</div>
			</div>
		</form>
	);
}
