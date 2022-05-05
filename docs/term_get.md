# Find One

Returns json data about a single term.

- **URL**

  /term/:id

- **Method:**

  `GET`

- **URL Params**

  _Required:_ Term identifier

  `id=[integer]`

  `/term/3`

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
    "title": "FALL-2022",
    "startyear": 2022,
    "semester": 0
  }
  ```

- **Error Response:**

  If no values were found with the specified criteria, the function returns an empty array.

  If there is a db error, db.query will throw a rejected promise.

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
  url: '/term/1234',
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

# Find All

Returns a json array about all terms, based on passed criteria.

- **URL**

  /term/

- **Method:**

  `GET`

- **URL Params**

  _Required:_ Criteria

  `criteria=[string]`

  _Optional:_ Limit the term records returned

  `limit=[integer]`

  `/term?limit=50`

  _Optional:_ Offset the first record locator

  `offset=[integer]`

  `/term?offset=12`

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
      "title": "FALL-2022",
      "startyear": 2022,
      "semester": 0
    },
    {
      "id": 4321,
      "title": "SPRING-2023",
      "startyear": 2023,
      "semester": 2
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
  url: '/term/',
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
