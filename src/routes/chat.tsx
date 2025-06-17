import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ThreadSidebar } from "~/features/chat/components/thread-sidebar";

export const Route = createFileRoute("/chat")({
	component: ChatLayout,
});

function ChatLayout() {
	return (
		<div className="bg-gray-50 h-screen flex">
			<ThreadSidebar />
			<main className="flex-1 flex flex-col items-center">
				<div className="w-full max-w-2xl h-full flex flex-col">
					<Outlet />
				</div>
			</main>
		</div>
	);
}
