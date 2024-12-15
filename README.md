# Mock API Responses for Backend Integration

This document provides mock API responses for the `/api/post-data` and `/api/guide` endpoints. Use this as a reference for implementing and testing the backend and frontend integration.

---

## Endpoint: `/api/post-data`
**Request Method:** `POST`

### Request:
The request should include a `.txt` file in the `file` field.

### Mock Responses:

#### Success Response:
```json
{
  "tweets": [
    "Tweet 1: This is a sample tweet.",
    "Tweet 2: Another sample tweet.",
    "Tweet 3: Node.js is awesome!"
  ]
}
```

#### Error Response (No File Uploaded):
```json
{
  "error": "No file uploaded or invalid file format."
}
```

---

## Endpoint: `/api/guide`
**Request Method:** `GET`

### Query Parameter:
- **`tweet`** (integer): The index of the tweet for which guidance is requested.

### Example Request URL:
```
/api/guide?tweet=1
```

### Mock Responses:

#### Success Response:
```json
{
  "tweet": "Tweet 2: Another sample tweet.",
  "opinion": "This tweet seems positive and informative.",
  "keywords": ["sample", "tweet", "Node.js"],
  "guideline": "This is a guide to help you understand the tweet better.",
  "counter-tweet": "Another perspective on the topic.",
  "new-keyword": ["alternative", "view", "discussion"]
}
```

#### Error Response (Invalid Tweet Index):
```json
{
  "error": "Invalid tweet index or tweet not found."
}
```

---

## Notes

1. **File Upload Endpoint (`/api/post-data`):**
   - Ensure the uploaded file is a `.txt` file.
   - The `tweets` field in the response should return an array of tweet strings extracted or simulated from the file.

2. **Guide Endpoint (`/api/guide`):**
   - The `tweet` parameter is used to identify the selected tweet.
   - The response includes the original tweet, an opinion about the tweet, keywords, a guideline, a counter-tweet perspective, and suggested new keywords.


