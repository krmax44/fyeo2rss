# FYEO to RSS

Podcasts are defined by their open and decentralized nature. Not by big media companies.

## Installation

```bash
yarn install
export HOST="http://yourip:3000"
yarn start
```

## Usage

Find your podcast (only JSON for now, no UI yet):

```
http://yourip:3000/search?query=podcastname
```

Found your podcast? Write down the `id` and add the link to your podcast player:

```bash
http://yourip:3000/feed/$id.xml
# example:
http://yourip:3000/feed/a7f35628-329daef1-1f3c74a1-7f43aa66.xml
```

Done! You can either host this on a spare server or start it on-demand.

## Related projects

- [Spotifeed](https://github.com/timdorr/spotifeed)
