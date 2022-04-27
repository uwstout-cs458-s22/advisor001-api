// We need models for setClearanceLevel
global.jest.init();
const { User, sampleStytchAuthenticationInfo, samplePrivilegedUser, dataForGetUser } = global.jest;

const stytchwrapper = require('./stytchwrapper');
const auth = require('./auth');
const { getMockReq, getMockRes } = require('@jest-mock/express');

jest.mock('./stytchwrapper', () => {
  return {
    authenticateStytchSession: jest.fn(),
  };
});

const { res, next, clearMockRes } = getMockRes({});

describe('auth tests', () => {
  beforeEach(() => {
    clearMockRes();
    stytchwrapper.authenticateStytchSession.mockReset();
  });

  describe('authorizeSession suite', () => {
    test('authorizeSession - no authorization header', async () => {
      const req = getMockReq();
      await auth.authorizeSession(req, res, next);
      expect(next.mock.calls).toHaveLength(1);
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toBe('Authorization of User Failed: No Token');
    });

    test('authorizeSession - no bearer token', async () => {
      const req = getMockReq({
        headers: {
          authorization: 'foo',
        },
      });
      await auth.authorizeSession(req, res, next);
      expect(next.mock.calls).toHaveLength(1);
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toBe('Authorization of User Failed: No Token');
    });

    test('authorizeSession - Bearer with no token', async () => {
      const req = getMockReq({
        headers: {
          authorization: 'Bearer ',
        },
      });
      await auth.authorizeSession(req, res, next);
      expect(next.mock.calls).toHaveLength(1);
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toBe('Authorization of User Failed: No Token');
    });

    test('authorizeSession - Bearer expired/bad token', async () => {
      const req = getMockReq({
        headers: {
          authorization: 'Bearer mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q',
        },
      });
      stytchwrapper.authenticateStytchSession.mockRejectedValueOnce({
        status_code: 404,
        error_message: 'Session expired.',
      });
      await auth.authorizeSession(req, res, next);
      expect(stytchwrapper.authenticateStytchSession.mock.calls).toHaveLength(1);
      expect(next.mock.calls).toHaveLength(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
      expect(next.mock.calls[0][0].message).toBe('Authorization Failed: Session expired.');
    });

    test('authorizeSession - Good Bearer token', async () => {
      const req = getMockReq({
        headers: {
          authorization: 'Bearer mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q',
        },
      });
      // mock a regular user logging in
      stytchwrapper.authenticateStytchSession.mockResolvedValue(
        sampleStytchAuthenticationInfo(dataForGetUser(1)[0])
      );
      await auth.authorizeSession(req, res, next);
      expect(stytchwrapper.authenticateStytchSession.mock.calls).toHaveLength(1);
      expect(next).toBeCalled();
      expect(next.mock.calls[0]).toHaveLength(0); // no parameters means its a non-error call to the next middleware
    });

    test('authorizeSession - should add a property to req', async () => {
      const req = getMockReq({
        headers: {
          authorization: 'Bearer mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q',
        },
      });
      // mock a regular user logging in
      const authInfo = sampleStytchAuthenticationInfo(dataForGetUser(1)[0]);
      stytchwrapper.authenticateStytchSession.mockResolvedValue(authInfo);
      // call the middleware
      await auth.authorizeSession(req, res, next);
      expect(stytchwrapper.authenticateStytchSession.mock.calls).toHaveLength(1);
      expect(next).toBeCalled();
      expect(next.mock.calls[0]).toHaveLength(0);

      // we need the stytch info for setClearanceLevel
      expect(req).toHaveProperty('stytchAuthenticationInfo');
      expect(req.stytchAuthenticationInfo).toStrictEqual(authInfo);
    });
  });

  describe('setClearanceLevel suite', () => {
    beforeEach(User.resetAllMocks);

    const loginAs = (user, dbUser, resolve = true) => {
      User.findOne[resolve ? 'mockResolvedValueOnce' : 'mockRejectedValueOnce'](
        dbUser !== undefined ? dbUser : user
      );
      return getMockReq({
        headers: {
          authorization: 'Bearer mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q',
        },
        stytchAuthenticationInfo: sampleStytchAuthenticationInfo(user),
      });
    };

    test('when the user is not found', async () => {
      // setup
      const middleware = auth.setClearanceLevel('admin');
      const user = dataForGetUser(1)[0];
      const req = loginAs(user, {}); // NO USER IN DB
      // do the call
      await middleware(req, res, next);
      expect(next).toBeCalled();
      expect(next.mock.calls[0]).toHaveLength(1);
      expect(next.mock.calls[0][0].statusCode).toBe(500);
      expect(next.mock.calls[0][0].message).toBe('Your account is not found in the database!');
    });

    test('when the user is not authorized', async () => {
      // setup
      const middleware = auth.setClearanceLevel('admin');
      const user = dataForGetUser(1)[0];
      const req = loginAs(user);
      // do the call
      await middleware(req, res, next);
      expect(next).toBeCalled();
      expect(next.mock.calls[0]).toHaveLength(1);
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toBe('You are not allowed to do that!');
    });

    test('when the user is authorized', async () => {
      // setup
      const middleware = auth.setClearanceLevel('admin');
      const user = samplePrivilegedUser();
      const req = loginAs(user); // NO USER IN DB
      // do the call
      await middleware(req, res, next);
      expect(next).toBeCalled();
      expect(next.mock.calls[0]).toHaveLength(0); // next() means no error
    });

    test('when an unknown error occurs', async () => {
      // setup
      const middleware = auth.setClearanceLevel('admin');
      const user = samplePrivilegedUser();
      // User.findOne REJECTS, unknown error
      const req = loginAs(user, new Error('Lorem ipsum dolor sit amet'), false);
      // do the call
      await middleware(req, res, next);
      expect(next).toBeCalled();
      expect(next.mock.calls[0]).toHaveLength(1);
      expect(next.mock.calls[0][0].statusCode).toBe(500);
      expect(next.mock.calls[0][0].message).toBe('An unknown error occurred during authorization!');
    });
  });
});
