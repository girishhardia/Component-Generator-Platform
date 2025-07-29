import type { NextApiResponse } from 'next';
import withAuth, { NextApiRequestWithUser } from '@/middleware/withAuth';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const handler = async (req: NextApiRequestWithUser, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { chatHistory, currentCode } = req.body;

  if (!chatHistory || chatHistory.length === 0) {
    return res.status(400).json({ success: false, error: 'Chat history is required.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const lastUserMessage = chatHistory[chatHistory.length - 1].content;
    const isInitialPrompt = chatHistory.length <= 1;

    // --- Prompt Engineering ---
    const prompt = isInitialPrompt 
      ? `You are an expert React and Tailwind CSS developer. Create a single, self-contained React component using TypeScript (TSX) and vanilla CSS based on the user's request.
        
        **Constraints:**
        - Provide the TSX code and CSS code separately.
        - The component should be functional and use hooks.
        - Do not include any external dependencies other than React.
        - The generated TSX must be a single default export.
        
        **Output Format:**
        Respond ONLY with a single minified JSON object containing two keys: "tsx" and "css". Example: {"tsx":"...","css":"..."}

        **User Request:**
        "${lastUserMessage}"`
      : `You are an expert React and Tailwind CSS developer. Your task is to modify the provided component code based on the user's request.

        **Existing TSX Code:**
        \`\`\`tsx
        ${currentCode.tsx}
        \`\`\`

        **Existing CSS Code:**
        \`\`\`css
        ${currentCode.css}
        \`\`\`

        **Modification Request:**
        "${lastUserMessage}"

        **Instructions:**
        - Apply the change to the code. Provide the complete, updated TSX and CSS.
        - Respond ONLY with a single minified JSON object containing two keys: "tsx" and "css". Example: {"tsx":"...","css":"..."}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response to ensure it's valid JSON
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const generatedCode = JSON.parse(cleanedText);

    res.status(200).json({ success: true, data: generatedCode });

  } catch (error) {
    console.error("AI Generation Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during AI generation.';
    res.status(500).json({ success: false, error: errorMessage });
  }
};

export default withAuth(handler);