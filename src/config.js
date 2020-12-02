export const config = {
  homeURL: new URL(
    process.env.NODE_ENV === 'production'
      ? 'https://devnoot.github.io/spotify-tab-finder/'
      : 'http://localhost:5000/',
  ),
  spotify: {
    clientId:
      process.env.NODE_ENV === 'production'
        ? '31a08164715940a08d4add6eb1372142'
        : 'ffa7f70d4d5a429589da2f1bc6ffbe23',
  },
}
