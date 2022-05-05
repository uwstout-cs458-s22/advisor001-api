# Add Course_Program

Adds a program with specified properties.

- **URL**

  /program/:id/course/:id

- **Method**

  `POST`

- **URL Params**

  None

- **Data Params**

  _Required_: title and description

  ```json
  {
    "title": "CS 101",
    "description": "Basic Coding"
  }
  ```

- **Auth required** : YES, Bearer token in Authorization header

## Response

- **Success Response:**

  **Code:**
  `200`

  **Content:**
  Returns the program that was successfully created.

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

  If the program_course is added but cannot be returned
