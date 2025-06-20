import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { Agent, vStreamArgs } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import { internalAction, mutation, query } from "./_generated/server";

const PROMPT = `You are CC Chat, an AI assistant powered by the Gemini 2.5 Flash model. Your role is to assist and engage in conversation while being helpful, respectful, and engaging.
- If you are specifically asked about the model you are using, you may mention that you use the Gemini 2.5 Flash model. If you are not asked specifically about the model you are using, you do not need to mention it.
- Always use LaTeX for mathematical expressions:
    - Inline math must be wrapped in escaped parentheses: ( content )
    - Do not use single dollar signs for inline math
    - Display math must be wrapped in double dollar signs: $$ content $$
- Do not use the backslash character to escape parenthesis. Use the actual parentheses instead.
- When generating code:
    - Ensure it is properly formatted using Prettier with a print width of 80 characters
    - Present it in Markdown code blocks with the correct language extension indicated`;

export const generateTitle = internalAction({
	args: { message: v.string(), threadId: v.string() },
	handler: async (ctx, { message, threadId }) => {
		const systemPrompt =
			"Your one and only role is to generate a summary for a thread based on the first message.";
		const prompt = `Generate a summary based on the following message: ${message}`;

		const result = await generateText({
			model: openrouter("google/gemini-2.5-flash-preview-04-17"),
			system: systemPrompt,
			prompt,
		});

		await ctx.runMutation(components.agent.threads.updateThread, {
			threadId,
			patch: {
				title: result.text,
			},
		});
	},
});

const chatAgent = new Agent(components.agent, {
	// The chat completions model to use for the agent.
	chat: openrouter("google/gemini-2.5-flash-preview-04-17"),
	instructions: PROMPT,
});

export const streamChatAsynchronously = mutation({
	args: { prompt: v.string(), threadId: v.string() },
	handler: async (ctx, { prompt, threadId }) => {
		const { messageId } = await chatAgent.saveMessage(ctx, {
			threadId,
			prompt,
			// we're in a mutation, so skip embeddings for now. They'll be generated
			// lazily when streaming text.
			skipEmbeddings: true,
		});
		await ctx.scheduler.runAfter(0, internal.chat.streamChat, {
			threadId,
			promptMessageId: messageId,
		});
	},
});

export const streamChat = internalAction({
	args: {
		promptMessageId: v.string(),
		threadId: v.string(),
	},
	handler: async (ctx, { promptMessageId, threadId }) => {
		const { thread } = await chatAgent.continueThread(ctx, { threadId });

		const result = await thread.streamText(
			{ promptMessageId },
			{ saveStreamDeltas: true },
		);
		await result.consumeStream();
	},
});

export const listThreadMessages = query({
	args: {
		threadId: v.string(),
		paginationOpts: paginationOptsValidator,
		streamArgs: vStreamArgs,
		//... other arguments you want
	},
	handler: async (ctx, { threadId, paginationOpts, streamArgs }) => {
		// await authorizeThreadAccess(ctx, threadId);
		const paginated = await chatAgent.listMessages(ctx, {
			threadId,
			paginationOpts,
		});
		const streams = await chatAgent.syncStreams(ctx, { threadId, streamArgs });
		// Here you could filter out / modify the documents & stream deltas.
		return { ...paginated, streams };
	},
});

export const createThreadWithFirstMessage = mutation({
	args: { prompt: v.string() },
	handler: async (ctx, { prompt }) => {
		const { threadId } = await chatAgent.createThread(ctx, {
			userId: "default",
			title: "Generating title...",
		});
		const { messageId } = await chatAgent.saveMessage(ctx, {
			threadId,
			prompt,
			skipEmbeddings: true,
		});
		void ctx.scheduler.runAfter(0, internal.chat.generateTitle, {
			message: prompt,
			threadId,
		});
		void ctx.scheduler.runAfter(0, internal.chat.streamChat, {
			threadId,
			promptMessageId: messageId,
		});
		return { threadId, messageId };
	},
});

export const listThreads = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.runQuery(components.agent.threads.listThreadsByUserId, {
			userId: "default", // For now using a default user
			order: "desc",
			paginationOpts: { cursor: null, numItems: 20 },
		});
	},
});

export const deleteThread = mutation({
	args: { threadId: v.string() },
	handler: async (ctx, { threadId }) => {
		await ctx.runMutation(components.agent.threads.deleteAllForThreadIdAsync, {
			threadId,
		});
	},
});

export const getThreadWithFirstMessage = query({
	args: { threadId: v.string() },
	handler: async (ctx, { threadId }) => {
		const thread = await ctx.runQuery(components.agent.threads.getThread, {
			threadId,
		});

		if (!thread) return null;

		// Get the first user message for display
		const messages = await chatAgent.listMessages(ctx, {
			threadId,
			paginationOpts: { cursor: null, numItems: 1 },
		});

		const firstMessage = messages.page.find(
			(msg) => msg.message?.role === "user",
		);

		return {
			...thread,
			firstMessage: firstMessage?.text || null,
		};
	},
});
