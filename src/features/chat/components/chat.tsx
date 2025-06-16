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
		<div className="h-full flex flex-col">
			{/* Chat Thread (scrollable) */}
			<div className="flex-1 overflow-auto">
				<div className="flex flex-col gap-4 p-4 min-h-full">
					{props.children}
				</div>
			</div>

			{/* Input Area (stuck to bottom of viewport) */}
			<div className="flex-shrink-0 border-t bg-white">
				<div className="p-4">
					<ChatBox sendMessage={props.sendMessage} />
				</div>
			</div>
		</div>
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
			form.reset();
		},
	});

	return (
		<form
			className="flex items-end space-x-3"
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<div className="flex-1">
				<form.Field name="message">
					{(field) => (
						<Textarea
							id={field.name}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									form.handleSubmit();
								}
							}}
							placeholder="Type your message... (Press Enter to send, Shift + Enter for new line)"
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none min-h-[52px] max-h-32 text-sm transition-all duration-200"
							rows={1}
						/>
					)}
				</form.Field>
			</div>
			<form.Subscribe
				selector={(state) => [state.canSubmit, state.isSubmitting]}
			>
				{([canSubmit, isSubmitting]) => (
					<Button
						type="submit"
						className="p-3 bg-purple-600 hover:bg-purple-700 rounded-lg"
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
		</form>
	);
}
