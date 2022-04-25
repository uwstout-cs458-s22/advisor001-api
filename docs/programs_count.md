# Count Programs

Returns json data of the count of programs in the Database.

**URL**

/count/programs

- **Method:**

  `GET`

- **URL Params**

  None

**Data Params**

None

- **Auth required** : YES, Bearer token in Authorization header

## Response

- **Success Response:**

  **Code:** `200`

  **Content:**

  ``json
  {
  count: 1
  }
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
  url: '/count/programs',
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
