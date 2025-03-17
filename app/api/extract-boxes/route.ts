import { Groq } from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }
    
    const apiKey = process.env.GROQ_API_KEY; // Use server-side env variable (not NEXT_PUBLIC_)
    
    if (!apiKey) {
      console.error("Groq API key is not defined");
      return NextResponse.json({ error: "API configuration error" }, { status: 500 });
    }
    
    const groq = new Groq({ apiKey });
    
    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: `Extract cargo box information from text. For each item mentioned, determine:
          - length (in cm)
          - width (in cm)
          - height (in cm)
          - weight (in kg)
          
          If dimensions or weight are not explicitly stated, use reasonable estimates.
          Return ONLY valid JSON in this exact format:
          {
            "boxes": [
              {
                "length": number,
                "width": number,
                "height": number,
                "weight": number
              }
              // more boxes as needed
            ]
          }`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      return NextResponse.json({ error: "No content in response" }, { status: 500 });
    }
    
    // Parse content and return
    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
    
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}