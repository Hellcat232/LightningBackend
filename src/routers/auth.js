import { Router } from 'express';
import passport from 'passport';
import { OAuth2Client } from 'google-auth-library';
import { signToken } from '../services/jwtServices.js';
import { User } from '../db/user.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authRouter = Router();

authRouter.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

authRouter.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('https://lightning-team.vercel.app/tracker'); // Перенаправлення на фронтенд після успішної авторизації
  },
);

authRouter.post('/google', async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    let user = await User.findOne({ googleId: sub });
    if (!user) {
      user = new User({ googleId: sub, email, name, avatar: picture });
      await user.save();
    } else {
      // Якщо у юзера є токен то ми його видаляємо
      user.accessToken = null;
      user.refreshToken = null;
    }

    const accessToken = signToken(user.id, process.env.ACCESS_SECRET_KEY, '1h');
    const refreshToken = signToken(
      user.id,
      process.env.REFRESH_SECRET_KEY,
      '7d',
    );

    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    await user.save();

    res.json({ accessToken, refreshToken, user });
  } catch (error) {
    res.status(400).json({ error: 'Invalid ID token' });
  }
});

export default authRouter;
