const env = require('./environment');
const stytch = require('stytch');

/**
 * Checks authentication of current Stythch Session
 * 
 * @param  {String} token Authentication Token from authentication header
 *
 * @returns {Object} Authentication result from current session
 */
async function authenticateStytchSession(token) {
  const client = new stytch.Client({
    project_id: env.stytchProjectId,
    secret: env.stytchSecret,
    env: env.stytchEnv,
  });
  const result = client.sessions.authenticate({
    session_token: token,
    session_duration_minutes: env.sessionDuration,
  });
  return result;
}

module.exports = {
  authenticateStytchSession,
};
