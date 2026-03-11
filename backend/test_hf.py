from huggingface_hub import InferenceClient
import os
from dotenv import load_dotenv
load_dotenv()

client = InferenceClient(token=os.getenv('HUGGINGFACE_API_KEY'))

# Check version
import huggingface_hub
print(f"huggingface_hub version: {huggingface_hub.__version__}")

models = [
    "Qwen/Qwen2.5-7B-Instruct",
    "mistralai/Mixtral-8x7B-Instruct-v0.1",
    "meta-llama/Llama-3.1-8B-Instruct",
    "HuggingFaceH4/zephyr-7b-beta",
]

for model in models:
    try:
        print(f"Testing: {model} ... ", end="", flush=True)
        
        # Try new API style
        if hasattr(client, 'chat'):
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": "Reply: WORKING"}],
                max_tokens=10
            )
            result = response.choices[0].message.content.strip()
        else:
            # Old API style
            response = client.chat_completion(
                messages=[{"role": "user", "content": "Reply: WORKING"}],
                model=model,
                max_tokens=10
            )
            result = response.choices[0].message.content.strip()
        
        print(f"✅ WORKS! → {result}")
        print(f"\nUSE THIS MODEL: {model}")
        break
    except Exception as e:
        print(f"❌ {str(e)[:80]}")