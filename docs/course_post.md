# Add Course

Adds a course with specified properties.

- **URL**

  /course/

- **Method**

  `POST`

- **URL Params**

  None

- **Data Params**

  _Required_: prefix, suffix, title, description,
  and credits

  ```json
  {
    "prefix": "CS",
    "suffix": "254",
    "title": "Human Computer Interaction",
    "description": "Description",
    "credits": 3
  }
  ```

- **Auth required** : YES, Bearer token in Authorization header

## Response

- **Success Response:**

  **Code:**
  `200`

  **Content:**
  Returns the course that was successfully created.

  ```json
  {
    "prefix": "CS",
    "suffix": "254",
    "title": "Human Computer Interaction",
    "description": "Description",
    "credits": 3
  }
  ```

- **Error Response:**

  **Code:**
  `400 Missing Course Parameters`

  If any parameters are missing.

  **Content:**

  ```json
  {
    "error": {
      "status": 400,
      "message": "Missing Course Parameters"
    }
  }
  ```

  **Code:**
  `500 Unexpected DB Condition, insert sucessful with no returned record`

  If the course is added but cannot be returned

## Sample Call:

```javascript
try {
  fetch('/course', {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify({
      prefix: data.eventData.prefix,
      suffix: data.eventData.suffix,
      title: data.eventData.title,
      description: data.eventData.description,
      credits: data.eventData.credits,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
} catch (e) {
  console.log(e);
}
```
