import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "../models/User.js";

export const configurePassport = () => {
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];

  // --------------------
  // Google Strategy
  // --------------------
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/api/auth/social/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          let user = await User.findOne({ email });

          if (!user) {
            user = await User.create({
              fullName: profile.displayName,
              email,
              password: null,
              socialProvider: "google",
              isAdmin: adminEmails.includes(email),
            });
          }

          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );

  // --------------------
  // Facebook Strategy
  // --------------------
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "http://localhost:5000/api/auth/social/facebook/callback",
        profileFields: ["id", "emails", "name", "displayName"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error("Facebook account has no email"), null);

          let user = await User.findOne({ email });
          if (!user) {
            user = await User.create({
              fullName: profile.displayName,
              email,
              password: null,
              socialProvider: "facebook",
              isAdmin: adminEmails.includes(email),
            });
          }

          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );

  // --------------------
  // Passport serialize / deserialize
  // --------------------
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
  });
};

// --------------------
// Helpers for routes
// --------------------
export const googleAuth = passport.authenticate("google", { scope: ["profile", "email"] });
export const facebookAuth = passport.authenticate("facebook", { scope: ["email"] });
