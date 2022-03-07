# Delete User

Deletes a specified user, selected by userId.

- **URL**

  /users/

- **Method**

  `DELETE`

- **URL Params**

  userId? (Optional)

- **Data Params**

  None

- **Auth required** : YES, Bearer token in Authorization header


## Response

- **Success Response:**

  **Code:** 
    `200`
  
  **Content:**
    None
    
- **Error Response:**
  
  **Code:**
  `400 Bad Parameters`
  
  If userId is empty or of invalid type.
  
   **Content:**

  ```json
  {
    "error": {
      "status": 400,
      "message": "Bad Parameters"
    }
  }
  ```
  
    **Code:**
  `404 Not Found`
  
  If no such user has a matching userId to the given parameter.
  
   **Content:**

  ```json
  {
    "error": {
      "status": 404,
      "message": "Not Found"
    }
  }
  ```
  
  
  ## Sample Call
  
  **Need to complete this part**
