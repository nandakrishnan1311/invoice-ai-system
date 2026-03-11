import os
from providers.base_provider import BaseAIProvider

def get_ai_provider() -> BaseAIProvider:
    provider = os.getenv("AI_PROVIDER", "gemini").lower()
    
    if provider == "gemini":
        from providers.gemini_provider import GeminiProvider
        return GeminiProvider()
    elif provider == "openai":
        from providers.openai_provider import OpenAIProvider
        return OpenAIProvider()
    elif provider == "huggingface":
        from providers.huggingface_provider import HuggingFaceProvider
        return HuggingFaceProvider()
    else:
        print(f"Unknown provider '{provider}', falling back to Gemini")
        from providers.gemini_provider import GeminiProvider
        return GeminiProvider()
