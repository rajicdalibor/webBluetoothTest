import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class SearchService {
  nextAlbums:any;
  snackBarSubject:Subject<any>;
  searchedArtists:Subject<any>;
  selectedArtist:Subject<any>;
  artistAlbums:Subject<any>;
  selectedAlbum:Subject<any>;
  userData:Subject<any>;

  constructor(private http:HttpClient) {
    this.snackBarSubject = new Subject();
    this.searchedArtists = new Subject();
    this.selectedArtist = new Subject();
    this.artistAlbums = new Subject();
    this.selectedAlbum = new Subject();
    this.userData = new Subject();
  }

  // Get artists from name
  searchForArtist(token, artist) {
    this.http.get('https://api.spotify.com/v1/search?q=' + artist + '&type=artist', {headers: {'Authorization': 'Bearer ' + token}})
      .subscribe((res) => {
        try {
          if (!res.hasOwnProperty('artists')) {
            return;
          }
          let artists = res['artists'];
          if (artists.hasOwnProperty('items') && artists['items'].length > 0) {
            this.searchedArtists.next(artists);
          }
        } catch (e) {
          console.error(e);
        }
      }, (error) => {
        this.snackBarSubject.next('Unable to search for artists');
        console.warn("Unable to search for artists");
      });
  };

  // Get artist from artist id
  openArtist = (token, artist, next) => {
    this.selectedArtist.next(artist);
    let url;
    if (next && this.nextAlbums) {
      url = this.nextAlbums;
    } else {
      url = 'https://api.spotify.com/v1/artists/' + artist.id + '/albums';
    }
    this.http.get(url, {headers: {'Authorization': 'Bearer ' + token}})
      .subscribe((res) => {
        try {
          if (!res.hasOwnProperty('next')) {
            return;
          }
          this.nextAlbums = res['next'];
          if (!res.hasOwnProperty('items')) {
            return;
          }
          this.artistAlbums.next(res['items']);
        } catch (e) {
          console.error(e);
        }
      }, (error) => {
        this.snackBarSubject.next('Unable to open artist');
        console.warn("Unable to open artist");
      });
  };

  // Get artist from artist list
  newArtist(token, id) {
    let url = 'https://api.spotify.com/v1/artists/' + id;
    this.http.get(url, {headers: {'Authorization': 'Bearer ' + token}})
      .subscribe((res) => {
        try {
          this.openArtist(token, res, false);
        } catch (e) {
          console.error(e);
        }
      }, (error) => {
        this.snackBarSubject.next('Unable to open artist');
        console.warn("Unable to open artist");
      });
  }

  // Open album from id
  openAlbum(token, album) {
    let url = 'https://api.spotify.com/v1/albums/' + album.id;
    this.http.get(url, {headers: {'Authorization': 'Bearer ' + token}})
      .subscribe((res) => {
        try {
          this.selectedAlbum.next(res);
        } catch (e) {
          console.error(e);
        }
      }, (error) => {
        this.snackBarSubject.next('Unable to open album');
        console.warn("Unable to open album");
      });
  };

  // Get user details
  readUserDetails(token) {
    // Hardcoded for demo
    const userId = 's33qlm9iqvdx5q94ybekhzrq1';
    this.http.get('https://api.spotify.com/v1/users/'+userId, {headers: {'Authorization': 'Bearer ' + token}})
      .subscribe((res) => {
        try {
          let data = {};
          data['displayName'] = res['display_name'];
          data['numberOfFollowers'] = res['followers'].total;
          data['id'] = res['id'];
          this.userData.next(data);
          this.snackBarSubject.next('Welcome ' + data['displayName']);
        } catch (e) {
          console.error(e);
        }
      }, (error) => {
        this.snackBarSubject.next('Unable to read user details');
        console.warn("Unable to read user details");
      });
  }
}
