import React, { useState, useEffect } from 'react'
import SpotifyWebApi from 'spotify-web-api-js'
import { config } from './config'

const Spotify = new SpotifyWebApi()

const SongsterrButton = ({ onClick, label, ...rest }) => {
  return (
    <button className="songsterr-button" onClick={onClick} {...rest}>
      {label}
    </button>
  )
}

const NowPlayingCard = ({ artist, name, showNowPlaying, ...rest }) => {
  return (
    <div {...rest}>
      <h1>Now Playing</h1>
      <p className="artist">{artist}</p>
      <p className="title">{name}</p>
    </div>
  )
}

const App = () => {
  const spotifyToken = localStorage.getItem('spotifyAccessToken')

  const [isAuthed, setIsAuthed] = useState(Boolean(spotifyToken))
  const [token, setToken] = useState(spotifyToken)
  const [user, setUser] = useState(undefined)
  const [playing, setPlaying] = useState(undefined)
  const [tabUrl, setTabUrl] = useState('')

  const handleLoginClick = () => {
    const scopes = ['user-read-playback-state', 'user-read-currently-playing']

    // Redirect the user to Spotify
    const loginURL = new URL('https://accounts.spotify.com/authorize')

    const redirect = config.homeURL.toString()

    loginURL.search = new URLSearchParams({
      client_id: config.spotify.clientId,
      response_type: 'token',
      redirect_uri: redirect,
      scope: scopes.join(' '),
    }).toString()

    window.location = loginURL
  }

  const songsterQuery = async () => {
    const data = await fetch(
      `https://www.songsterr.com/a/ra/songs.json?pattern=${encodeURI(
        playing.name,
      )}`,
    )
    return await data.json()
  }

  const handleSongstersClick = () => {
    window.open(tabUrl)
  }

  const setSpotifyProfile = async () => {
    try {
      Spotify.setAccessToken(token)
      const me = await Spotify.getMe()
      setUser(me)
    } catch (e) {
      console.error(e)
      logout()
    }
  }

  const getCurrentlyPlaying = async () => {
    try {
      const now = await Spotify.getMyCurrentPlayingTrack()
      setPlaying(now.item)
    } catch (e) {
      console.error(e)
      logout()
    }
  }

  const logout = () => {
    localStorage.removeItem('spotifyAccessToken')
    window.location = config.homeURL.toString()
  }

  // If the user has a token in the URL set it
  useEffect(() => {
    const parts = document.location.href
      .toString()
      .match(/\#(?:access_token)\=([\S\s]*?)\&/)

    if (parts && parts[1]) {
      setToken(parts[1])
      // set the token in localstorage
      localStorage.setItem('spotifyAccessToken', parts[1])
      window.location = config.homeURL.toString()
    }
  }, [])

  useEffect(() => {
    if (token) {
      setIsAuthed(true)
    }
  }, [token])

  // Get the current user profile
  useEffect(() => {
    if (!token) return
    ;(async () => {
      await setSpotifyProfile()
      await getCurrentlyPlaying()
    })()
  }, [token])

  useEffect(() => {
    if (!playing) return
    ;(async () => {
      const stuff = await songsterQuery()
      const [first] = stuff
      const songId = first.id
      const url = `https://www.songsterr.com/a/wa/song?id=${songId}`
      setTabUrl(url)
    })()
  }, [playing])

  return (
    <div className={`${isAuthed ? 'app logged-in' : 'app'}`}>
      {isAuthed ? (
        <div className="logged-in">
          {playing && (
            <div>
              <div className="logout-container">
                <a href="#" className="logout" onClick={logout}>
                  Logout
                </a>
              </div>

              <NowPlayingCard
                name={playing.name}
                artist={playing.artists[0].name || ''}
              />
              {tabUrl && (
                <SongsterrButton
                  onClick={handleSongstersClick}
                  label="View tab on Songsterr"
                />
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="not-logged-in-container">
          <div className="instructions">
            <p>
              This app will find a Songsterr tab for your currently playing song
              on Spotify.
            </p>
          </div>
          <button className="login-button" onClick={handleLoginClick}>
            <span>Log in to Spotify</span>
          </button>
        </div>
      )}
    </div>
  )
}

export { App }
