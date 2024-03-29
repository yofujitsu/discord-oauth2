const express = require('express');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const router = express.Router();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(router);

let users = {};

router.get('/user/me', async (req, res) => {
  const user = users[0];
  if (user) {
    const userData = {
      id: user.id,
      username: user.username,
      avatar: user.avatar
    };
    res.json(userData);
  } else {
    res.status(404).send('Пользователь не найден');
  }
});


router.get('/auth/discord/login', async (req, res) => {
  const url =
    'https://discord.com/oauth2/authorize?client_id=1223253150773809222&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fauth%2Fdiscord%2Fcallback&scope=identify';

  res.redirect(url);
});

router.get('/auth/discord/callback', async (req, res) => {
  if (!req.query.code) {
    throw new Error('Code not provided.');
  }

  const { code } = req.query;
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.DISCORD_REDIRECT_URI
  });

  try {
    const response = await axios.post('https://discord.com/api/oauth2/token', params);

    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${response.data.access_token}`
      }
    });

    const { id, username, avatar } = userResponse.data;

    users[0] = { id, username, avatar };
    console.log({ id, username, avatar });
    res.redirect(process.env.CLIENT_REDIRECT_URL);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(4000, () => {
    console.log('Server running on port 4000');
  });
