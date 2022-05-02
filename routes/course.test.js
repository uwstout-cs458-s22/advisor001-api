// Must be at the top. Provided by jest/tests_common
global.jest.init();
global.jest.init_routes();
const { Course, User, auth, app, request, dataForGetCourse, dataForGetUser, samplePrivilegedUser } =
  global.jest;

const HttpError = require('http-errors');
const { extractKeys } = require('../services/utils');

/*
Custom extensions defined in tests_common, tests_models
- Course.resetAllMocks()
- auth.loginAs(user, [dbUser - optional])
*/

describe('GET /course', () => {
  beforeEach(Course.resetAllMocks);

  // helper functions - id is a numeric value
  async function callGetOnCourseRoute(row, key = 'id') {
    const id = row[key];
    Course.findOne.mockResolvedValueOnce(row);
    const response = await request(app).get(`/course/${id}`);
    return response;
  }

  describe('given a row id', () => {
    test('should make a call to Course.findOne', async () => {
      const row = dataForGetCourse(1)[0];
      await callGetOnCourseRoute(row);
      expect(Course.findOne.mock.calls).toHaveLength(1);
      expect(Course.findOne.mock.calls[0]).toHaveLength(1);
      expect(Course.findOne.mock.calls[0][0]).toHaveProperty('id', row.id);
    });

    test('should respond with a json object containing the course data', async () => {
      const data = dataForGetCourse(10);
      for (const row of data) {
        const { body: course } = await callGetOnCourseRoute(row);

        for (const key in Object.keys(row)) {
          expect(course).toHaveProperty(key, row[key]);
        }
      }
    });

    test('should specify json in the content type header', async () => {
      const data = dataForGetCourse(1, 100);
      const response = await callGetOnCourseRoute(data[0]);
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test('should respond with a 200 status code when course exists', async () => {
      const data = dataForGetCourse(1, 100);
      const response = await callGetOnCourseRoute(data[0]);
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 404 status code when course does NOT exists', async () => {
      Course.findOne.mockResolvedValueOnce({});
      const response = await request(app).get(`/course/100`);
      expect(response.statusCode).toBe(404);
    });

    test('should respond with a 500 status code when an error occurs', async () => {
      Course.findOne.mockRejectedValueOnce(new Error('Some Database Error'));
      const response = await request(app).get(`/course/100`);
      expect(response.statusCode).toBe(500);
    });
  });

  describe('querying a group of courses', () => {
    test('should make a call to Course.findAll', async () => {
      const data = dataForGetCourse(10);
      Course.findAll.mockResolvedValueOnce(data);
      await request(app).get(`/course`);
      expect(Course.findAll.mock.calls).toHaveLength(1);
      expect(Course.findAll.mock.calls[0]).toHaveLength(3);
      expect(Course.findAll.mock.calls[0][0]).toBeNull();
      expect(Course.findAll.mock.calls[0][1]).toBeUndefined();
      expect(Course.findAll.mock.calls[0][2]).toBeUndefined();
    });

    test('should make a call to findAll - with limits', async () => {
      const data = dataForGetCourse(3);
      Course.findAll.mockResolvedValueOnce(data);
      await request(app).get(`/course?limit=3`);
      expect(Course.findAll.mock.calls).toHaveLength(1);
      expect(Course.findAll.mock.calls[0]).toHaveLength(3);
      expect(Course.findAll.mock.calls[0][0]).toBeNull();
      expect(Course.findAll.mock.calls[0][1]).toBe('3');
      expect(Course.findAll.mock.calls[0][2]).toBeUndefined();
    });

    test('should make a call to findAll - with offset', async () => {
      const data = dataForGetCourse(3);
      Course.findAll.mockResolvedValueOnce(data);
      await request(app).get(`/course?offset=1`);
      expect(Course.findAll.mock.calls).toHaveLength(1);
      expect(Course.findAll.mock.calls[0]).toHaveLength(3);
      expect(Course.findAll.mock.calls[0][0]).toBeNull();
      expect(Course.findAll.mock.calls[0][1]).toBeUndefined();
      expect(Course.findAll.mock.calls[0][2]).toBe('1');
    });

    test('should make a call to findAll- with limit and offset', async () => {
      const data = dataForGetCourse(3, 1);
      Course.findAll.mockResolvedValueOnce(data);
      await request(app).get(`/course?limit=3&offset=1`);
      expect(Course.findAll.mock.calls).toHaveLength(1);
      expect(Course.findAll.mock.calls[0]).toHaveLength(3);
      expect(Course.findAll.mock.calls[0][0]).toBeNull();
      expect(Course.findAll.mock.calls[0][1]).toBe('3');
      expect(Course.findAll.mock.calls[0][2]).toBe('1');
    });

    test('should respond with a json array object containg the course data', async () => {
      const data = dataForGetCourse(5);
      Course.findAll.mockResolvedValueOnce(data);
      const { body: courses } = await request(app).get(`/course`);
      expect(courses).toHaveLength(data.length);
      for (let i = 0; i < data.length; i++) {
        expect(courses[i].id).toBe(data[i].id);
        expect(courses[i].prefix).toBe(data[i].prefix);
        expect(courses[i].suffix).toBe(data[i].suffix);
        expect(courses[i].title).toBe(data[i].title);
        expect(courses[i].description).toBe(data[i].description);
        expect(courses[i].credits).toBe(data[i].credits);
      }
    });

    test('should respond with a json array object containg no data', async () => {
      Course.findAll.mockResolvedValueOnce([]);
      const response = await request(app).get(`/course`);
      expect(response.body).toHaveLength(0);
    });

    test('should specify json in the content type header', async () => {
      Course.findAll.mockResolvedValueOnce([]);
      const response = await request(app).get(`/course`);
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test('should respond with a 200 status code when course data returned', async () => {
      const data = dataForGetCourse(5);
      Course.findAll.mockResolvedValueOnce(data);
      const response = await request(app).get(`/course`);
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 200 status code when course data returned (even no courses)', async () => {
      Course.findAll.mockResolvedValueOnce([]);
      const response = await request(app).get(`/course`);
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 500 status code when an error occurs', async () => {
      Course.findAll.mockRejectedValueOnce(new Error('Some Database Failure'));
      const response = await request(app).get(`/course`);
      expect(response.statusCode).toBe(500);
      expect(response.body.error.message).toBe('Some Database Failure');
    });
  });
});

describe('PUT /course', () => {
  // TODO double check acceptance criteria
  beforeEach(Course.resetAllMocks);

  // put helper
  function callPutOnCourseRoute(courseId, body) {
    return request(app).put(`/course/${courseId}`).send(body);
  }

  describe('given an empty URL bar', () => {
    test('should result in 400', async () => {
      const editor = samplePrivilegedUser();
      auth.loginAs(editor);

      Course.findOne.mockResolvedValueOnce({});
      const response = await callPutOnCourseRoute('', {}); // NO COURSE ID

      expect(Course.findOne).not.toBeCalled();
      expect(response.statusCode).toBe(400);
      expect(response.body.error.message).toBe('Required Parameters Missing');
    });
  });

  describe('when URL bar is non-empty', () => {
    test('should 500 when editor is not found', async () => {
      const editor = samplePrivilegedUser();
      auth.loginAs(editor, {}); // NO EDITOR IN DB

      const course = dataForGetCourse(1)[0];

      const desiredChanges = {
        prefix: 'ANTH',
        suffix: '220HON',
        title: 'Cultural Anthropology',
      };

      Course.findOne.mockResolvedValueOnce(course);
      Course.edit.mockResolvedValueOnce(Object.assign(course, desiredChanges));

      const response = await callPutOnCourseRoute(course.id, desiredChanges);

      expect(Course.findOne).not.toBeCalled();
      expect(Course.edit).not.toBeCalled();
      expect(response.statusCode).toBe(500);
      expect(response.body.error.message).toBe('Your account is not found in the database!');
    });

    test('should 401 when not authorized to edit courses', async () => {
      const editor = dataForGetUser(1)[0];
      editor.enable = 'true';
      auth.loginAs(editor); // Unprivileged editor

      const course = dataForGetCourse(1)[0];

      const desiredChanges = {
        prefix: 'ANTH',
        suffix: '220HON',
        title: 'Cultural Anthropology',
      };

      Course.findOne.mockResolvedValueOnce(course);
      Course.edit.mockResolvedValueOnce(Object.assign(course, desiredChanges));

      const response = await callPutOnCourseRoute(course.id, desiredChanges);

      expect(response.statusCode).toBe(401);
      expect(response.body.error.message).toBe('You are not allowed to do that!');
    });

    test('should 404 when the course is not found', async () => {
      const editor = samplePrivilegedUser();
      auth.loginAs(editor);

      const desiredChanges = {
        prefix: 'ANTH',
        suffix: '220HON',
        title: 'Cultural Anthropology',
      };

      Course.findOne.mockResolvedValueOnce({}); // NO COURSE
      Course.edit.mockResolvedValueOnce({});

      const response = await callPutOnCourseRoute(1, desiredChanges);
      expect(response.statusCode).toBe(404);
      expect(Course.edit).not.toBeCalled();
      expect(response.body.error.message).toBe('Not Found');
    });

    test('should respond 200 and successfully return edited version of course', async () => {
      const editor = samplePrivilegedUser();
      auth.loginAs(editor);

      const course = dataForGetCourse(1)[0];

      const desiredChanges = {
        prefix: 'ANTH',
        suffix: '220HON',
        title: 'Cultural Anthropology',
      };

      Course.findOne.mockResolvedValueOnce(course);
      const expectedReturn = Object.assign(course, desiredChanges);
      Course.edit.mockResolvedValueOnce(desiredChanges);

      const response = await callPutOnCourseRoute(course.id, desiredChanges);

      expect(response.statusCode).toBe(200);
      // check all properties
      for (const key of Object.keys(response.body)) {
        expect(response.body).toHaveProperty(key, expectedReturn[key]);
      }
    });

    test('should still work even if no body parameters are specified', async () => {
      const editor = samplePrivilegedUser();
      auth.loginAs(editor);

      const course = dataForGetCourse(1)[0];

      const desiredChanges = {};

      Course.findOne.mockResolvedValueOnce(course);
      const expectedReturn = Object.assign(course, desiredChanges);
      Course.edit.mockResolvedValueOnce(desiredChanges);

      const response = await callPutOnCourseRoute(course.id, desiredChanges);

      expect(response.statusCode).toBe(200);
      // check all properties
      for (const key of Object.keys(response.body)) {
        expect(response.body).toHaveProperty(key, expectedReturn[key]);
      }
    });

    test("should still work if the user's role is Director", async () => {
      const editor = samplePrivilegedUser();
      editor.role = 'director';
      auth.loginAs(editor);

      const course = dataForGetCourse(1)[0];

      const desiredChanges = {
        prefix: 'ANTH',
        suffix: '220HON',
        title: 'Cultural Anthropology',
      };

      Course.findOne.mockResolvedValueOnce(course);
      const expectedReturn = Object.assign(course, desiredChanges);
      Course.edit.mockResolvedValueOnce(desiredChanges);

      const response = await callPutOnCourseRoute(course.id, desiredChanges);

      expect(response.statusCode).toBe(200);
      // check all properties
      for (const key of Object.keys(response.body)) {
        expect(response.body).toHaveProperty(key, expectedReturn[key]);
      }
    });
  });
});

describe('POST /course (TODO: duplicate test suite)', () => {
  // TODO double check acceptance criteria
  beforeEach(Course.resetAllMocks);

  // put helper
  function callPostOnCourseRoute(body) {
    return request(app).post(`/course/`).send(body);
  }

  test('should 500 when editor not found in DB', async () => {
    const editor = samplePrivilegedUser();
    auth.loginAs(editor, {}); // NO EDITOR IN DB

    const course = dataForGetCourse(1)[0];
    Course.addCourse.mockResolvedValueOnce(course);

    const response = await callPostOnCourseRoute(course);

    expect(Course.addCourse).not.toBeCalled();
    expect(response.statusCode).toBe(500);
    expect(response.body.error.message).toBe('Your account is not found in the database!');
  });

  test('should 401 when not authorized to add courses', async () => {
    const editor = dataForGetUser(1)[0];
    editor.enable = 'true';
    auth.loginAs(editor); // Unprivileged editor

    const course = dataForGetCourse(1)[0];
    Course.addCourse.mockResolvedValueOnce(course);

    const response = await callPostOnCourseRoute(course);

    expect(Course.addCourse).not.toBeCalled();
    expect(response.statusCode).toBe(401);
    expect(response.body.error.message).toBe('You are not allowed to do that!');
  });

  test('should return the added course', async () => {
    const editor = samplePrivilegedUser();
    editor.role = 'director';
    auth.loginAs(editor);

    const expectedReturn = dataForGetCourse(1)[0];
    Course.findOne.mockResolvedValueOnce({});
    Course.addCourse.mockResolvedValueOnce(expectedReturn);

    // no ID for req body
    const input = extractKeys(
      expectedReturn,
      'prefix',
      'suffix',
      'title',
      'description',
      'credits'
    );
    const response = await callPostOnCourseRoute(input);

    expect(Course.addCourse).toBeCalled();
    expect(response.statusCode).toBe(200);
    // all values should be returned
    for (const key of Object.keys(expectedReturn)) {
      expect(response.body).toHaveProperty(key, expectedReturn[key]);
    }
    // new ID should be returned
    expect(response.body).toHaveProperty('id', '1');
  });

  test('errors thrown by addCourse are caught', async () => {
    const editor = samplePrivilegedUser();
    editor.role = 'director';
    auth.loginAs(editor);

    const course = dataForGetCourse(1)[0];
    Course.findOne.mockResolvedValueOnce({});
    Course.addCourse.mockImplementation(async () => {
      throw HttpError.BadRequest('a testing model error');
    });

    // no ID for req body
    delete course.id;
    const response = await callPostOnCourseRoute(course);

    expect(Course.addCourse).toHaveBeenCalledTimes(1);
    expect(Course.addCourse.mock.calls[0][0]).not.toHaveProperty('id', '1');
    expect(Course.addCourse.mock.calls[0][0]).toHaveProperty('prefix', course.prefix);
    expect(Course.addCourse.mock.calls[0][0]).toHaveProperty('suffix', course.suffix);
    expect(Course.addCourse.mock.calls[0][0]).toHaveProperty('title', course.title);
    expect(Course.addCourse.mock.calls[0][0]).toHaveProperty('description', course.description);
    expect(Course.addCourse.mock.calls[0][0]).toHaveProperty('credits', course.credits);

    await expect(Course.addCourse).rejects.toThrowError('a testing model error');

    expect(response.statusCode).toBe(400);
    expect(response.body.error.message).toBe('a testing model error');
  });
});

describe('DELETE /course', () => {
  beforeEach(Course.resetAllMocks);
  beforeEach(User.resetAllMocks);

  // Calls the delete course function
  async function callDeleteOnCourseRoute(row, key = 'id') {
    const id = row[key] === undefined ? '' : row[key];
    Course.findOne.mockResolvedValueOnce(row);
    const response = await request(app).delete(`/course/${id}`);
    return response;
  }

  describe('given an empty URL bar', () => {
    test('should respond with a 400 status code when passing empty string', async () => {
      // Set-up
      const deleter = samplePrivilegedUser();
      auth.loginAs(deleter);

      // Execute
      const response = await callDeleteOnCourseRoute({});

      // Check
      expect(Course.deleteCourse).not.toBeCalled();
      expect(response.statusCode).toBe(400);
    });
  });

  describe('when URL bar is non-empty', () => {
    test('should respond with a 200 status code when course exists and is deleted', async () => {
      // Set-up
      const course = dataForGetCourse(1, 100)[0];
      const deleter = samplePrivilegedUser();
      auth.loginAs(deleter);

      // Execute
      const response = await callDeleteOnCourseRoute(course);

      // Check course
      expect(Course.findOne.mock.calls).toHaveLength(1);
      expect(Course.findOne.mock.calls[0]).toHaveLength(1);
      expect(Course.findOne.mock.calls[0][0]).toHaveProperty('id', course.id);

      // Check delete
      expect(Course.deleteCourse).toBeCalled();
      expect(Course.deleteCourse.mock.calls).toHaveLength(1);
      expect(Course.deleteCourse.mock.calls[0]).toHaveLength(1);
      expect(Course.deleteCourse.mock.calls[0][0]).toBe(course.id);
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 500 status code when course does NOT exists', async () => {
      // Set-up
      const deleter = samplePrivilegedUser();
      auth.loginAs(deleter);
      Course.findOne.mockResolvedValueOnce({});

      // Execute
      const response = await request(app).delete(`/course/100`);

      // Check course
      expect(Course.findOne.mock.calls[0]).toHaveLength(1);
      expect(Course.findOne.mock.calls[0][0]).toHaveProperty('id', '100');

      // Check delete
      expect(Course.deleteCourse).not.toBeCalled();
      expect(response.statusCode).toBe(500);
    });

    test('should respond with 500 when the deleter is not found', async () => {
      // Set-up
      const deleter = samplePrivilegedUser();
      auth.loginAs(deleter, {}); // NO EDITOR (2nd param is database-resolved user)
      const course = dataForGetCourse(1, 100)[0];

      // Execute
      const response = await callDeleteOnCourseRoute(course);

      // Check deleter
      expect(User.findOne.mock.calls).toHaveLength(1);
      expect(User.findOne.mock.calls[0]).toHaveLength(1);
      expect(User.findOne.mock.calls[0][0]).toHaveProperty('userId', deleter.userId);

      // Check delete
      expect(Course.deleteCourse).not.toBeCalled();
      expect(response.statusCode).toBe(500);
    });

    test('should respond with 401 when the editor is not authorized', async () => {
      // Set-up
      const deleter = dataForGetUser(1, 100)[0];
      deleter.enable = 'true';
      auth.loginAs(deleter);
      const course = dataForGetCourse(1, 100)[0];

      // Execute
      const response = await callDeleteOnCourseRoute(course);

      // Check deleter
      expect(User.findOne.mock.calls).toHaveLength(1);
      expect(User.findOne.mock.calls[0]).toHaveLength(1);
      expect(User.findOne.mock.calls[0][0]).toHaveProperty('userId', deleter.userId);

      // Check delete
      expect(User.deleteUser).not.toBeCalled();
      expect(response.statusCode).toBe(401);
    });
  });
});

describe('POST /course', () => {
  beforeEach(Course.resetAllMocks);
  beforeEach(() => auth.loginAs(samplePrivilegedUser()));

  describe('given course details', () => {
    test('should call both Course.findOne and Course.create', async () => {
      // Set-up
      const row = dataForGetCourse(1)[0];
      const requestParams = {
        prefix: row.prefix,
        suffix: row.suffix,
        title: row.title,
        description: row.description,
        credits: row.credits,
      };
      Course.findOne.mockResolvedValueOnce({});
      Course.addCourse.mockResolvedValueOnce(row);

      // Test
      await request(app).post('/course').send(requestParams);

      // Check
      expect(Course.findOne.mock.calls).toHaveLength(1);
      expect(Course.findOne.mock.calls[0]).toHaveLength(1);
      expect(Course.addCourse.mock.calls).toHaveLength(1);
      expect(Course.addCourse.mock.calls[0]).toHaveLength(1);
      for (const key in Object.keys(requestParams)) {
        // Check that the values from the post are the same as from the mocked findOne and addCourse
        expect(Course.addCourse.mock.calls[0][0]).toHaveProperty(key, requestParams[key]);
        expect(Course.findOne.mock.calls[0][0]).toHaveProperty(key, requestParams[key]);
      }
    });

    test('should respond with a json object containg the course details', async () => {
      // Set-up
      const row = dataForGetCourse(1)[0];
      const requestParams = {
        prefix: row.prefix,
        suffix: row.suffix,
        title: row.title,
        description: row.description,
        credits: row.credits,
      };
      Course.findOne.mockResolvedValueOnce({});
      Course.addCourse.mockResolvedValueOnce(row);

      // Test
      const { body: course } = await request(app).post('/course').send(requestParams);

      // Check
      expect(course.prefix).toBe(row.prefix);
      expect(course.suffix).toBe(row.suffix);
      expect(course.title).toBe(row.title);
      expect(course.description).toBe(row.description);
      expect(course.credits).toBe(row.credits);
    });

    test('should specify json in the content type header', async () => {
      // Set-up
      const data = dataForGetCourse(1);
      const row = data[0];
      const requestParams = {
        prefix: row.prefix,
        suffix: row.suffix,
        title: row.title,
        description: row.description,
        credits: row.credits,
      };
      Course.findOne.mockResolvedValueOnce({});
      Course.addCourse.mockResolvedValueOnce(row);

      // Test
      const response = await request(app).post('/course').send(requestParams);

      // Check
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test('should respond with a 200 status code when course is succesfully created', async () => {
      // Set-up
      const row = dataForGetCourse(1)[0];
      const requestParams = {
        prefix: row.prefix,
        suffix: row.suffix,
        title: row.title,
        description: row.description,
        credits: row.credits,
      };
      Course.findOne.mockResolvedValueOnce({});
      Course.addCourse.mockResolvedValueOnce(row);

      // Test
      const response = await request(app).post('/course').send(requestParams);

      // Check
      expect(response.statusCode).toBe(200);
    });

    test('should respond with 409: Conflict when course already exists', async () => {
      // Set-up
      const row = dataForGetCourse(1)[0];
      const requestParams = {
        prefix: row.prefix,
        suffix: row.suffix,
        title: row.title,
        description: row.description,
        credits: row.credits,
      };
      Course.findOne.mockResolvedValueOnce(row);
      Course.addCourse.mockResolvedValueOnce(row);

      // Test
      const response = await request(app).post('/course').send(requestParams);

      // Check
      expect(response.statusCode).toBe(409);
      expect(Course.findOne).toBeCalled();
      expect(Course.addCourse).not.toBeCalled();
      expect(Course.findOne.mock.calls[0]).toHaveLength(1);
      for (const key of Object.keys(requestParams)) {
        expect(Course.findOne.mock.calls[0][0]).toHaveProperty(key, requestParams[key]);
      }
    });

    test('should respond with a 500 status code when an Course.create error occurs', async () => {
      // Set-up
      const row = dataForGetCourse(1)[0];
      const requestParams = {
        prefix: row.prefix,
        suffix: row.suffix,
        title: row.title,
        description: row.description,
        credits: row.credits,
      };
      Course.findOne.mockResolvedValueOnce({});
      Course.addCourse.mockResolvedValueOnce(null);

      // Test
      const response = await request(app).post('/course').send(requestParams);

      // Check
      expect(response.statusCode).toBe(500);
    });

    test('should respond with a 500 status code when create database error occurs', async () => {
      // Set-up
      const row = dataForGetCourse(1)[0];
      const requestParams = {
        prefix: row.prefix,
        suffix: row.suffix,
        title: row.title,
        description: row.description,
        credits: row.credits,
      };
      Course.findOne.mockResolvedValueOnce({});
      Course.addCourse.mockRejectedValueOnce(new Error('some database error'));

      // Test
      const response = await request(app).post('/course').send(requestParams);

      // Check
      expect(response.statusCode).toBe(500);
    });
  });

  describe('given empty dictionary', () => {
    test('should respond with a 400 status code', async () => {
      // Test
      const response = await request(app).post('/course').send({});

      // Check
      expect(response.statusCode).toBe(400);
    });
  });

  describe('given empty string', () => {
    test('should respond with a 400 status code', async () => {
      // Test
      const response = await request(app).post('/course').send('');

      // Check
      expect(response.statusCode).toBe(400);
    });
  });
});
