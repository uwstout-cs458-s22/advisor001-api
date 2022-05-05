# Show Program

Returns json data about a single program course.

- **URL**

  /program/:id/course/:id

- **Method:**

  `GET`

- **URL Params**

  _Required:_ Program identifier

  `id=[integer]`

  `/program/1234/course/5678`

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
    "id": 5678,
    "title": "CS 101",
    "description": "Basic Coding Skills"
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
  url: '/program/1234/course/5678',
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

Returns a json array about all programs, based on passed criteria.

- **URL**

  /program/id/course

- **Method:**

  `GET`

- **URL Params**

  _Optional:_ Limit the program_course records returned

  `limit=[integer]`

  `/program/{{id}}/course?limit=50`

  _Optional:_ Offset the first record locator

  `offset=[integer]`

  `/program/{{id}}/?offset=12`

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
      "description": "Are you interested in using math to solve real-world problems?"

    {
      "id": 5678,
      "title": "CS 101",
      "description": "Basic Coding",

    }

    {
        "id":4321,
        "title": "CS 102",
        "description":"OOP",

    }

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
  url: '/program/id/',
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
