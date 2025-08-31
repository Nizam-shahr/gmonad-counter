import { TwitterApi } from 'twitter-api-v2';

export default async function handler(req, res) {
  const { username } = req.query;

  if (!username || typeof username !== 'string' || username.length > 15 || !/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: 'Valid username required (alphanumeric, max 15 characters)' });
  }

  try {
    if (!process.env.X_API_KEY || !process.env.X_API_SECRET || !process.env.X_ACCESS_TOKEN || !process.env.X_ACCESS_SECRET) {
      console.error('Missing X API credentials: Ensure X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, and X_ACCESS_SECRET are set');
      return res.status(500).json({ error: 'Server configuration error: Missing API credentials' });
    }

    const client = new TwitterApi({
      appKey: process.env.X_API_KEY,
      appSecret: process.env.X_API_SECRET,
      accessToken: process.env.X_ACCESS_TOKEN,
      accessSecret: process.env.X_ACCESS_SECRET,
    });

    const user = await client.v2.userByUsername(username, { 'user.fields': 'profile_image_url' });
    if (!user.data) {
      console.log(`User ${username} not found`);
      return res.status(404).json({ error: 'User not found. Please enter a valid X username.' });
    }
    console.log(`Validated user ${username} with ID ${user.data.id}`);
    return res.status(200).json({ success: true, profile_image_url: user.data.profile_image_url });
  } catch (error) {
    console.error(`Error validating ${username}:`, {
      message: error.message,
      code: error.code,
      details: error.data || 'No additional data',
    });
    if (error.code === 401) {
      return res.status(401).json({ error: 'Authentication failed: Invalid or expired API credentials. Check X Developer Portal.' });
    }
    if (error.code === 403) {
      return res.status(403).json({ error: 'Authentication failed: Check API credentials and permissions in X Developer Portal' });
    }
    if (error.code === 429) {
      const resetTime = error.rateLimit?.reset
        ? new Date(error.rateLimit.reset * 1000).toISOString()
        : 'unknown';
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.', retryAfter: resetTime });
    }
    return res.status(500).json({ error: `Failed to validate username: ${error.message}` });
  }
}