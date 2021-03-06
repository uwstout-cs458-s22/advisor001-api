# Add Program

Adds a program with specified properties.

- **URL**

  /program/

- **Method**

  `POST`

- **URL Params**

  None

- **Data Params**

  _Required_: title and description

  ```json
  {
    "title": "Computer Science",
    "description": "Description of the program"
  }
  ```

- **Auth required** : YES, Bearer token in Authorization header

## Response

- **Success Response:**

  **Code:**
  `200`

  **Content:**
  Returns the program that was successfully created.

  ```json
  {
    "title": "Computer Science",
    "description": "Description of the program"
  }
  ```

- **Error Response:**

  **Code:**
  `400 Missing Program Parameters`

  If any parameters are missing.

  **Content:**

  ```json
  {
    "error": {
      "status": 400,
      "message": "Missing Program Parameters"
    }
  }
  ```

  **Code:**
  `500 Unexpected DB Condition, insert sucessful with no returned record`

  If the program is added but cannot be returned

## Sample Call:

```javascript
try {
  fetch('/program', {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify({ title: data.eventData.title, description: data.eventData.description }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
} catch (e) {
  console.log(e);
}
```
