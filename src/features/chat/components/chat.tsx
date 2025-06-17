import { useForm } from "@tanstack/react-form";
import {
	type UIMessage,
	useSmoothText,
	useThreadMessages,
	toUIMessages,
} from "@convex-dev/agent/react";
import { Loader2, Send } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { api } from "convex/_generated/api";

export function Chat(props: {
	children: React.ReactNode;
	sendMessage: (prompt: string) => void;
}) {
	const chatContainerRef = useRef<HTMLDivElement>(null);

	// Auto-scroll to bottom when children change (new messages)
	useEffect(() => {
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
		}
	}, [props.children]);

	return (
		<div className="h-full flex flex-col bg-white rounded-lg shadow-sm mx-2 my-2">
			{/* Chat Thread (scrollable) */}
			<div 
				ref={chatContainerRef}
				className="flex-1 overflow-auto"
			>
				<div className="flex flex-col gap-1 p-3 min-h-full">
					{props.children}
				</div>
			</div>

			{/* Input Area (stuck to bottom of viewport) */}
			<div className="flex-shrink-0 border-t bg-white rounded-b-lg">
				<div className="p-3">
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
		<div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-1`}>
			<div
				className={`rounded-2xl px-3 py-2 max-w-[280px] whitespace-pre-wrap text-sm leading-relaxed ${
					isUser 
						? "bg-blue-500 text-white rounded-br-sm" 
						: "bg-gray-100 text-gray-800 rounded-bl-sm"
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
			className="flex items-end space-x-2"
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
							placeholder="Type your message..."
							className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[40px] max-h-32 text-sm transition-all duration-200"
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
						className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center"
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
