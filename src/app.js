const express = require('express');
const app = express();
const axios = require('axios');
const Podcast = require('podcast');
const fs = require('fs-extra');
const path = require('path');
const findRemove = require('find-remove');

const HOST = 'https://api.fyeo.de';
const headers = { 'User-Agent': 'FYEO/1.12.1_4475-8b4784be/Android_10/Mi 9T' };
const cacheDir = path.join(__dirname, '../', 'cache');

app.get('/search', async (req, res) => {
  try {
    const { data } = await axios.get(HOST + '/search', {
      params: {
        query: req.query.query,
        types: 'podcasts,episodes',
        'limit.podcasts': 10,
        'limit.episodes': 5,
        languages: 'de,en,fr,es,other'
      },
      headers
    });

    res.json(data);
  } catch (e) {
    handleError(e, res);
  }
});

app.get('/feed/:id.xml', async (req, res) => {
  try {
    const { data } = await axios.get(`${HOST}/podcasts/${req.params.id}`, {
      params: {
        sort: 'DESC',
        'limit.episodes': 100
      },
      headers
    });

    const feed = new Podcast({
      title: data.title,
      description: data.description,
      generator: 'FYEO2RSS',
      imageUrl: data.images.cover.url
    });

    for (const episode of data._embedded.episodes) {
      const url = `${process.env.HOST}/episode/${episode.id}.mp3`;

      feed.addItem({
        title: episode.title,
        description: episode.description,
        guid: episode.id,
        date: episode.publishedAt,
        url,
        enclosure: {
          type: 'audio/mpeg',
          url
        },
        itunesDuration: episode.duration,
        itunesAuthor: episode.author
      });
    }

    res.set('Content-Type', 'text/xml');
    res.send(feed.buildXml());
  } catch (e) {
    handleError(e, res);
  }
});

app.get('/episode/:id.mp3', async (req, res) => {
  try {
    const { id } = req.params;

    const { data } = await axios.get(
      `https://protector.fyeo.de/episodes/${id}.mp3`,
      {
        headers,
        responseType: 'arraybuffer'
      }
    );

    res.set('Content-Type', 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');

    const file = path.join(cacheDir, id);
    if (
      await fs
        .access(file)
        .then(r => true)
        .catch(r => false)
    ) {
      return res.send(await fs.readFile(file));
    }

    await fs.mkdirp('cache');
    await fs.writeFile(file, data);

    res.send(data);
  } catch (e) {
    handleError(e, res);
  }
});

function handleError(err, res) {
  res.json({
    error: true,
    message: err.message
  });
}

app.listen(process.env.PORT || 3000, (...s) => {
  setInterval(() => {
    findRemove(cacheDir, { age: { seconds: 3600 } });
  }, 3600);
});
