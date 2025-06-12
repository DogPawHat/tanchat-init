import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ThreadSidebar } from "~/features/chat/components/thread-sidebar";

export const Route = createFileRoute("/chat")({
	component: ChatLayout,
});

function ChatLayout() {
	return (
		<div className="bg-gray-50 min-h-screen flex">
			<ThreadSidebar />
			<main className="flex-1 flex items-center justify-center p-4">
				<div className="w-full max-w-4xl">
					<Outlet />
				</div>
			</main>
		</div>
	);
}
