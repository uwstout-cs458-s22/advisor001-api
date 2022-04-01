# Edit User

Edits a specified user, selected by userId.

- **URL**

  /users/

- **Method**

  `PUT`

- **URL Params**

   _Optional:_ User identifier (Fails if empty)

  `userId=[integer]`

  `/users/1234`

- **Data Params**

  `enable=[bool]`
  &
  `role=[string]`

- **Auth required** : YES, Bearer token in Authorization header


## Response

- **Success Response:**

  **Code:** 
    `200`
  
  **Content:**
  ```json
  {
    "id": 1234,
    "email": "joe25@example.com",
    "enable": true,
    "role": "user",
    "userId": "user-test-f8b0f866-35de-4ba4-9a15-925775baebe"
  }
  ```
    
- **Error Response:**
  
  **Code:**
  `400 Requried Parameters Missing`
  
  If userId is empty or of invalid type.
  
   **Content:**

  ```json
  {
    "error": {
      "status": 400,
      "message": "Requried Parameters Missing"
    }
  }
  ```
  
     **Code:**
  `401 Forbidden`
  
  If the user initiating the deletion lacks high enough clearance to do so.
  
   **Content:**

  ```json
  {
    "error": {
      "status": 401,
      "message": "You are not allowed to do that!"
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
  
   **Code:**
  `500 Internal Server Error`
  
  If the user initiating the deletion is not found in the database.
  
   **Content:**

  ```json
  {
    "error": {
      "status": 500,
      "message": "Your account is not found in the database!"
    }
  }
  ```
  
  
  ## Sample Call
  
  ```javascript
  $.ajax({
    url: '/users/1',
    body: '{"enable": true, "role" = "admin"}
    dataType: 'json',
    type: 'PUT',
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', 'Bearer t-7614f875-8423-4f20-a674-d7cf3096290e');
    },
    success: function (r) {
      console.log(r);
    },
  });
  ```
