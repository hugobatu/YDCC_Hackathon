# LLM Analysis Pipeline Architecture

## System Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT REQUEST                                   │
│  POST /api/analyze-with-llm                                                   │
│  {                                                                            │
│    "pool_id": "pool-test-001",                                               │
│    "species": "tom",                                                         │
│    "include_raw_prompt": false                                               │
│  }                                                                            │
└────────────────────────────────┬─────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                       API ENDPOINT (predict.py)                               │
│  @router.post("/analyze-with-llm")                                           │
└────────────────────────────────┬─────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    STEP 1: AUTO-FETCH FROM DATABASE                          │
│  ┌────────────────────────────────────────────────────────────────┐          │
│  │ Query: SELECT * FROM water_measurements                        │          │
│  │        WHERE pool_id = 'pool-test-001'                         │          │
│  │        ORDER BY created_at DESC                                │          │
│  │        LIMIT 24                                                │          │
│  └────────────────────────────────────────────────────────────────┘          │
│                                                                               │
│  Result: 24 measurements (2 hours of data @ 5-min intervals)                 │
│  ┌──────┬──────┬────┬────┬─────────┬─────────┬──────────┐                   │
│  │ time │ temp │ DO │ pH │ turbid. │ ammonia │ ...      │                   │
│  ├──────┼──────┼────┼────┼─────────┼─────────┼──────────┤                   │
│  │ t-24 │ 28.1 │6.5 │7.8 │  14.2   │  0.042  │          │                   │
│  │ t-23 │ 28.2 │6.4 │7.8 │  14.5   │  0.043  │          │                   │
│  │ ...  │ ...  │... │... │  ...    │  ...    │          │                   │
│  │ t-1  │ 28.5 │6.3 │7.9 │  14.8   │  0.045  │          │                   │
│  └──────┴──────┴────┴────┴─────────┴─────────┴──────────┘                   │
└────────────────────────────────┬─────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    STEP 2: PREDICTION SERVICE                                │
│  prediction_service.predict(history)                                         │
│  ┌────────────────────────────────────────────────────────────────┐          │
│  │ ML Model (LSTM/Transformer)                                    │          │
│  │ Input: 24 historical data points                               │          │
│  │ Output: Predicted values at t+30min                            │          │
│  └────────────────────────────────────────────────────────────────┘          │
│                                                                               │
│  Result:                                                                      │
│  ┌──────────────────────────────────────────────────────────┐                │
│  │ {                                                        │                │
│  │   "temperature": 28.3,                                   │                │
│  │   "dissolved_oxygen": 6.1,                               │                │
│  │   "ph": 7.8,                                             │                │
│  │   "turbidity": 15.2,                                     │                │
│  │   "ammonia": 0.048                                       │                │
│  │ }                                                        │                │
│  └──────────────────────────────────────────────────────────┘                │
└────────────────────────────────┬─────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    STEP 3: RISK ASSESSMENT                                   │
│  risk_engine.assess_risk(predictions, current, species)                      │
│  ┌────────────────────────────────────────────────────────────────┐          │
│  │ Compare predictions vs safe thresholds for species             │          │
│  │ Calculate risk level: LOW / MEDIUM / HIGH                      │          │
│  └────────────────────────────────────────────────────────────────┘          │
│                                                                               │
│  Result:                                                                      │
│  ┌──────────────────────────────────────────────────────────┐                │
│  │ {                                                        │                │
│  │   "level": "LOW",                                        │                │
│  │   "reasons": [                                           │                │
│  │     "Tất cả chỉ số trong ngưỡng an toàn"                │                │
│  │   ],                                                     │                │
│  │   "thresholds_used": {...}                               │                │
│  │ }                                                        │                │
│  └──────────────────────────────────────────────────────────┘                │
└────────────────────────────────┬─────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    STEP 4: LOAD NEWS DATA                                    │
│  llm_analysis_service.load_news_data()                                       │
│  ┌────────────────────────────────────────────────────────────────┐          │
│  │ Read all JSON files from app/news/                             │          │
│  │ - water_level.json                                             │          │
│  │ - water_flow.json                                              │          │
│  │ - weather_land_forecast_24h.json                               │          │
│  │ - hydrology_short_term_forecast.json                           │          │
│  │ - tide.json                                                    │          │
│  └────────────────────────────────────────────────────────────────┘          │
│                                                                               │
│  Result:                                                                      │
│  ┌──────────────────────────────────────────────────────────┐                │
│  │ {                                                        │                │
│  │   "water_level": {...},                                  │                │
│  │   "water_flow": {...},                                   │                │
│  │   "weather_land_forecast_24h": {...},                    │                │
│  │   "hydrology_short_term_forecast": {...},                │                │
│  │   "tide": {...}                                          │                │
│  │ }                                                        │                │
│  └──────────────────────────────────────────────────────────┘                │
└────────────────────────────────┬─────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    STEP 5: PREPARE CONTEXT                                   │
│  llm_analysis_service.prepare_context(...)                                   │
│  ┌────────────────────────────────────────────────────────────────┐          │
│  │ Combine all data into a single context object                  │          │
│  └────────────────────────────────────────────────────────────────┘          │
│                                                                               │
│  Context Object:                                                              │
│  ┌──────────────────────────────────────────────────────────┐                │
│  │ {                                                        │                │
│  │   "timestamp": "2026-01-25T00:15:00",                    │                │
│  │   "species": "tom",                                      │                │
│  │   "prediction": {...},                                   │                │
│  │   "current_values": {...},                               │                │
│  │   "risk_assessment": {...},                              │                │
│  │   "news": {...}                                          │                │
│  │ }                                                        │                │
│  └──────────────────────────────────────────────────────────┘                │
└────────────────────────────────┬─────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    STEP 6: FORMAT PROMPT                                     │
│  llm_analysis_service.format_prompt(...)                                     │
│  ┌────────────────────────────────────────────────────────────────┐          │
│  │ Load template from app/config/llm_prompt.txt                   │          │
│  │ Replace placeholders with actual data                          │          │
│  └────────────────────────────────────────────────────────────────┘          │
│                                                                               │
│  Formatted Prompt:                                                            │
│  ┌──────────────────────────────────────────────────────────┐                │
│  │ Bạn là chuyên gia phân tích chất lượng nước...           │                │
│  │                                                          │                │
│  │ 1. DỰ BÁO: { temperature: 28.3, ... }                   │                │
│  │ 2. HIỆN TẠI: { temperature: 28.5, ... }                 │                │
│  │ 3. RỦI RO: LOW - Tất cả chỉ số an toàn                  │                │
│  │ 4. TIN TỨC: {...}                                        │                │
│  │                                                          │                │
│  │ Hãy phân tích và trả về JSON...                         │                │
│  └──────────────────────────────────────────────────────────┘                │
└────────────────────────────────┬─────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    STEP 7: CALL LLM API                                      │
│  TODO: User integrates their chosen LLM here                                 │
│  ┌────────────────────────────────────────────────────────────────┐          │
│  │ Options:                                                       │          │
│  │ • OpenAI GPT-4                                                 │          │
│  │ • Google Gemini                                                │          │
│  │ • Anthropic Claude                                             │          │
│  │ • Local LLM (Ollama)                                           │          │
│  │ • Azure OpenAI                                                 │          │
│  │ • HuggingFace                                                  │          │
│  └────────────────────────────────────────────────────────────────┘          │
│                                                                               │
│  ┌─────────────────────┐                                                     │
│  │   Formatted Prompt  │                                                     │
│  └──────────┬──────────┘                                                     │
│             │                                                                 │
│             ▼                                                                 │
│  ┌──────────────────────────────────────────────┐                            │
│  │            LLM API Provider                  │                            │
│  │  ┌──────────────────────────────────────┐    │                            │
│  │  │  Process prompt                      │    │                            │
│  │  │  Generate analysis                   │    │                            │
│  │  │  Return JSON response                │    │                            │
│  │  └──────────────────────────────────────┘    │                            │
│  └──────────────────────────────────────────────┘                            │
│             │                                                                 │
│             ▼                                                                 │
│  ┌──────────────────────┐                                                    │
│  │   LLM JSON Response  │                                                    │
│  └──────────────────────┘                                                    │
└────────────────────────────────┬─────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    STEP 8: PARSE & STRUCTURE RESPONSE                        │
│  ┌────────────────────────────────────────────────────────────────┐          │
│  │ Parse JSON response from LLM                                   │          │
│  │ Validate structure                                             │          │
│  │ Add metadata                                                   │          │
│  └────────────────────────────────────────────────────────────────┘          │
│                                                                               │
│  LLM Analysis Result:                                                         │
│  ┌──────────────────────────────────────────────────────────┐                │
│  │ {                                                        │                │
│  │   "overall_assessment": "...",                           │                │
│  │   "potential_risks": [...],                              │                │
│  │   "recommendations": [...],                              │                │
│  │   "environmental_impact": "...",                         │                │
│  │   "priority_actions": [...]                              │                │
│  │ }                                                        │                │
│  └──────────────────────────────────────────────────────────┘                │
└────────────────────────────────┬─────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                         FINAL RESPONSE TO CLIENT                             │
│  ┌────────────────────────────────────────────────────────────────┐          │
│  │ {                                                              │          │
│  │   "analysis": {                                                │          │
│  │     "overall_assessment": "...",                               │          │
│  │     "potential_risks": [...],                                  │          │
│  │     "recommendations": [...],                                  │          │
│  │     "environmental_impact": "...",                             │          │
│  │     "priority_actions": [...]                                  │          │
│  │   },                                                           │          │
│  │   "context": {                                                 │          │
│  │     "timestamp": "2026-01-25T00:15:00",                        │          │
│  │     "species": "tom",                                          │          │
│  │     "prediction": {...},                                       │          │
│  │     "current_values": {...},                                   │          │
│  │     "risk_assessment": {...},                                  │          │
│  │     "news": {...}                                              │          │
│  │   },                                                           │          │
│  │   "raw_prompt": "..." (optional, for debugging)                │          │
│  │ }                                                              │          │
│  └────────────────────────────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Summary

