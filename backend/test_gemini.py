from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
print(f"API Key found: {api_key[:10]}..." if api_key else "NO API KEY FOUND!")

try:
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents='Say hello in one word'
    )
    print(f"Gemini response: {response.text}")
    print("SUCCESS! Gemini API is working!")
except Exception as e:
    print(f"ERROR: {e}")