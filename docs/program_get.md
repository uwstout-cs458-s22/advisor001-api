# Show Program

Returns json data about a single program.

- **URL**

  /program/:id

- **Method:**

  `GET`

- **URL Params**

  _Required:_ Program identifier

  `id=[integer]`

  `/program/1234`

- **Data Params**

  None

- **Auth required** : YES, Bearer token in Authorization header

## Response

- **Success Response:**

  **Code:** `200`

  **Content:**

  ```json
  {
    "id": 1234,
    "title": "Applied Mathematics & Computer Science",
    "description": "Are you interested in using math to solve real-world problems?",
  }
  ```

- **Error Response:**

  **Code:** `404 NOT FOUND`

  **Content:**

  ```json
  {
    "error": {
      "status": 404,
      "message": "Not Found"
    }
  }
  ```

  OR

  **Code:** `500 INTERNAL ERROR`

  **Content:**

  ```json
  {
    "error": {
      "status": 500,
      "message": "Internal Server Error"
    }
  }
  ```

## Sample Call:

```javascript
$.ajax({
  url: '/program/1234',
  dataType: 'json',
  type: 'GET',
  beforeSend: function (xhr) {
    xhr.setRequestHeader('Authorization', 'Bearer t-7614f875-8423-4f20-a674-d7cf3096290e');
  },
  success: function (r) {
    console.log(r);
  },
});
```

# Show a Program List

Returns a json array about all programss, based on passed criteria.

- **URL**

  /program/

- **Method:**

  `GET`

- **URL Params**

  _Optional:_ Limit the program records returned

  `limit=[integer]`

  `/program?limit=50`

  _Optional:_ Offset the first record locator

  `offset=[integer]`

  `/program?offset=12`

- **Data Params**

  None

- **Auth required** : YES, Bearer token in Authorization header

## Response

- **Success Response:**

  **Code:** `200`

  **Content:**

  ```json
  [
    {
      "id": 1234,
      "title": "Applied Mathematics & Computer Science",
      "description": "Are you interested in using math to solve real-world problems?",
    },
    {
      "id": 4321,
      "title": "Computer Science",
      "description": "re you interested in designing and writing computer programs?",
    }
  ]
  ```

  OR

  **Content:** `[]`

- **Error Response:**

  **Code:** `500 INTERNAL ERROR`

  **Content:**

  ```json
  {
    "error": {
      "status": 500,
      "message": "Internal Server Error"
    }
  }
  ```

## Sample Call:

```javascript
$.ajax({
  url: '/program/',
  dataType: 'json',
  type: 'GET',
  beforeSend: function (xhr) {
    xhr.setRequestHeader('Authorization', 'Bearer t-7614f875-8423-4f20-a674-d7cf3096290e');
  },
  success: function (r) {
    console.log(r);
  },
});
```
