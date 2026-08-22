# CropAdvisorAI — AI Architecture & Implementation Details

> Document version: 1.0  
> Stack: React + Vite + Tailwind CSS + Supabase (Lovable Cloud) + Lovable AI Gateway

---

## A. Pest & Disease Detection

### How it works

1. Farmer captures or uploads a leaf/plant photo from the **Pest** page.
2. The browser compresses the image to **1024 px JPEG** using Canvas (`createImageBitmap` + `canvas.toBlob`).
3. The compressed image is sent as a **base64 data URL** to the `pest-detect` Supabase Edge Function.
4. The Edge Function calls the Lovable AI Gateway `/v1/chat/completions` endpoint.
5. Gemini analyzes the image and returns a strict JSON diagnosis.

### Model used

- **Model:** `google/gemini-2.5-flash`
- **Gateway:** Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`)
- **Input:** Multimodal — text prompt + image URL (base64 data URL)
- **Output format (JSON):**
  ```json
  {
    "crop": "detected crop or empty string",
    "diagnosis": "pest or disease name",
    "severity": "Mild | Moderate | Severe",
    "treatment": "actionable steps including organic + chemical options",
    "confidence": "High | Medium | Low"
  }
  ```

### Is a Hugging Face or custom trained model used?

**No.** We do **not** use a custom TensorFlow, PyTorch, or Hugging Face model for pest detection. The diagnosis is performed entirely by Google's Gemini vision-language model through the Lovable AI Gateway.

### Performance optimization

- Client-side image compression reduces payload size by ~10× compared to a raw phone photo.
- AI diagnosis and Supabase Storage upload run **in parallel**.
- Typical end-to-end time: **3–5 seconds** on a compressed image.

---

## D. Crop Recommendation

### How it works

The farmer enters soil NPK values, pH, season, and crop details on the **Crops** page. The `crop-recommend` Edge Function sends this data to Gemini and asks for a ranked JSON list of recommended crops.

### Model used

- **Model:** `google/gemini-2.5-flash`
- **Gateway:** Lovable AI Gateway
- **Output format (JSON):**
  ```json
  {
    "recommendations": [
      {
        "crop": "crop name",
        "confidence": "High | Medium | Low",
        "reason": "short reason <= 30 words",
        "tips": "actionable tips"
      }
    ]
  }
  ```

### What kind of system is this?

| Approach | Used? | Notes |
|---|---|---|
| Custom ML model | No | No TensorFlow/PyTorch/scikit-learn model is trained or deployed. |
| Rule-based logic | No | No hardcoded if/else crop mapping. |
| Gemini / API-based LLM | **Yes** | Gemini generates recommendations from soil inputs, location, season, and irrigation. |
| Fixed dataset | No | No static CSV or database of crop rules. The model uses its pre-trained knowledge of Indian agro-climatic zones. |

### Inputs used

- Nitrogen (N)
- Phosphorus (P)
- Potassium (K)
- pH
- Season (Kharif / Rabi / Zaid)
- State and district from farmer profile
- Land type
- Irrigation source

---

## Fertilizer Recommendation

### How it works

The farmer selects a crop and provides soil NPK + pH. The `fertilizer-advise` Edge Function calls Gemini and returns a fertilizer schedule.

### Model used

- **Model:** `google/gemini-2.5-flash`
- **Output format (JSON):**
  ```json
  {
    "summary": "1-2 sentence overview",
    "items": [
      {
        "fertilizer": "name",
        "quantity": "kg per acre",
        "timing": "stage or day",
        "note": "optional note"
      }
    ]
  }
  ```

### Inputs used

- Crop name
- Soil N, P, K
- Soil pH

---

## Chat Advisor (RAG)

### How it works

The Chat Advisor uses **Retrieval-Augmented Generation (RAG)**:

1. The user's question is embedded using `google/gemini-embedding-2`.
2. A pgvector similarity search (`match_kb_docs`) finds the top relevant knowledge-base documents.
3. The retrieved documents are injected into the system prompt.
4. Gemini generates the final answer grounded in the retrieved context.

### Components

| Component | Technology |
|---|---|
| Vector database | Supabase PostgreSQL + `pgvector` extension |
| Embedding model | `google/gemini-embedding-2` (3072 dimensions) |
| Knowledge base table | `kb_docs` with `vector(3072)` column |
| Similarity search | `match_kb_docs` RPC using HNSW index |
| Chat model | `google/gemini-2.5-flash` |

### Knowledge base topics

The seed knowledge base includes Indian extension-service advice on:

- Paddy nutrient management
- Rice blast control
- Tomato leaf curl virus
- Cotton bollworm management
- Soil test interpretation
- Seasonal crop planning
- Government schemes (PM-KISAN, soil health card, etc.)

---

## Multilingual Support

### Supported languages

| Language | Code | UI Text | Text-to-Speech (TTS) | Speech-to-Text (STT) |
|---|---|---|---|---|
| English | `en` | Yes | Yes | Yes |
| Hindi | `hi` | Yes | Yes | Browser-dependent |
| Tamil | `ta` | Yes | Yes | Browser-dependent |

### Implementation

- UI translations are managed via `i18next` in `src/lib/i18n.ts`.
- Voice features use the browser's native **Web Speech API**:
  - `speechSynthesis` for Text-to-Speech
  - `SpeechRecognition` / `webkitSpeechRecognition` for Speech-to-Text
- TTS works reliably for all three languages because modern browsers include voice packs for English, Hindi, and Tamil.
- STT accuracy depends on the device/browser's installed speech recognition support and language packs.

---

## Voice Support

### Text-to-Speech (TTS)

- Implemented in `src/hooks/useVoice.ts` as `useSpeak()`.
- Speaks the selected language using `localStorage.getItem("lang")`.
- Speech rate is set to `0.95` for clarity.

### Speech-to-Text (STT)

- Implemented in `src/hooks/useVoice.ts` as `useListen()`.
- Uses browser `SpeechRecognition` API.
- Continuous mode is disabled (`continuous: false`) to match short farmer queries.
- Returns the transcribed text to the caller.

---

## Real Farmer Usage Example

### Scenario: Paddy Farmer in Thiruvallur, Tamil Nadu

**Farmer profile:**

| Field | Value |
|---|---|
| Name | Ramesh |
| Location | Thiruvallur district, Tamil Nadu |
| Land type | Red sandy loam |
| Farm size | 2 acres |
| Irrigation | Borewell + drip |
| Soil N | 180 kg/ha |
| Soil P | 22 kg/ha |
| Soil K | 280 kg/ha |
| Soil pH | 7.2 |
| Season | Kharif (June–September) |
| Current weather | 34°C, scattered rain expected |

### Step-by-step app usage

1. **Profile setup**  
   Ramesh registers and enters his location (Thiruvallur), land type, irrigation source, and optional soil test values.

2. **Crop Recommendation**  
   He enters N=180, P=22, K=280, pH=7.2, and selects season = Kharif.  
   The app returns:
   - **Top recommendation:** Paddy (ADT 37 / CR 1009) — **High confidence**  
     - *Reason:* Soil has adequate N and K; pH is neutral; Kharif rainfall matches paddy water requirement.  
     - *Tips:* Apply 25% N as basal; use green manure before transplanting.
   - **Alternatives:** Black gram, Gingelly, Maize

3. **Fertilizer Advisor**  
   He selects crop = "Paddy".  
   The app returns a basal + top-dressing schedule:
   - Basal: DAP + MOP at transplanting
   - Top-dressing: Urea in split doses at tillering and panicle initiation

4. **Pest Scan**  
   Ramesh notices brown spots on paddy leaves. He takes a photo using the app.  
   The app diagnoses:
   - **Disease:** Rice Blast (*Pyricularia oryzae*)
   - **Severity:** Moderate
   - **Treatment:** Apply Tricyclazole 75% WP spray; use neem-based extract as organic alternative; avoid excess nitrogen.

5. **Weather**  
   He checks the 5-day forecast and decides to spray before the predicted rain.

6. **Market Prices**  
   He checks the Thiruvallur paddy market price. With a `data.gov.in` API key, this pulls live Agmarknet data; otherwise it shows representative sample prices.

7. **Chatbot**  
   He asks in Tamil: *"பாதைப்புழு எதிர்ப்பு மருந்து எது?"* (Which medicine controls stem borer?)  
   The RAG-grounded chatbot replies in Tamil using the knowledge base.

---

## Summary Table: AI Models Used

| Feature | Model | Type | Custom trained? |
|---|---|---|---|
| Pest / disease detection | `google/gemini-2.5-flash` | Vision-language LLM | No |
| Crop recommendation | `google/gemini-2.5-flash` | Text LLM | No |
| Fertilizer advice | `google/gemini-2.5-flash` | Text LLM | No |
| Chat advisor | `google/gemini-2.5-flash` + `google/gemini-embedding-2` | RAG with vector search | No |
| Embeddings | `google/gemini-embedding-2` | Embedding model | No |

---

## Notes for Documentation

- All AI calls go through the **Lovable AI Gateway** using an OpenAI-compatible chat completions format.
- No custom Python/TensorFlow/PyTorch models are deployed.
- No Hugging Face inference endpoints are used.
- The knowledge base is stored in **Supabase PostgreSQL** with the `pgvector` extension.
- Voice features rely on the browser's built-in Web Speech API, not a cloud speech service.
