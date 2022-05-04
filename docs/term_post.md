# Add Term

Adds a term with specified properties.

- **URL**

  /term/

- **Method**

  `POST`

- **URL Params**

  None

- **Data Params**

  _Required_: title, startyear, and semester

  ```json
  {
    "title": "Fall-2022",
    "startyear": 2022,
    "semeseter": 2
  }
  ```

- **Auth required** : YES, Bearer token in Authorization header

## Response

- **Success Response:**

  **Code:**
  `200`

  **Content:**

  ```json
  {
    "title": "Fall-2022",
    "startyear": 2022,
    "semeseter": 2
  }
  ```

- **Error Response:**

  **Code:**
  `400 Title, Start Year, and Semester are required`

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

## Sample Call:

```javascript
try {
  fetch('/term', {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify({
      title: data.eventData.title,
      startyear: data.eventData.startyear,
      semester: data.eventData.semester,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
} catch (e) {
  console.log(e);
}
```
