const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { computeAccountAgeDays } = require('../services/robloxService');
const { logActivity } = require('../services/logService');

const router = express.Router();

router.get('/login', (_req, res) => {
  const oauthUrl = new URL('https://apis.roblox.com/oauth/v1/authorize');
  oauthUrl.searchParams.set('client_id', process.env.ROBX_CLIENT_ID);
  oauthUrl.searchParams.set('redirect_uri', process.env.ROBX_REDIRECT_URI);
  oauthUrl.searchParams.set('response_type', 'code');
  oauthUrl.searchParams.set('scope', 'openid profile');
  oauthUrl.searchParams.set('state', 'static-state-change-in-production');
  res.render('auth/login', { oauthUrl: oauthUrl.toString(), error: null });
});

router.get('/roblox/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing authorization code.');

  try {
    const tokenResponse = await axios.post('https://apis.roblox.com/oauth/v1/token', {
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.ROBX_REDIRECT_URI,
      client_id: process.env.ROBX_CLIENT_ID,
      client_secret: process.env.ROBX_CLIENT_SECRET
    });

    const profileResponse = await axios.get('https://apis.roblox.com/oauth/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
    });

    const profile = profileResponse.data;
    const accountAgeDays = computeAccountAgeDays(profile.created_at || new Date().toISOString());

    const user = await User.findOneAndUpdate(
      { robloxId: String(profile.sub) },
      {
        robloxId: String(profile.sub),
        username: profile.preferred_username || profile.nickname || 'unknown',
        displayName: profile.name || profile.preferred_username || 'Unknown',
        avatarUrl: profile.picture || '',
        accountAgeDays,
        lastLoginAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const token = jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    await logActivity({ actor: user._id, action: 'login', ip: req.ip });
    return res.redirect('/');
  } catch (error) {
    return res.status(500).render('auth/login', {
      error: 'OAuth login failed. Check Roblox app credentials.',
      oauthUrl: '/auth/login'
    });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.redirect('/');
});

module.exports = router;
