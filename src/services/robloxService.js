const axios = require('axios');

const ROBLOX_USERS_API = 'https://users.roblox.com/v1';
const ROBLOX_THUMBNAIL_API = 'https://thumbnails.roblox.com/v1/users/avatar-headshot';

async function getUserByUsername(username) {
  const payload = { usernames: [username], excludeBannedUsers: false };
  const response = await axios.post(`${ROBLOX_USERS_API}/usernames/users`, payload);
  const [user] = response.data.data || [];
  if (!user) {
    return null;
  }

  const details = await axios.get(`${ROBLOX_USERS_API}/users/${user.id}`);
  const avatar = await axios.get(ROBLOX_THUMBNAIL_API, {
    params: { userIds: user.id, size: '180x180', format: 'Png', isCircular: false }
  });

  return {
    id: String(user.id),
    username: user.name,
    displayName: user.displayName || details.data.displayName || user.name,
    created: details.data.created,
    isBanned: Boolean(details.data.isBanned),
    avatarUrl: avatar.data.data?.[0]?.imageUrl || ''
  };
}

async function getPreviousUsernames(userId) {
  try {
    const response = await axios.get(`${ROBLOX_USERS_API}/users/${userId}/username-history`, {
      params: { limit: 10, sortOrder: 'Asc' }
    });
    return (response.data.data || []).map((entry) => entry.name);
  } catch (_err) {
    return [];
  }
}

function computeAccountAgeDays(createdDate) {
  const created = new Date(createdDate);
  const now = new Date();
  return Math.max(0, Math.floor((now - created) / (1000 * 60 * 60 * 24)));
}

module.exports = {
  getUserByUsername,
  getPreviousUsernames,
  computeAccountAgeDays
};
