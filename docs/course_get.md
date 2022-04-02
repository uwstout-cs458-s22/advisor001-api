# Show User

Returns json data about a single course.

- **URL**

  /course/:id

- **Method:**

  `GET`

- **URL Params**

  _Required:_ User identifier

  `id=[integer]`

  `/course/1234`

- **Data Params**

  None

- **Auth required** : YES, Bearer token in Authorization header

## Response

- **Success Response:**

  **Code:** `200`

  **Content:**

  ```json
  {
    "id": 1234`,
    "prefix": "MATH",
    "suffix": "225",
    "title": 'Differential Equations',
    "credits": 3,
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
  url: '/course/1234',
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

# Show a Course List

Returns a json array about all courses.

- **URL**

  /course/

- **Method:**

  `GET`

- **URL Params**

  _Optional:_ Limit the course records returned

  `limit=[integer]`

  `/course?limit=50`

  _Optional:_ Offset the first record locator

  `offset=[integer]`

  `/course?offset=12`

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
      "id": 1234`,
      "prefix": "MATH",
      "suffix": "225",
      "title": 'Differential Equations',
      "credits": 3,
    },
    {
      "id": 4321,
      "prefix": "CS",
      "suffix": "244",
      "title": 'Data Structures',
      "credits": 3,
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
  url: '/course/',
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
