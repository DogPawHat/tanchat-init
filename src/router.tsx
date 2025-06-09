import { ConvexQueryClient } from "@convex-dev/react-query";
import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";

import { env } from "~/env/client";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import "./styles.css";
import { QueryClient } from "@tanstack/react-query";
import { ConvexProvider } from "convex/react";

// Create a new router instance
export const createRouter = () => {
	const CONVEX_URL = env.VITE_CONVEX_URL;
	if (!CONVEX_URL) {
		console.error("missing envar VITE_CONVEX_URL");
	}
	const convexQueryClient = new ConvexQueryClient(CONVEX_URL);

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				queryKeyHashFn: convexQueryClient.hashFn(),
				queryFn: convexQueryClient.queryFn(),
			},
		},
	});
	convexQueryClient.connect(queryClient);

	const router = routerWithQueryClient(
		createTanstackRouter({
			routeTree,
			context: {
				queryClient,
			},
			scrollRestoration: true,
			defaultPreloadStaleTime: 0,
			Wrap: ({ children }) => (
				<ConvexProvider client={convexQueryClient.convexClient}>
					{children}
				</ConvexProvider>
			),
		}),
		queryClient,
	);

	return router;
};

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof createRouter>;
	}
}
