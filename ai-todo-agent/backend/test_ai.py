import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# 1. Load .env
load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
print(f"1. Checking API Key: {'FOUND' if api_key else 'MISSING'}")

if not api_key:
    print("❌ STOP: You must add GOOGLE_API_KEY to your .env file!")
    exit()

try:
    print("2. Connecting to Gemini...")
    # Initialize the model
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=api_key,
        temperature=0
    )
    
    # Test a simple message
    print("3. Sending test message...")
    response = llm.invoke("Hello, are you working?")
    print(f"✅ SUCCESS! AI Replied: {response.content}")

except Exception as e:
    print("\n❌ ERROR DETECTED:")
    print(str(e))
