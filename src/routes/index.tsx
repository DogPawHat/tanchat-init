import { createFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/")({
	component: App,
});

function MessageForm() {
	const [message, setMessage] = useState("");

	return (
		<div className="absolute bottom-0 left-0 w-full">
			<div className="pointer-events-none absolute bottom-0 z-10 w-full px-2">
				<div className="relative mx-auto flex w-full max-w-3xl flex-col text-center">
					<div className="pointer-events-auto">
						<div className="p-2 pb-0">
							<form className="relative flex items-center space-x-2">
								<div className="flex flex-grow flex-col">
									<div className="flex flex-grow flex-row items-start">
										<textarea
											value={message}
											onChange={(e) => setMessage(e.target.value)}
											placeholder="Press Enter to send, Shift + Enter for new line"
											className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none min-h-[52px] max-h-32 text-sm bg-gray-50 focus:bg-white transition-all duration-200"
											rows={1}
										/>
									</div>
									<div className="-mb-px mt-2 flex w-full flex-row-reverse justify-between">
										<button
											type="button"
											className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
										>
											<Send className="w-4 h-4" />
										</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function App() {
	return (
		<main className="flex w-full flex-1 flex-col overflow-hidden transition-[width,height] bg-gray-50">
			{/* Chat Messages Area */}
			<div
				className={cn(
					"absolute bottom-0 top-0 w-full overflow-hidden border-l border-t",
					"bg-fixed pb-[140px] transition-all",
				)}
			>
				<div className="px-8 text-center">
					<h2 className="mb-2 text-3xl font-semibold tracking-tight text-gray-800 md:text-3xl">
						How can I help you?
					</h2>
				</div>
			</div>

			{/* Input Area */}
			<MessageForm />
		</main>
	);
}

export default App;
