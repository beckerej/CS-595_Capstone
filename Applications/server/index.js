const express = require('express')
const app = express()
const fs = require('fs');
const mkdirp = require('mkdirp');
const readline = require('readline');
const {google} = require('googleapis');
const OAuth2Client = google.auth.OAuth2;
const SCOPES = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = 'credentials.json';

app.get('/', (req, res) => {
    var CAL = {
        events: [],
        calendars: []
    }
    
    // Load client secrets from a local file.
    fs.readFile('client_secret.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Drive API.
    //authorize(JSON.parse(content), listEvents);
    authorize(JSON.parse(content), getCalendars);
    setTimeout(function() {
        res.json(CAL)
      }, 2000);
  });
  
  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);
  
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }
  
  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return callback(err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  }
  
  /**
   * Lists the next 10 events on the user's primary calendar.
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  function listEvents(auth, calId) {
    const calendar = google.calendar({version: 'v3', auth});
    calendar.events.list({
      calendarId: calId,
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    }, (err, {data}) => {
      if (err) return console.log('The API returned an error: ' + err);
      const events = data.items;
      if (events.length) {
          //console.log(events)
          CAL.events.push(events);
        // console.log(`Upcoming 10 events with id ${calId}:`);
        // events.map((event, i) => {
        //   const start = event.start.dateTime || event.start.date;
        //   console.log(`${start} - ${event.summary}`);
        // });
      } else {
        console.log('No upcoming events found.');
      }
    });
  }
  
  function getCalendars(auth) {
    const calendar = google.calendar({version: 'v3', auth});
    calendar.calendarList.list({
  
    }, (err, {data}) => {
      if (err) return console.log('The API returned an error: ' + err);
      const _calendars = data.items;
      if (_calendars.length) {
        console.log('Calendars:');
        _events = []
        _calendars.map((calendar, i) => {
          listEvents(auth, calendar.id);
          console.log(calendar)
        });
        CAL.calendars = _calendars;
      } else {
        console.log('No upcoming events found.');
      }
    });
  }
  
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))