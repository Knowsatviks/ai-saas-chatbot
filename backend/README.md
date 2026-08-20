
# MERN Stack AI Chatbot

This is an AI Chatbot application, inspired by ChatGPT, by using MERN Stack and OpenAI

It's a customized chatbot where each message of the user is stored in DB and can be retrieved and deleted.

It's a completely secure application using JWT Tokens, HTTP-Only Cookies, Signed Cookies, Password Encryption, and Middleware Chains.

Contributions are welcome

## Semantic persona memory

Persistent memories use Google `text-embedding-004` embeddings and MongoDB Atlas Vector Search. Add this optional variable to `.env` to override the defaults:

```env
MEMORY_EMBEDDING_MODEL=text-embedding-004
MEMORY_VECTOR_INDEX_NAME=memory_vector_index
```

Create an Atlas Vector Search index named `memory_vector_index` on the `memories` collection using the definition in `docs/memory-vector-index.json`. The vector field is 768-dimensional and uses cosine similarity. The `userId`, `personaId`, and `isActive` filter fields are required for strict scoped retrieval.

Retrieval embeds the current message, asks Atlas for a bounded candidate set, then ranks candidates with:

```text
semantic similarity * 0.7
+ importance * 0.2
+ recency * 0.1
```

The final Gemini context contains at most 8 memories. If the Atlas index is unavailable, the application falls back to the existing importance and recency query so conversations continue to work.

## Password reset email configuration

Password reset OTPs are sent through SMTP. Copy `.env.example` to `.env`, then replace the placeholder values:

```powershell
Copy-Item .env.example .env
```

The backend returns `503 Password reset email service is not configured` when the SMTP variables are missing.

For Gmail, use an app password with SMTP enabled rather than your regular account password.

