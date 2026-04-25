# SupplyMind AI - RFQ Agent

A production-grade RFQ (Request for Quotation) Agent for the intelligent procurement platform "SupplyMind AI". This service evaluates vendor quotations, applies multi-factor scoring (price, delivery, rating), and uses an LLM (OpenAI or Groq) to generate an explanation of the best choice.

## Architecture

The project follows a modular design to easily integrate future agents like Risk and Price Intelligence.

```
app/
  main.py
  core/
    config.py
    database.py
  models/
    vendor.py
  schemas/
    vendor_schema.py
    rfq_schema.py
  services/
    rfq_service.py
    scoring_service.py
    llm_service.py
  routes/
    rfq_routes.py
```

## Features
- Multi-factor scoring logic with Min-Max normalization.
- Advanced Logic: Penalizes vendors with very high delivery times.
- AI Explanation Layer: Integrates with OpenAI or Groq API (fallback to mock explanation if keys are missing).
- Configurable thresholds and environment via `.env`.

## Setup Instructions

1. Clone or download the repository.
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure Environment Variables:
   Copy `.env.example` to `.env` and fill in the details.
   ```bash
   DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/supplymind
   OPENAI_API_KEY=your_openai_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   AUTO_SEED_DATA=true
   ```

## How to Run Locally

Start the FastAPI application with Uvicorn:
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://127.0.0.1:8000`. You can access the auto-generated Swagger UI at `http://127.0.0.1:8000/docs`.

## Example API Request / Response

### Evaluate RFQ

**Request:**
```bash
curl -X 'GET' \
  'http://127.0.0.1:8000/rfq?product=steel&quantity=100' \
  -H 'accept: application/json'
```

**Response:**
```json
{
  "product": "steel",
  "best_vendor": {
    "name": "Rapid Supply Co",
    "product": "steel",
    "price": 515.0,
    "delivery_days": 4,
    "rating": 4.8,
    "id": 3
  },
  "vendor_comparison": [
    {
      "vendor": {
        "name": "Rapid Supply Co",
        "product": "steel",
        "price": 515.0,
        "delivery_days": 4,
        "rating": 4.8,
        "id": 3
      },
      "score": 0.8
    },
    ...
  ],
  "explanation": "Rapid Supply Co is the best choice because it offers a strong balance of cost, delivery speed, and supplier reliability for steel. Its price (515.00) compares favorably against the market average (491.67), delivery time (4 days) is competitive vs average (6.0 days), and rating (4.8/5) is above the group benchmark (4.5/5)."
}
```
