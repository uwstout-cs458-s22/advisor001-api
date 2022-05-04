# Edit Program

Edits a specified program, selected by id.

- **URL**

  /program/

- **Method**

  `PUT`

- **URL Params**

  _Optional:_ Term identifier (Fails if empty)

  `id=[text]`

- **Data Params**

  `title=[string]`
  &
  `title=[string]`
  &  
  `description=[string]`

- **Auth required** : YES, Bearer token in Authorization header

## Response

- **Success Response:**

  **Code:**
  `200`

  **Content:**

  ```json
  {
    "id": 1234,
    "title": "CS",
    "description": "this"
  }
  ```

- **Error Response:**

  **Code:**
  `400 Requried Parameters Missing`

  If id is empty or of invalid type.

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

  If no such term has a matching id to the given parameter.

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
    url: '/program/1234',
    body: {
      "title": "CS",
      "description": "this",
    }
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
