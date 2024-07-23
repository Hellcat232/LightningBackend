import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { signToken } from '../services/jwtServices.js';
import { User } from '../db/user.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authRouter = Router();

authRouter.post('/google', async (req, res) => {
  const { token } = req.body;
  console.log('Received token:', token);

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;
    console.log('Google payload:', payload);

    let user = await User.findOne({ googleId: sub });
    if (!user) {
      user = new User({ googleId: sub, email, name, avatar: picture });
      await user.save();
    }

    const accessToken = signToken(user.id, process.env.ACCESS_SECRET_KEY, '1h');
    const refreshToken = signToken(
      user.id,
      process.env.REFRESH_SECRET_KEY,
      '7d',
    );

    res.json({ accessToken, refreshToken, user });
  } catch (error) {
    console.error('Error verifying Google token:', error);
    res.status(400).json({ error: 'Invalid ID token' });
  }
});

export default authRouter;
