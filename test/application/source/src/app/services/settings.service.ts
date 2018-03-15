import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class SettingsService {
  savedAlbums:any;
  visibleAlbums:any;
  albumsToView:Subject<any>;

  constructor() {
    this.savedAlbums = [];
    this.visibleAlbums = [];
    this.albumsToView = new Subject();
  }

  // Read albums on load from local storage
  readSavedAlbums(albumsToStore) {
    if (localStorage.getItem("savedAlbums")) {
      this.savedAlbums = JSON.parse(localStorage.getItem("savedAlbums"));
      this.albumsToView.next(this.savedAlbums);
    }
  };

  // Update local storage and recently viewed
  updateSavedAlbums(albumsToStore, album?) {
    if (album) {
      let albumExists = false;
      if (this.savedAlbums && this.savedAlbums.length > 0) {
        for (let i = 0; i < this.savedAlbums.length; i++) {
          if (album.id == this.savedAlbums[i].id) {
            albumExists = true;
          }
        }
      }
      if (!albumExists) {
        this.savedAlbums.unshift(album);
      }
    }
    if (this.savedAlbums.length > albumsToStore) {
      this.savedAlbums.splice(albumsToStore - this.savedAlbums.length);
    }
    this.albumsToView.next(this.savedAlbums);
    localStorage.setItem('savedAlbums', JSON.stringify(this.savedAlbums));
  };
}
