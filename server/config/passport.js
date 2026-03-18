const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = require('./keys');

module.exports = function (passport) {

  // GOOGLE STRATEGY
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
        proxy: true
      },
      async (accessToken, refreshToken, profile, done) => {
        try {

          const email = profile.emails && profile.emails.length > 0
            ? profile.emails[0].value.toLowerCase()
            : "";

          // Check if user already exists by googleId or email
          let existingUser = await User.findOne({
            $or: [
              { googleId: profile.id },
              { email }
            ]
          });

          if (existingUser) {
            existingUser.googleId = profile.id;
            existingUser.name = profile.displayName || existingUser.name;
            existingUser.email = email || existingUser.email;
            existingUser.profilePicture = (profile.photos && profile.photos.length > 0)
              ? profile.photos[0].value
              : existingUser.profilePicture;
            const updated = await existingUser.save();
            return done(null, updated);
          }

          // Create new user
          const newUser = new User({
            googleId: profile.id,
            name: profile.displayName || "No Name",
            email,
            profilePicture: profile.photos && profile.photos.length > 0
              ? profile.photos[0].value
              : ""
          });

          const savedUser = await newUser.save();

          return done(null, savedUser);

        } catch (error) {
          console.error("Google Auth Error:", error);
          return done(error, null);
        }
      }
    )
  );

  // SESSION STORE USER ID
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // GET USER FROM DB USING ID
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

};
