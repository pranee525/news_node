from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/.env')

from emergentintegrations.llm.chat import LlmChat, UserMessage

app = FastAPI(title="Headlinez AI Service")

EMERGENT_KEY = os.environ.get('GEMINI_API_KEY', '')

class HashtagRequest(BaseModel):
    titles: List[str]

class HashtagResponse(BaseModel):
    success: bool
    hashtags: List[str]

@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai"}

@app.post("/hashtags", response_model=HashtagResponse)
async def generate_hashtags(request: HashtagRequest):
    default_hashtags = ['#WorldNews', '#Technology', '#Economy', '#Health', '#Politics', '#Science']
    
    if not request.titles:
        return HashtagResponse(success=True, hashtags=default_hashtags)
    
    try:
        if not EMERGENT_KEY:
            return HashtagResponse(success=True, hashtags=default_hashtags)
        
        # Initialize chat with Gemini
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"hashtags_{id(request)}",
            system_message="You are a helpful assistant that generates trending hashtags from news titles. Always respond with ONLY a JSON array of hashtag strings."
        ).with_model("gemini", "gemini-2.0-flash")
        
        prompt = f"""Based on these news titles, generate 6 trending hashtags that represent the current news landscape. Return ONLY a JSON array of strings, no other text.

Titles:
{chr(10).join(request.titles[:10])}

Respond with only the JSON array like: ["#Hashtag1", "#Hashtag2", ...]"""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        if response:
            # Clean up response
            text = response.strip()
            if text.startswith('```'):
                text = text.replace('```json', '').replace('```', '').strip()
            
            import json
            hashtags = json.loads(text)
            if isinstance(hashtags, list) and len(hashtags) > 0:
                return HashtagResponse(success=True, hashtags=hashtags[:6])
        
        return HashtagResponse(success=True, hashtags=default_hashtags)
        
    except Exception as e:
        print(f"AI Error: {e}")
        return HashtagResponse(success=True, hashtags=default_hashtags)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
