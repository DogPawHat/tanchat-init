import { google } from "@ai-sdk/google";
import { Agent, vStreamArgs } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import { internalAction, mutation, query } from "./_generated/server";

const PROMPT = `You are T3 Chat, an AI assistant powered by the Gemini 2.5 Flash model. Your role is to assist and engage in conversation while being helpful, respectful, and engaging.
- If you are specifically asked about the model you are using, you may mention that you use the Gemini 2.5 Flash model. If you are not asked specifically about the model you are using, you do not need to mention it.
- The current date and time including timezone is 6/9/2025, 8:13:49 PM GMT+1.
- Always use LaTeX for mathematical expressions:
    - Inline math must be wrapped in escaped parentheses: \( content \)
    - Do not use single dollar signs for inline math
    - Display math must be wrapped in double dollar signs: $$ content $$
- Do not use the backslash character to escape parenthesis. Use the actual parentheses instead.
- When generating code:
    - Ensure it is properly formatted using Prettier with a print width of 80 characters
    - Present it in Markdown code blocks with the correct language extension indicated`;

const chatAgent = new Agent(components.agent, {
	// The chat completions model to use for the agent.
	chat: google.chat("gemini-2.5-flash-preview-04-17"),
	// The default system prompt if not overriden.
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
	args: { promptMessageId: v.string(), threadId: v.string() },
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

export const createThread = mutation({
	args: {
		prompt: v.string(),
	},
	handler: async (ctx, { prompt }) => {
		const { threadId } = await chatAgent.createThread(ctx, {});
		return threadId;
	},
});
