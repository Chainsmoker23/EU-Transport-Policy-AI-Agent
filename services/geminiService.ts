
import { GoogleGenAI, Chat } from '@google/genai';
import { type UploadedFile, type ChatMessage, ChatMessageRole } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

function buildSystemInstruction(files: UploadedFile[]): string {
    const fileNames = files.map(f => f.name).join(', ');
    const fileContext = fileNames ? `You have access to the following documents provided by the user: ${fileNames}.` : "The user has not uploaded any documents yet.";

    return `You are the EU Transport Policy AI Agent, an advanced AI system for analyzing transportation policies. Your responses must be well-structured, evidence-based, professional, and formatted in Markdown.
${fileContext}
When answering the user's query, you must act as if you have read and analyzed these documents. Generate insights, summaries, and recommendations based on the user's prompt and the context of the provided document titles.
You must cite the document names (e.g., "[Source: document_name.pdf]") when referencing information you are 'sourcing' from them.
If the user asks a question that cannot be answered from the provided documents, state that clearly and do not invent information.`;
}

export async function* streamChatResponse(
    message: string,
    files: UploadedFile[],
    history: ChatMessage[]
): AsyncGenerator<string, void, undefined> {
    
    const geminiHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    // Remove the last empty model message if it exists from history
    if (geminiHistory.length > 0 && geminiHistory[geminiHistory.length - 1].role === ChatMessageRole.MODEL) {
        geminiHistory.pop();
    }
    
    const chat: Chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: buildSystemInstruction(files),
        },
        history: geminiHistory,
    });
    
    try {
        const result = await chat.sendMessageStream({ message: message });

        for await (const chunk of result) {
            yield chunk.text;
        }
    } catch(e) {
        console.error("Gemini API Error:", e);
        yield "An error occurred while communicating with the AI. Please try again later.";
    }
}
