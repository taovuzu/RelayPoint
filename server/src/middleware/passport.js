import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "#db/index.db.js";
import { ApiError } from "#util/ApiError.js";

try {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, next) => {
        try {
          const email = profile.emails[0].value;
          let user = await prisma.user.findUnique({ where: { email } });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                fullName: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`,
                loginType: "GOOGLE",
                googleId: profile.id,
                isEmailVerified: true
              }
            });
          } else {
            if (user.loginType !== "GOOGLE") {
              user = await prisma.user.update({
                where: { email },
                data: {
                  loginType: "GOOGLE",
                  googleId: profile.id
                }
              });
            }
          }

          return next(null, user);
        } catch (error) {
          return next(new ApiError(500, "Google login failed", error));
        }
      }
    )
  );
} catch (error) {
  console.error("Passport initialization error", error);
}
export default passport;
