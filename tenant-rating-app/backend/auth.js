require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

/**
 * Verifies Google ID token and returns user info.
 * @param {string} token - Google ID token from frontend
 * @returns {Promise<{ email, name, picture, googleId }>}
 */
async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return {
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    googleId: payload.sub,
  };
}

module.exports = { verifyGoogleToken };
