import {Component, OnInit} from '@angular/core';
import {UserDialogComponent} from './dialog/user-dialog/user-dialog.component';
import {TrackDialogComponent} from './dialog/track-dialog/track-dialog.component';
import {SearchService} from "./services/search.service";
import {SettingsService} from "./services/settings.service";
import {MatDialog} from '@angular/material';
import {MatSnackBar} from '@angular/material';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  token:string;
  refreshToken:string;
  artistForSearch:string;
  searchHistory:any;
  savedAlbums:any;
  visibleAlbums:any;
  albumsToStore:any;
  activeSearchedArtist:any;
  selectedArtist:any;
  artistAlbums:any;
  nextAlbums:any;
  selectedAlbum:any;
  storedAlbumsToView:any;
  userData:any;
  searchTab:boolean;
  settingsTab:boolean;
  initialTokenRequest:boolean;

  constructor(private http:HttpClient, private searchService:SearchService,
              private settingsService:SettingsService,
              public dialog:MatDialog,
              public snackBar:MatSnackBar) {
    this.savedAlbums = [];
    this.searchTab = true;
    this.settingsTab = false;
    this.visibleAlbums = 5;
    this.albumsToStore = 5;
    this.activeSearchedArtist = [];
    this.searchHistory = [];
    this.nextAlbums = false;
    this.initialTokenRequest = true;

    // Subscribe to various subjects
    this.searchService.snackBarSubject.subscribe((message)=> {
      this.openSnackBar(message);
    });
    this.searchService.searchedArtists.subscribe((artists)=> {
      this.activeSearchedArtist = artists.items;
      this.animateScroll('searchResults');
    });
    this.searchService.selectedArtist.subscribe((artist)=> {
      this.selectedArtist = artist;
      this.animateScroll('artistDetails');
    });
    this.searchService.artistAlbums.subscribe((albums)=> {
      this.artistAlbums = albums;
    });
    this.searchService.selectedAlbum.subscribe((album)=> {
      this.selectedAlbum = album;
      this.settingsService.updateSavedAlbums(this.albumsToStore, this.selectedAlbum);
      this.animateScroll('albumDetails');
    });
    this.searchService.userData.subscribe((user)=> {
      this.userData = user;
    });
    this.settingsService.albumsToView.subscribe((albums)=> {
      this.savedAlbums = albums;
      this.storedAlbumsToView = this.savedAlbums.slice(0, this.visibleAlbums);
    });
  }

  ngOnInit() {
    // Initial read albums from local storage
    this.settingsService.readSavedAlbums(this.albumsToStore);
    this.getToken();
  }

  // Requesting token from backend
  getToken() {
    let url = '/token?initial=' + this.initialTokenRequest;
    this.http.get(url)
      .subscribe((res) => {
        try {
          if (res['token'] != this.token) {
            this.token = res['token'];
            if (this.initialTokenRequest) {
              this.searchService.readUserDetails(this.token);
            } else {
              this.openSnackBar('Token updated');
            }
          }
          this.initialTokenRequest = false;
          this.getToken();
        } catch (e) {
          console.error(e);
        }
      }, (error) => {
        this.initialTokenRequest = false;
        this.openSnackBar('Unable to get token');
        console.warn("Unable to get token");
      });
  }

  initValues() {
    this.activeSearchedArtist = [];
    this.selectedArtist = undefined;
    this.artistAlbums = undefined;
    this.nextAlbums = undefined;
    this.selectedAlbum = undefined;
  }

  // Searching for artists
  search() {
    this.initValues();
    this.searchHistory.unshift(this.artistForSearch);
    if (this.searchHistory.length > 5) {
      this.searchHistory.pop();
    }
    this.searchService.searchForArtist(this.token, this.artistForSearch);
  }

  // Open artist details
  artistDetails(artist, next) {
    this.searchService.openArtist(this.token, artist, next);
  }

  // Open artist from list of album
  newArtist(id) {
    this.searchService.newArtist(this.token, id);
  }

  // Open album details
  openAlbum(album) {
    this.searchService.openAlbum(this.token, album);
  }

  // Updating recently viewed data
  updateSavedAlbums(album?) {
    this.settingsService.updateSavedAlbums(this.albumsToStore, album);
  }

  // User dialog
  openUserDialog():void {
    let dialogRef = this.dialog.open(UserDialogComponent, {
      width: '350px',
      data: {token: this.token, userData: this.userData}
    });
  }

  // Track dialog
  trackDialog(track):void {
    let dialogRef = this.dialog.open(TrackDialogComponent, {
      width: '350px',
      data: {track: track, token: this.token}
    });
  }

  // Switching between tabs
  searchTabActive() {
    this.searchTab = true;
    this.settingsTab = false;
  };

  settingsTabActive() {
    this.searchTab = false;
    this.settingsTab = true;
  };

  // Snack bar function
  openSnackBar(message) {
    this.snackBar.open(message, null, {
      duration: 2000,
    });
  }

  // Functions for scroll animation
  animateScroll(element) {
    let target = document.getElementById(element);
    this.animate(document.scrollingElement || document.documentElement, "scrollTop", "", window.pageYOffset, target.offsetTop, 500, true);
  }

  animate(elem, style, unit, from, to, time, prop) {
    if (!elem) {
      return;
    }
    let start = new Date().getTime(),
      timer = setInterval(function () {
        let step = Math.min(1, (new Date().getTime() - start) / time);
        if (prop) {
          elem[style] = (from + step * (to - from)) + unit;
        } else {
          elem.style[style] = (from + step * (to - from)) + unit;
        }
        if (step === 1) {
          clearInterval(timer);
        }
      }, 25);
    if (prop) {
      elem[style] = from + unit;
    } else {
      elem.style[style] = from + unit;
    }
  }
}
