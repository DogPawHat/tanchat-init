import { useQuery } from "convex/react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { MessageSquare, Plus, Trash } from "lucide-react";
import { api } from "convex/_generated/api";
import { Button } from "~/components/ui/button";
import { useMutation } from "convex/react";

export function ThreadSidebar() {
	const location = useLocation();
	const navigate = useNavigate();
	const currentThreadId =
		location.pathname.startsWith("/chat/") && location.pathname !== "/chat"
			? location.pathname.split("/")[2]
			: undefined;
	const threads = useQuery(api.chat.listThreads);
	const deleteThread = useMutation(api.chat.deleteThread);

	if (!threads) {
		return (
			<div className="w-72 bg-white border-r border-gray-200 p-4">
				<div className="animate-pulse space-y-3">
					<div className="h-4 bg-gray-200 rounded w-3/4"></div>
					<div className="h-4 bg-gray-200 rounded w-1/2"></div>
					<div className="h-4 bg-gray-200 rounded w-2/3"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full">
			{/* Header */}
			<div className="p-4 border-b border-gray-200">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-gray-800">Chat History</h2>
					<Link to="/chat">
						<Button size="sm" variant="outline" className="p-2">
							<Plus className="h-4 w-4" />
						</Button>
					</Link>
				</div>
			</div>

			{/* Thread List */}
			<div className="flex-1 overflow-y-auto p-2">
				{threads.page.map((thread) => (
					<div key={thread._id} className="relative group">
						<Link
							to="/chat/$threadId"
							params={{ threadId: thread._id }}
							className={`block w-full p-3 mb-2 rounded-lg text-left hover:bg-gray-50 transition-colors ${
								currentThreadId === thread._id
									? "bg-blue-50 border border-blue-200"
									: "border border-transparent"
							}`}
						>
							<div className="flex items-start space-x-3">
								<MessageSquare
									className={`h-4 w-4 mt-1 flex-shrink-0 ${
										currentThreadId === thread._id
											? "text-blue-600"
											: "text-gray-400"
									}`}
								/>
								<div className="flex-1 min-w-0">
									<p
										className={`text-sm font-medium truncate ${
											currentThreadId === thread._id
												? "text-blue-900"
												: "text-gray-900"
										}`}
									>
										{thread.title || "New Chat"}
									</p>
									<p className="text-xs text-gray-500 mt-1">
										{new Date(thread._creationTime).toLocaleDateString()}
									</p>
								</div>
							</div>
						</Link>
						<Button
							variant="ghost"
							size="icon"
							className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
							onClick={async (e) => {
								e.preventDefault();
								e.stopPropagation();
								if (
									window.confirm("Delete this thread? This cannot be undone.")
								) {
									await deleteThread({ threadId: thread._id });
									if (currentThreadId === thread._id) {
										navigate({ to: "/chat" });
									}
								}
							}}
							title="Delete thread"
						>
							<Trash className="h-4 w-4 text-red-500" />
						</Button>
					</div>
				))}

				{threads.page.length === 0 && (
					<div className="text-center py-8 text-gray-500">
						<MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
						<p className="text-sm">No conversations yet</p>
						<p className="text-xs mt-1">Start a new chat to begin</p>
					</div>
				)}
			</div>
		</div>
	);
}
