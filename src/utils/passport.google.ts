import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserModel } from "../models/user";
import { generateToken } from "./jwt.handle";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: "http://localhost:4000/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                if (!email) {
                    return done(new Error("No email found in Google profile"), undefined);
                }

                let user = await UserModel.findOne({ email });

                if (!user) {
                    user = new UserModel({
                        name: profile.displayName,
                        email,
                        password: "",
                        phone: "",
                        available: true,
                        packets: [],
                        birthdate: new Date(),
                        isProfileComplete: false,
                    });
                    await user.save();
                }

                const accessToken = generateToken({ name: user.name }, "access");
                const refreshToken = generateToken({ name: user.name }, "refresh");

                done(null, { user, accessToken, refreshToken, isProfileComplete: user.isProfileComplete });
            } catch (error) {
                console.error("Error en la estrategia de Google:", error);
                done(error, undefined);
            }
        }
    )
);


export default passport;