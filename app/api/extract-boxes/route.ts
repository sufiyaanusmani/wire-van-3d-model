import { Groq } from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }
    
    const apiKey = process.env.GROQ_API_KEY;
    
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
          content: `Extract cargo item information from text. For each item mentioned, determine:
          - length (in cm)
          - width (in cm)
          - height (in cm)
          - weight (in kg)
          - shape (one of: "box", "cylinder", "sphere")
          
          Determine the most appropriate shape for each item:
          - For rectangular or cubic items, use "box"
          - For cylindrical objects like pipes, barrels, or tubes, use "cylinder"
          - For spherical items like balls, use "sphere"
          
          If dimensions, weight, or shape are not explicitly stated, use reasonable estimates.
          
          Return ONLY valid JSON in this exact format:
          {
            "boxes": [
              {
                "length": number,
                "width": number,
                "height": number,
                "weight": number,
                "shape": "box" | "cylinder" | "sphere"
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