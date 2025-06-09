import { createFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const [message, setMessage] = useState("");

	return (
		<div className="flex h-screen bg-gray-50">
			{/* Main Chat Area */}
			<div className="flex-1 flex flex-col bg-white md:ml-0">
				{/* Chat Messages Area */}
				<div className="flex-1 flex items-center justify-center bg-gradient-to-b from-white to-gray-50 pt-16 md:pt-0">
					<div className="text-center px-8">
						<h1 className="text-3xl md:text-3xl font-semibold text-gray-800 mb-2 tracking-tight">
							How can I help you?
						</h1>
					</div>
				</div>

				{/* Input Area */}
				<div className="border-t border-gray-100 p-4 md:p-6 bg-white">
					<div className="max-w-4xl mx-auto">
						<div className="flex items-end space-x-2 md:space-x-3">
							<div className="flex-1 relative">
								<textarea
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									placeholder="Press Enter to send, Shift + Enter for new line"
									className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none min-h-[52px] max-h-32 text-sm bg-gray-50 focus:bg-white transition-all duration-200"
									rows={1}
								/>
							</div>
							<button
								type="button"
								className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
							>
								<Send className="w-4 h-4" />
							</button>
							<button
								type="button"
								className="p-3 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-50 transition-all duration-200"
							>
								<img
									src="https://ext.same-assets.com/3186787522/3435531713.svg"
									alt="Settings"
									className="w-4 h-4"
								/>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
