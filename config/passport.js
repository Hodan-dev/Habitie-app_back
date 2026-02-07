const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

// Passport-ka OAuth
// Halkan waxaan ku dejinay Google iyo GitHub login (ikhtiyaari)
module.exports = () => {
  const baseUrl = process.env.OAUTH_CALLBACK_URL_BASE || 'http://localhost:5000';

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${baseUrl}/api/auth/google/callback`
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails && profile.emails[0]
              ? profile.emails[0].value
              : null;

            if (!email) {
              return done(null, false);
            }

            let user = await User.findOne({ email });
            if (!user) {
              user = await User.create({
                name: profile.displayName || 'User',
                email,
                authProvider: 'google',
                providerId: profile.id,
                password: null
              });
            }

            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: `${baseUrl}/api/auth/github/callback`,
          scope: ['user:email']
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails && profile.emails[0]
              ? profile.emails[0].value
              : `${profile.username}@users.noreply.github.com`;

            let user = await User.findOne({ email });
            if (!user) {
              user = await User.create({
                name: profile.displayName || profile.username || 'User',
                email,
                authProvider: 'github',
                providerId: profile.id,
                password: null
              });
            }

            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  }
};
