import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { signToken } from "../utils/token.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {

    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const email = payload.email;
    const name = payload.name;
    const avatar = payload.picture;
    const googleId = payload.sub;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        avatar
      });
    }

    const token = signToken(user._id, "user");

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.log("GOOGLE LOGIN ERROR:", error);
    res.status(500).json({ message: "Google login failed" });
  }
};