```
Request → Database → Prediction → Risk → News → Context → Prompt → LLM → Response
  │          │           │          │       │       │        │       │        │
  │          │           │          │       │       │        │       │        └─→ Client
  │          │           │          │       │       │        │       │
  │          │           │          │       │       │        │       └─→ Parse JSON
  │          │           │          │       │       │        │
  │          │           │          │       │       │        └─→ Call API
  │          │           │          │       │       │           (OpenAI/Gemini/etc)
  │          │           │          │       │       │
  │          │           │          │       │       └─→ Template + Data = Prompt
  │          │           │          │       │
  │          │           │          │       └─→ Load all JSON files
  │          │           │          │
  │          │           │          └─→ Assess risk level
  │          │           │
  │          │           └─→ ML model predicts 30min ahead
  │          │
  │          └─→ Fetch 24 latest measurements
  │
  └─→ pool_id + species
```

## Components

| Component | File | Responsibility |
|-----------|------|----------------|
| API Endpoint | `app/api/predict.py` | Handle HTTP requests, orchestrate pipeline |
| LLM Service | `app/services/llm_analysis_service.py` | Format prompt, call LLM, parse response |
| Prediction Service | `app/services/prediction_service.py` | ML model for water quality prediction |
| Risk Engine | `app/services/risk_engine.py` | Assess risk based on thresholds |
| Database | PostgreSQL | Store water measurements |
| News Data | `app/news/*.json` | Environmental news/forecasts |
| Prompt Template | `app/config/llm_prompt.txt` | Customizable LLM prompt |

## Customization Points

1. **Prompt Template** (`app/config/llm_prompt.txt`)
   - Modify analysis instructions
   - Change output format
   - Add/remove sections

2. **LLM Provider** (`app/services/llm_analysis_service.py`)
   - Integrate your LLM API
   - See `llm_integration_examples.py` for templates

3. **News Sources** (`app/news/`)
   - Add more JSON files
   - Update existing data
   - Files auto-loaded

4. **Response Structure**
   - Modify schema in `app/schemas/schema_prediction.py`
   - Adjust parsing logic in service

## Performance Considerations

- **Database Query**: ~10-50ms (24 records)
- **ML Prediction**: ~50-200ms (model inference)
- **Risk Assessment**: ~5-10ms (threshold checks)
- **News Loading**: ~5-20ms (5 JSON files)
- **LLM API Call**: ~1-5s (varies by provider)

**Total Pipeline Time**: ~1-6 seconds (mostly LLM latency)

### Optimization Tips:
1. **Cache LLM responses** for similar contexts
2. **Use faster LLM models** (GPT-3.5 vs GPT-4)
3. **Parallel processing** where possible
4. **Database indexing** on pool_id + created_at
5. **News data caching** (reload only when updated)
