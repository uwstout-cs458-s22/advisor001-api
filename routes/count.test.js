// Must be at the top. Provided by jest/tests_common
global.jest.init();
global.jest.init_routes();
const { User, Course, app, request } = global.jest;

describe('GET /count (users)', () => {
  beforeEach(() => {
    User.count.mockReset();
    User.count.mockResolvedValue(null);
  });
  async function callGetOnCountRoute(row, tableName) {
    User.count.mockResolvedValueOnce(row);
    const response = await request(app).get(`/count/${tableName}`);
    return response;
  }

  describe('user count', () => {
    test('if there is one user in the table', async () => {
      const row = { count: 1 };
      const response = await callGetOnCountRoute(row, 'users');
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('count', 1);
    });
    test('if there is zero users in the table', async () => {
      const row = { count: 0 };
      const response = await callGetOnCountRoute(row, 'users');
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('count', 0);
    });
    test('if the table does not exist', async () => {
      const row = { count: 1 };
      const response = await callGetOnCountRoute(row, 'foo');
      expect(response.statusCode).toBe(404);
    });
  });
});

describe('GET /count (courses)', () => {
  beforeEach(() => {
    Course.count.mockReset();
    Course.count.mockResolvedValue(null);
  });
  async function callGetOnCountRoute(row, tableName) {
    Course.count.mockResolvedValueOnce(row);
    const response = await request(app).get(`/count/${tableName}`);
    return response;
  }
  describe('course count', () => {
    test('if there is one course in the table', async () => {
      const row = { count: 1 };
      const response = await callGetOnCountRoute(row, 'courses');
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('count', 1);
    });
    test('if there is zero courses in the table', async () => {
      const row = { count: 0 };
      const response = await callGetOnCountRoute(row, 'courses');
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('count', 0);
    });
    test('if the table does not exist', async () => {
      const row = { count: 1 };
      const response = await callGetOnCountRoute(row, 'foo');
      expect(response.statusCode).toBe(404);
    });
    test('if there is an error thrown by the model', async () => {
      Course.count.mockRejectedValueOnce(new Error('Some Error Occurred'));
      const row = [{ count: 0 }];
      const response = await callGetOnCountRoute(row, 'courses');
      expect(response.statusCode).toBe(500);
      expect(response.body.error).not.toBeFalsy();
      expect(response.body.error.message).toBe('Some Error Occurred');
    });
  });
});
