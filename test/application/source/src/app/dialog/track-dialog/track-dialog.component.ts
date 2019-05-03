import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-track-dialog',
  templateUrl: './track-dialog.component.html',
  styleUrls: ['./track-dialog.component.css']
})
export class TrackDialogComponent implements OnInit {
  token: any;
  album: any;
  name: any;
  duration: any;
  discNumber: any;
  trackNumber: any;
  popularity: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private http: HttpClient) { }

  ngOnInit() {
    let track = this.data.track;
    this.token = this.data['token'];
    this.openTrack(track['id']);
  }
  
  // Get track details from track id
  openTrack(id){
    this.http.get('https://api.spotify.com/v1/tracks/'+id, { headers: { 'Authorization': 'Bearer ' + this.token} })
      .subscribe((res) => {
        try{
          let data = res;
          this.album = data['album'].name;
          this.name = data['name'];
          this.duration = millisToMinutesAndSeconds(data['duration_ms']);
          this.discNumber = data['disc_number'];
          this.trackNumber = data['track_number'];
          this.popularity = data['popularity'];
        } catch(e){
          console.error(e);
        }
      },() => {
        console.warn("Unable to get");
      });
  }
}

// Helper for converting milliseconds to readable value
function millisToMinutesAndSeconds(millis) {
  let minutes = Math.floor(millis / 60000);
  let seconds = ((millis % 60000) / 1000).toFixed(0);
  if(parseInt(seconds) < 10){
    seconds = '0' + seconds.toString();
  }
  return minutes + ":" + seconds;
}
