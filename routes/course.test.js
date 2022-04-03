// Must be at the top. Provided by jest/tests_common
global.jest.init();
global.jest.init_routes();
const { Course, auth, app, request, dataForGetCourse, dataForGetUser, samplePrivilegedUser } =
  global.jest;

/*
Custom extensions defined in test_models
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
});

describe('PUT /course', () => {
  // TODO double check acceptance criteria
  beforeEach(Course.resetAllMocks);

  // put helper
  async function callPutOnCourseRoute(courseId, body) {
    const response = await request(app).put(`/course/${courseId}`).send(body);
    return response;
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
    test('should 500 when course is not found', async () => {
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

    test('should respond 200 and successfully return edited version of user', async () => {
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
