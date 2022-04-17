global.jest.init(false); // Init without models
global.jest.init_db();
const { dataForGetUser, db, env } = global.jest;

const User = require('./User');

describe('User Model', () => {
  beforeEach(() => {
    db.query.mockReset();
    db.query.mockResolvedValue(null);
  });

  describe('querying a single user by id', () => {
    test('confirm calls to query', async () => {
      const row = dataForGetUser(1)[0];
      db.query.mockResolvedValue({ rows: [row] });
      await User.findOne({ id: row.id });
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0][1][0]).toBe(row.id);
    });

    test('should return a single User', async () => {
      const row = dataForGetUser(1)[0];
      db.query.mockResolvedValue({ rows: [row] });
      const user = await User.findOne({ id: row.id });
      for (const key in Object.keys(row)) {
        expect(user).toHaveProperty(key, row[key]);
      }
    });

    test('should return empty for unfound user', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const user = await User.findOne({ id: 123 });
      expect(Object.keys(user)).toHaveLength(0);
    });

    test('should return null for database error', async () => {
      db.query.mockRejectedValueOnce(new Error('a testing database error'));
      await expect(User.findOne({ id: 123 })).rejects.toThrowError('a testing database error');
    });
  });

  describe('querying groups of users', () => {
    test('should make a call to User.findAll - no criteria, no limits, no offsets', async () => {
      const data = dataForGetUser(5);
      db.query.mockResolvedValue({ rows: data });
      const users = await User.findAll();
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe('SELECT * from "user"  LIMIT $1 OFFSET $2;');
      expect(db.query.mock.calls[0][1]).toHaveLength(2);
      expect(db.query.mock.calls[0][1][0]).toBe(100);
      expect(db.query.mock.calls[0][1][1]).toBe(0);
      expect(users).toHaveLength(data.length);
      for (let i = 0; i < data.length; i++) {
        for (const key in Object.keys(data[i])) {
          expect(users[i]).toHaveProperty(key, data[i][key]);
        }
      }
    });

    test('should make a call to User.findAll - with criteria, no limits, no offsets', async () => {
      const data = dataForGetUser(5);
      db.query.mockResolvedValue({ rows: data });
      const users = await User.findAll({ role: 'user', enable: true }, undefined);
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'SELECT * from "user" WHERE "role"=$1 AND "enable"=$2 LIMIT $3 OFFSET $4;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(4);
      expect(db.query.mock.calls[0][1][0]).toBe('user');
      expect(db.query.mock.calls[0][1][1]).toBe(true);
      expect(db.query.mock.calls[0][1][2]).toBe(100);
      expect(db.query.mock.calls[0][1][3]).toBe(0);
      expect(users).toHaveLength(data.length);
      for (let i = 0; i < data.length; i++) {
        for (const key in Object.keys(data[i])) {
          expect(users[i]).toHaveProperty(key, data[i][key]);
        }
      }
    });

    test('should make a call to User.findAll - with criteria, with limits, no offsets', async () => {
      const data = dataForGetUser(3);
      db.query.mockResolvedValue({ rows: data });
      const users = await User.findAll({ role: 'user', enable: true }, 3);
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'SELECT * from "user" WHERE "role"=$1 AND "enable"=$2 LIMIT $3 OFFSET $4;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(4);
      expect(db.query.mock.calls[0][1][0]).toBe('user');
      expect(db.query.mock.calls[0][1][1]).toBe(true);
      expect(db.query.mock.calls[0][1][2]).toBe(3);
      expect(db.query.mock.calls[0][1][3]).toBe(0);
      expect(users).toHaveLength(data.length);
      for (let i = 0; i < data.length; i++) {
        for (const key in Object.keys(data[i])) {
          expect(users[i]).toHaveProperty(key, data[i][key]);
        }
      }
    });

    test('should make a call to User.findAll - with criteria, with limits, with offsets', async () => {
      const data = dataForGetUser(3, 1);
      db.query.mockResolvedValue({ rows: data });
      const users = await User.findAll({ role: 'user', enable: true }, 3, 1);
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'SELECT * from "user" WHERE "role"=$1 AND "enable"=$2 LIMIT $3 OFFSET $4;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(4);
      expect(db.query.mock.calls[0][1][0]).toBe('user');
      expect(db.query.mock.calls[0][1][1]).toBe(true);
      expect(db.query.mock.calls[0][1][2]).toBe(3);
      expect(db.query.mock.calls[0][1][3]).toBe(1);
      expect(users).toHaveLength(data.length);
      for (let i = 0; i < data.length; i++) {
        for (const key in Object.keys(data[i])) {
          expect(users[i]).toHaveProperty(key, data[i][key]);
        }
      }
    });

    test('should return null for database error', async () => {
      db.query.mockRejectedValueOnce(new Error('a testing database error'));
      await expect(User.findAll()).rejects.toThrowError('a testing database error');
    });
  });

  describe('creating a user', () => {
    test('User.create with "user" role, disabled by default', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      row.enable = false;
      db.query.mockResolvedValue({ rows: data });
      const user = await User.create(row.userId, row.email);
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'INSERT INTO "user" ("userId","email","enable","role") VALUES ($1,$2,$3,$4) RETURNING *;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(4);
      expect(db.query.mock.calls[0][1][0]).toBe(row.userId);
      expect(db.query.mock.calls[0][1][1]).toBe(row.email);
      expect(db.query.mock.calls[0][1][2]).toBe(row.enable);
      expect(db.query.mock.calls[0][1][3]).toBe(row.role);
      for (const key in Object.keys(row)) {
        expect(user).toHaveProperty(key, row[key]);
      }
    });

    test('User.create with masterAdmin role', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      row.enable = true;
      row.role = 'admin';
      row.email = env.masterAdminEmail;
      db.query.mockResolvedValue({ rows: data });
      const user = await User.create(row.userId, row.email);
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'INSERT INTO "user" ("userId","email","enable","role") VALUES ($1,$2,$3,$4) RETURNING *;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(4);
      expect(db.query.mock.calls[0][1][0]).toBe(row.userId);
      expect(db.query.mock.calls[0][1][1]).toBe(row.email);
      expect(db.query.mock.calls[0][1][2]).toBe(row.enable);
      expect(db.query.mock.calls[0][1][3]).toBe(row.role);
      for (const key in Object.keys(row)) {
        expect(user).toHaveProperty(key, row[key]);
      }
    });

    test('User.create with unexpected database response', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      row.role = 'user';
      row.enable = false;

      // unexpected response from db
      db.query.mockResolvedValue({ rows: [] });

      await expect(User.create(row.userId, row.email)).rejects.toThrowError(
        'Unexpected DB Condition, insert sucessful with no returned record'
      );

      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'INSERT INTO "user" ("userId","email","enable","role") VALUES ($1,$2,$3,$4) RETURNING *;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(4);
      expect(db.query.mock.calls[0][1][0]).toBe(row.userId);
      expect(db.query.mock.calls[0][1][1]).toBe(row.email);
      expect(db.query.mock.calls[0][1][2]).toBe(row.enable);
      expect(db.query.mock.calls[0][1][3]).toBe(row.role);
    });

    test('User.create with database error', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      row.role = 'user';
      row.enable = false;

      // error thrown during call to db query
      db.query.mockRejectedValueOnce(new Error('a testing database error'));
      await expect(User.create(row.userId, row.email)).rejects.toThrowError(
        'a testing database error'
      );
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'INSERT INTO "user" ("userId","email","enable","role") VALUES ($1,$2,$3,$4) RETURNING *;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(4);
      expect(db.query.mock.calls[0][1][0]).toBe(row.userId);
      expect(db.query.mock.calls[0][1][1]).toBe(row.email);
      expect(db.query.mock.calls[0][1][2]).toBe(row.enable);
      expect(db.query.mock.calls[0][1][3]).toBe(row.role);
    });

    test('User.create with bad input', async () => {
      await expect(User.create('bad input')).rejects.toThrowError('UserId and Email are required.');
      expect(db.query.mock.calls).toHaveLength(0);
    });

    test('User.create with no input', async () => {
      await expect(User.create()).rejects.toThrowError('UserId and Email are required.');
      expect(db.query.mock.calls).toHaveLength(0);
    });
  });

  describe('deleting a user', () => {
    test('User.deleteUser', async () => {
      const data = dataForGetUser(1);
      const userId = data[0].userId;

      db.query.mockResolvedValue({ rows: data });
      const deleteUser = await User.deleteUser(userId);

      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe('DELETE FROM "user" WHERE "userId"=$1;');
      expect(db.query.mock.calls[0][1]).toHaveLength(1);
      expect(db.query.mock.calls[0][1][0]).toBe(userId);
      expect(deleteUser).toBe(true);
    });

    test('User.deleteUser with database error', async () => {
      const data = dataForGetUser(1);
      const userId = data[0].userId;

      // error thrown during call to db query
      db.query.mockRejectedValueOnce(new Error('a testing database error'));
      await expect(User.deleteUser(userId)).rejects.toThrowError('a testing database error');

      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe('DELETE FROM "user" WHERE "userId"=$1;');
      expect(db.query.mock.calls[0][1]).toHaveLength(1);
      expect(db.query.mock.calls[0][1][0]).toBe(userId);
    });

    test('User.deleteUser with no input', async () => {
      await expect(User.deleteUser()).rejects.toThrowError('UserId is required.');
    });
  });
  describe('editing a user', () => {
    test('User.edit', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      row.enable = false;
      row.role = 'admin';
      const newValues = { enable: row.enable, role: row.role };

      db.query.mockResolvedValue({ rows: data });
      const user = await User.edit(row.userId, newValues);

      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'UPDATE "user" SET "enable"=$2, "role"=$3 WHERE "userId"=$1 RETURNING *;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(3);
      expect(db.query.mock.calls[0][1][0]).toBe(row.userId);
      expect(db.query.mock.calls[0][1][1]).toBe(row.enable);
      expect(db.query.mock.calls[0][1][2]).toBe(row.role);
      for (const key in Object.keys(row)) {
        expect(user).toHaveProperty(key, row[key]);
      }
    });

    test('User.edit with database error', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      row.enable = false;
      row.role = 'admin';
      const newValues = { enable: row.enable, role: row.role };

      // error thrown during call to db query
      db.query.mockRejectedValueOnce(new Error('a testing database error'));
      await expect(User.edit(row.userId, newValues)).rejects.toThrowError(
        'a testing database error'
      );

      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'UPDATE "user" SET "enable"=$2, "role"=$3 WHERE "userId"=$1 RETURNING *;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(3);
      expect(db.query.mock.calls[0][1][0]).toBe(row.userId);
      expect(db.query.mock.calls[0][1][1]).toBe(row.enable);
      expect(db.query.mock.calls[0][1][2]).toBe(row.role);
    });

    test('User.edit with bad input', async () => {
      await expect(User.edit('userId', 'bad input')).rejects.toThrowError(
        'UserId and new Status and Role are required.'
      );
      expect(db.query.mock.calls).toHaveLength(0);
    });

    test('User.edit with no input', async () => {
      await expect(User.edit()).rejects.toThrowError(
        'UserId and new Status and Role are required.'
      );
      expect(db.query.mock.calls).toHaveLength(0);
    });
  });
  describe('checking user permissions with hasMinimumPermission', () => {
    test('do not allow unprivieged user to use admin role features', () => {
      const data = dataForGetUser(1);
      const testUser = data[0];
      expect(User.hasMinimumPermission(testUser, 'admin')).toBe(false);
      expect(User.hasMinimumPermission(testUser, 'user')).toBe(true);
    });

    test('allow admins to use all permissions', () => {
      const data = dataForGetUser(1);
      const testUser = data[0];
      // make this an admin
      testUser.role = 'admin';
      // run tests
      expect(User.hasMinimumPermission(testUser, 'admin')).toBe(true);
      expect(User.hasMinimumPermission(testUser, 'user')).toBe(true);
    });

    test('standard user test with invalid permission', () => {
      const data = dataForGetUser(1);
      const testUser = data[0];
      expect(User.hasMinimumPermission(testUser, '')).toBe(false);
      expect(User.hasMinimumPermission(testUser, undefined)).toBe(false);
      expect(User.hasMinimumPermission(testUser, {})).toBe(false);
    });

    test('admin test with invalid permission', () => {
      const data = dataForGetUser(1);
      const testUser = data[0];
      // make this an admin
      testUser.role = 'admin';
      // run tests
      expect(User.hasMinimumPermission(testUser, '')).toBe(false);
      expect(User.hasMinimumPermission(testUser, undefined)).toBe(false);
      expect(User.hasMinimumPermission(testUser, {})).toBe(false);
    });

    test('with an empty or invalid user', () => {
      expect(User.hasMinimumPermission({}, 'admin')).toBe(false);
      expect(User.hasMinimumPermission({}, 'user')).toBe(false);
      expect(User.hasMinimumPermission({}, '')).toBe(false);
      expect(User.hasMinimumPermission(undefined, 'admin')).toBe(false);
      expect(User.hasMinimumPermission(undefined, 'user')).toBe(false);
      expect(User.hasMinimumPermission(undefined, '')).toBe(false);
      expect(User.hasMinimumPermission([], 'admin')).toBe(false);
      expect(User.hasMinimumPermission([], 'user')).toBe(false);
      expect(User.hasMinimumPermission([], '')).toBe(false);
    });
  });

  describe('Count Users', () => {
    test('One User in the Database', async () => {
      db.query.mockResolvedValue({ rows: [{ count: 1 }] });
      const res = await User.count();
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(1);
      expect(db.query.mock.calls[0][0]).toBe(`SELECT COUNT(*) FROM "user"`);
      expect(res).toHaveProperty('count', 1);
    });
  });
  test('Unexpected condition, no return', async () => {
    db.query.mockResolvedValue({ rows: [] });
    await expect(User.count()).rejects.toThrowError('Some Error Occurred');
    expect(db.query.mock.calls).toHaveLength(1);
    expect(db.query.mock.calls[0]).toHaveLength(1);
    expect(db.query.mock.calls[0][0]).toBe(`SELECT COUNT(*) FROM "user"`);
  });
});
