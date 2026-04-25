from typing import List
import httpx

from app.models.vendor import Vendor
from app.core.config import settings

def _mock_explanation(best_vendor: Vendor, all_vendors: List[Vendor]) -> str:
    avg_price = sum(v.price for v in all_vendors) / len(all_vendors)
    avg_delivery = sum(v.delivery_days for v in all_vendors) / len(all_vendors)
    avg_rating = sum(v.rating for v in all_vendors) / len(all_vendors)

    return (
        f"{best_vendor.name} is the best choice because it offers a strong balance of "
        f"cost, delivery speed, and supplier reliability for {best_vendor.product}. "
        f"Its price ({best_vendor.price:.2f}) compares favorably against the market average "
        f"({avg_price:.2f}), delivery time ({best_vendor.delivery_days} days) is competitive "
        f"vs average ({avg_delivery:.1f} days), and rating ({best_vendor.rating:.1f}/5) is "
        f"above the group benchmark ({avg_rating:.1f}/5)."
    )

def generate_explanation(best_vendor: Vendor, all_vendors: List[Vendor]) -> str:
    """
    LLM explanation generation.
    Falls back to deterministic mock text when API keys are unavailable.
    """
    if not settings.OPENAI_API_KEY and not settings.GROQ_API_KEY:
        return _mock_explanation(best_vendor, all_vendors)

    try:
        vendor_data = "\n".join([f"- {v.name}: Price {v.price}, Delivery {v.delivery_days} days, Rating {v.rating}/5" for v in all_vendors])
        prompt = (
            f"You are an AI procurement assistant. Explain concisely (2-3 sentences) why {best_vendor.name} "
            f"was selected as the best vendor among the following options for the product '{best_vendor.product}'. "
            f"Mention trade-offs in price, delivery, and rating.\n\nVendors:\n{vendor_data}"
        )

        if settings.OPENAI_API_KEY:
            # Call OpenAI API
            response = httpx.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 150,
                    "temperature": 0.7
                },
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"].strip()
        
        elif settings.GROQ_API_KEY:
            # Call Groq API
            response = httpx.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}"},
                json={
                    "model": "llama3-8b-8192",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 150,
                    "temperature": 0.7
                },
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"].strip()
            
    except Exception:
        # Fallback is deterministic to ensure endpoint reliability
        return _mock_explanation(best_vendor, all_vendors)
