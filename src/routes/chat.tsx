import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/chat")({
	component: ChatLayout,
});

function ChatLayout() {
	return (
		<main className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
			<div className="w-full max-w-4xl">
				<Outlet />
			</div>
		</main>
	);
}
