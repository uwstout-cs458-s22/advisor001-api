# Add Term

Adds a term with specified properties.

- **URL**

  /users/

- **Method**

  `ADD`

- **URL Params**

  properties

- **Data Params**

  None

- **Auth required** : YES, Bearer token in Authorization header

## Response

- **Success Response:**

  **Code:**
  `200`

  **Content:**
  Returns the term that was successfully created.

- **Error Response:**

  **Code:**
  `400 Title, Start Year, and Semester are required.`

  If any parameters are missing.

  **Content:**

  ```json
  {
    "error": {
      "status": 400,
      "message": "Title, Start Year, and Semester are required."
    }
  }
  ```

  **Code:**
  `500 Unexpected DB Condition, insert sucessful with no returned record`

  If the course is added but cannot be returned

