webpackJsonp(["main"],{

/***/ "../../../../../src/$$_lazy_route_resource lazy recursive":
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "../../../../../src/$$_lazy_route_resource lazy recursive";

/***/ }),

/***/ "../../../../../src/app/app.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/app.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"wrapper\">\n  <div class=\"fw\">\n\n    <!--Toolbar-->\n    <mat-toolbar class=\"toolbar\">\n      <div fxLayout=\"row\" fxFlex=\"100\" class=\"colorWhite\" fxLayoutAlign=\"start center\">\n        <div fxFlex=\"30\" fxLayout=\"row\" fxLayoutAlign=\"start center\">\n          <div>\n            <img class=\"logo\" src=\"../assets/logo.png\">\n          </div>\n          <div class=\"logoStyle\">\n            MusicBOX\n          </div>\n        </div>\n        <div fxFlex=\"70\" fxLayout=\"row\" fxLayoutAlign=\"end center\">\n          <div *ngIf=\"searchTab\" class=\"mr5\" style=\"border-bottom: solid white\">\n            <img class=\"logo\" src=\"../assets/ic_search_white_36px.svg\">\n          </div>\n          <div class=\"clickable mr5\" *ngIf=\"!searchTab\" (click)=\"searchTabActive()\">\n            <img class=\"logo\" src=\"../assets/ic_search_white_36px.svg\">\n          </div>\n          <div *ngIf=\"settingsTab\" class=\"mr5\" style=\"border-bottom: solid white\">\n            <img class=\"logo\" src=\"../assets/ic_settings_white_36px.svg\">\n          </div>\n          <div class=\"clickable mr5\" *ngIf=\"!settingsTab\" (click)=\"settingsTabActive()\">\n            <img class=\"logo\" src=\"../assets/ic_settings_white_36px.svg\">\n          </div>\n          <div class=\"clickable\">\n            <img (click)=\"openUserDialog()\" class=\"logo\" src=\"../assets/ic_account_circle_white_36px.svg\">\n          </div>\n        </div>\n      </div>\n    </mat-toolbar>\n  </div>\n\n  <!--Main container-->\n  <div class=\"container\">\n    <div fxLayoutAlign=\"center center\">\n      <div fxFlex=\"95\" fxFlex.gt-sm=\"50\">\n        <div fxLayout=\"column\" fxLayoutAlign=\"center center\" *ngIf=\"searchTab\">\n          <div fxFlex=\"100\" class=\"title taCenter\">\n            SEARCH FOR YOUR FAVORITE ARTIST\n          </div>\n          <form class=\"example-form\" fxFlex=\"100\" fxLayout=\"row\" fxLayoutAlign=\"center end\">\n\n            <mat-form-field class=\"box-search m40\">\n              <input matInput #message maxlength=\"256\" placeholder=\"Artist\" [(ngModel)]=\"artistForSearch\"\n                     name=\"artistForSearch\" style=\"font-family: 'Roboto'\">\n              <mat-hint align=\"start\" style=\"font-family: 'Roboto'\"><strong>First or last name of artist</strong>\n              </mat-hint>\n            </mat-form-field>\n            <button mat-raised-button mat-primary\n                    style=\"height: 40px; margin-bottom: 20px; margin-left: 10px; font-family: 'Roboto'\"\n                    (click)=\"search()\" [disabled]=\"!artistForSearch\">SEARCH\n            </button>\n          </form>\n          <div fxLayoutAlign=\"start center\" class=\"box-search\" fxLayout=\"row\">\n            Searched:&nbsp;\n            <div *ngFor=\"let artist of searchHistory\">\n              {{artist}}&nbsp;\n            </div>\n\n          </div>\n          <div id=\"searchResults\" class=\"fw\">\n          <div fxLayoutAlign=\"start center\" class=\"box-search dark m40\" *ngIf=\"activeSearchedArtist.length > 0\">\n            <div class=\"pl5lr5\">\n              Search results\n            </div>\n          </div>\n          </div>\n          <div class=\"box-search\">\n            <div *ngFor=\"let artist of activeSearchedArtist | limitTo : 10\" fxLayoutAlign=\"start center\"\n                 class=\"artists onHover\">\n              <div fxFlex=\"100\" fxLayoutAlign=\"start center\" (click)=\"artistDetails(artist)\" class=\"clickable\">\n                <div fxFlex=\"50\" class=\"pl5lr5\" style=\"height: 50px; padding-top: 15px\">\n                  {{artist.name}}\n                </div>\n                <div fxFlex=\"50\" fxLayoutAlign=\"end center\">\n                  <div *ngIf=\"artist.images.length > 0\" class=\"pl5lr5\">\n                    <img class=\"img\" src={{artist.images[0].url}}>\n                  </div>\n                </div>\n              </div>\n            </div>\n          </div>\n          <div id=\"artistDetails\" class=\"fw\">\n          <div *ngIf=\"selectedArtist\" class=\"box-search m40 pt10pb10\" fxLayoutAlign=\"start center\">\n            <div fxFlex=\"100\" fxLayoutAlign=\"start center\">\n              <h1 fxFlex=\"50\">\n                {{selectedArtist.name}}\n              </h1>\n              <div *ngIf=\"selectedArtist.images.length > 0\" fxFlex=\"50\" fxLayoutAlign=\"end center\">\n                <img class=\"img-large\" src={{selectedArtist.images[0].url}}>\n              </div>\n            </div>\n          </div>\n          </div>\n          <div fxFlex=\"100\" fxLayout=\"column\" class=\"fw\">\n            <div fxLayoutAlign=\"start center\" fxLayout=\"row\" class=\"dark\" *ngIf=\"selectedArtist\">\n              <h2 fxFlex=\"50\" class=\"pl5lr5\">\n                Albums\n              </h2>\n              <div fxFlex=\"50\" fxLayoutAlign=\"end center\" style=\"margin-right: 3%\">\n                <h4 *ngIf=\"selectedArtist\" class=\"clickable\" (click)=\"artistDetails(selectedArtist, true)\">NEXT</h4>\n              </div>\n            </div>\n            <div *ngFor=\"let album of artistAlbums\" fxLayoutAlign=\"start center\" class=\"albums\">\n              <div fxFlex=\"100\" fxLayoutAlign=\"start center\" (click)=\"openAlbum(album)\" class=\"clickable onHoverUnderline\">\n                <div fxFlex=\"100\" class=\"pl5lr5\">\n                  {{album.name}}\n                </div>\n              </div>\n            </div>\n            <div id=\"albumDetails\">\n            <div class=\"box-search m40 fw\" fxLayoutAlign=\"center center\" fxLayout=\"row\" fxFlex=\"100\"\n                 *ngIf=\"selectedAlbum && selectedAlbum.images.length > 0\">\n              <div fxFlex=\"100\" fxLayoutAlign=\"center center\">\n                <div fxFlex=\"100\" fxLayoutAlign=\"start start\">\n                  <div fxFlex=\"50\" fxLayoutAlign=\"start start\" fxLayout=\"column\" class=\"fw\">\n                    <h2 class=\"fw\">{{selectedAlbum.name}}</h2>\n                    <h4 class=\"fw mb0 p5 dark\">Authors:</h4>\n                    <mat-list *ngFor=\"let artist of selectedAlbum.artists\" fxLayoutAlign=\"start center\">\n                      <mat-list-item fxFlex=\"100\" fxLayoutAlign=\"start center\" (click)=\"newArtist(artist.id)\"\n                                     class=\"clickable onHoverUnderline\">\n                        <div fxFlex=\"50\">\n                          {{artist.name}}\n                        </div>\n                      </mat-list-item>\n                    </mat-list>\n                  </div>\n                  <div fxFlex=\"50\" fxLayoutAlign=\"end center\">\n                    <img class=\"img-album\" src={{selectedAlbum.images[0].url}}>\n                  </div>\n                </div>\n              </div>\n            </div>\n            </div>\n            <div fxLayoutAlign=\"start start\" fxFlex=\"100\" class=\"m40\" *ngIf=\"selectedAlbum\" fxLayout=\"column\">\n              <div fxLayoutAlign=\"start center\" fxLayout=\"row\" class=\"dark fw\">\n                <h2 fxFlex=\"50\" class=\"pl5lr5\">\n                  Tracks\n                </h2>\n              </div>\n              <div *ngFor=\"let track of selectedAlbum.tracks.items\" fxLayoutAlign=\"start start\">\n                <div fxFlex=\"100\" fxLayoutAlign=\"start start\" class=\"clickable onHoverUnderline\">\n                  <h4 class=\"mb0 pb0 pl20\" fxFlex=\"100\" (click)=\"trackDialog(track)\">\n                    {{track.name}}\n                  </h4>\n                </div>\n              </div>\n            </div>\n          </div>\n        </div>\n\n        <!--Settings page-->\n        <div fxLayoutAlign=\"center center\" *ngIf=\"settingsTab\">\n          <div fxFlex=\"95\" fxFlex.gt-sm=\"50\" fxLayout=\"column\" class=\"taCenter\">\n            <h1 class=\"title taCenter\">APPLICATION SETTINGS</h1>\n            <div>\n              <h3 class=\"dark p10\">Visible recently viewed albums:&nbsp;{{visibleAlbums}}</h3>\n              <mat-slider min=\"3\" max={{albumsToStore}} step=\"1\" [(ngModel)]=\"visibleAlbums\"\n                          (ngModelChange)=\"updateSavedAlbums()\" class=\"fw\"></mat-slider>\n            </div>\n            <div>\n              <h3 class=\"dark p10\">Stored recently viewed albums:&nbsp;{{albumsToStore}}</h3>\n              <mat-slider min={{visibleAlbums}} max=\"8\" step=\"1\" [(ngModel)]=\"albumsToStore\"\n                          (ngModelChange)=\"updateSavedAlbums()\" class=\"fw\"></mat-slider>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n\n<!--Footer-->\n  <footer class=\"footer\" fxLayoutAlign=\"center center\" *ngIf=\"searchTab\">\n    <div fxFlex=\"95\" fxFlex.gt-sm=\"50\" style=\"border-top: 2px solid lightgray\" fxLayout=\"column\"\n         fxLayoutAlign=\"start start\">\n      <h4 class=\"mb0 pb0\">Recently Viewed:</h4>\n      <div fxLayoutAlign=\"start center\" fxFlex=\"100\" class=\"fw mb0 pb0\">\n        <div fxFlex=\"100\" fxLayout=\"row\" fxLayoutWrap fxLayoutAlign=\"start center\" class=\"tracks\"\n             *ngFor=\"let album of storedAlbumsToView\">\n          <div fxFlex class=\"clickable\" (click)=\"openAlbum(album)\">\n            <div class=\"image-container\">\n              <img class=\"image\" src={{album.images[0].url}}>\n              <div class=\"middle\">\n                <div class=\"text\">{{album.name}}</div>\n\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </footer>\n</div>\n"

/***/ }),

/***/ "../../../../../src/app/app.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__dialog_user_dialog_user_dialog_component__ = __webpack_require__("../../../../../src/app/dialog/user-dialog/user-dialog.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__dialog_track_dialog_track_dialog_component__ = __webpack_require__("../../../../../src/app/dialog/track-dialog/track-dialog.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__services_search_service__ = __webpack_require__("../../../../../src/app/services/search.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__services_settings_service__ = __webpack_require__("../../../../../src/app/services/settings.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__angular_material__ = __webpack_require__("../../../material/esm5/material.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__angular_common_http__ = __webpack_require__("../../../common/esm5/http.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};








var AppComponent = (function () {
    function AppComponent(http, searchService, settingsService, dialog, snackBar) {
        var _this = this;
        this.http = http;
        this.searchService = searchService;
        this.settingsService = settingsService;
        this.dialog = dialog;
        this.snackBar = snackBar;
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
        this.searchService.snackBarSubject.subscribe(function (message) {
            _this.openSnackBar(message);
        });
        this.searchService.searchedArtists.subscribe(function (artists) {
            _this.activeSearchedArtist = artists.items;
            _this.animateScroll('searchResults');
        });
        this.searchService.selectedArtist.subscribe(function (artist) {
            _this.selectedArtist = artist;
            _this.animateScroll('artistDetails');
        });
        this.searchService.artistAlbums.subscribe(function (albums) {
            _this.artistAlbums = albums;
        });
        this.searchService.selectedAlbum.subscribe(function (album) {
            _this.selectedAlbum = album;
            _this.settingsService.updateSavedAlbums(_this.albumsToStore, _this.selectedAlbum);
            _this.animateScroll('albumDetails');
        });
        this.searchService.userData.subscribe(function (user) {
            _this.userData = user;
        });
        this.settingsService.albumsToView.subscribe(function (albums) {
            _this.savedAlbums = albums;
            _this.storedAlbumsToView = _this.savedAlbums.slice(0, _this.visibleAlbums);
        });
    }
    AppComponent.prototype.ngOnInit = function () {
        // Initial read albums from local storage
        this.settingsService.readSavedAlbums(this.albumsToStore);
        this.getToken();
    };
    // Requesting token from backend
    AppComponent.prototype.getToken = function () {
        var _this = this;
        var url = '/token?initial=' + this.initialTokenRequest;
        this.http.get(url)
            .subscribe(function (res) {
            try {
                if (res['token'] != _this.token) {
                    _this.token = res['token'];
                    if (_this.initialTokenRequest) {
                        _this.searchService.readUserDetails(_this.token);
                    }
                    else {
                        _this.openSnackBar('Token updated');
                    }
                }
                _this.initialTokenRequest = false;
                _this.getToken();
            }
            catch (e) {
                console.error(e);
            }
        }, function (error) {
            _this.initialTokenRequest = false;
            _this.openSnackBar('Unable to get token');
            console.warn("Unable to get token");
        });
    };
    AppComponent.prototype.initValues = function () {
        this.activeSearchedArtist = [];
        this.selectedArtist = undefined;
        this.artistAlbums = undefined;
        this.nextAlbums = undefined;
        this.selectedAlbum = undefined;
    };
    // Searching for artists
    AppComponent.prototype.search = function () {
        this.initValues();
        this.searchHistory.unshift(this.artistForSearch);
        if (this.searchHistory.length > 5) {
            this.searchHistory.pop();
        }
        this.searchService.searchForArtist(this.token, this.artistForSearch);
    };
    // Open artist details
    AppComponent.prototype.artistDetails = function (artist, next) {
        this.searchService.openArtist(this.token, artist, next);
    };
    // Open artist from list of album
    AppComponent.prototype.newArtist = function (id) {
        this.searchService.newArtist(this.token, id);
    };
    // Open album details
    AppComponent.prototype.openAlbum = function (album) {
        this.searchService.openAlbum(this.token, album);
    };
    // Updating recently viewed data
    AppComponent.prototype.updateSavedAlbums = function (album) {
        this.settingsService.updateSavedAlbums(this.albumsToStore, album);
    };
    // User dialog
    AppComponent.prototype.openUserDialog = function () {
        var dialogRef = this.dialog.open(__WEBPACK_IMPORTED_MODULE_1__dialog_user_dialog_user_dialog_component__["a" /* UserDialogComponent */], {
            width: '350px',
            data: { token: this.token, userData: this.userData }
        });
    };
    // Track dialog
    AppComponent.prototype.trackDialog = function (track) {
        var dialogRef = this.dialog.open(__WEBPACK_IMPORTED_MODULE_2__dialog_track_dialog_track_dialog_component__["a" /* TrackDialogComponent */], {
            width: '350px',
            data: { track: track, token: this.token }
        });
    };
    // Switching between tabs
    AppComponent.prototype.searchTabActive = function () {
        this.searchTab = true;
        this.settingsTab = false;
    };
    ;
    AppComponent.prototype.settingsTabActive = function () {
        this.searchTab = false;
        this.settingsTab = true;
    };
    ;
    // Snack bar function
    AppComponent.prototype.openSnackBar = function (message) {
        this.snackBar.open(message, null, {
            duration: 2000,
        });
    };
    // Functions for scroll animation
    AppComponent.prototype.animateScroll = function (element) {
        var target = document.getElementById(element);
        this.animate(document.scrollingElement || document.documentElement, "scrollTop", "", window.pageYOffset, target.offsetTop, 500, true);
    };
    AppComponent.prototype.animate = function (elem, style, unit, from, to, time, prop) {
        if (!elem) {
            return;
        }
        var start = new Date().getTime(), timer = setInterval(function () {
            var step = Math.min(1, (new Date().getTime() - start) / time);
            if (prop) {
                elem[style] = (from + step * (to - from)) + unit;
            }
            else {
                elem.style[style] = (from + step * (to - from)) + unit;
            }
            if (step === 1) {
                clearInterval(timer);
            }
        }, 25);
        if (prop) {
            elem[style] = from + unit;
        }
        else {
            elem.style[style] = from + unit;
        }
    };
    AppComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'app-root',
            template: __webpack_require__("../../../../../src/app/app.component.html"),
            styles: [__webpack_require__("../../../../../src/app/app.component.css")]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_6__angular_common_http__["a" /* HttpClient */], __WEBPACK_IMPORTED_MODULE_3__services_search_service__["a" /* SearchService */],
            __WEBPACK_IMPORTED_MODULE_4__services_settings_service__["a" /* SettingsService */],
            __WEBPACK_IMPORTED_MODULE_5__angular_material__["b" /* MatDialog */],
            __WEBPACK_IMPORTED_MODULE_5__angular_material__["c" /* MatSnackBar */]])
    ], AppComponent);
    return AppComponent;
}());



/***/ }),

/***/ "../../../../../src/app/app.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__("../../../platform-browser/esm5/platform-browser.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__("../../../core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_common_http__ = __webpack_require__("../../../common/esm5/http.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__services_search_service__ = __webpack_require__("../../../../../src/app/services/search.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__services_settings_service__ = __webpack_require__("../../../../../src/app/services/settings.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__app_component__ = __webpack_require__("../../../../../src/app/app.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__angular_platform_browser_animations__ = __webpack_require__("../../../platform-browser/esm5/animations.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__dialog_track_dialog_track_dialog_component__ = __webpack_require__("../../../../../src/app/dialog/track-dialog/track-dialog.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__dialog_user_dialog_user_dialog_component__ = __webpack_require__("../../../../../src/app/dialog/user-dialog/user-dialog.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__angular_material_toolbar__ = __webpack_require__("../../../material/esm5/toolbar.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__angular_flex_layout__ = __webpack_require__("../../../flex-layout/esm5/flex-layout.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__angular_material_form_field__ = __webpack_require__("../../../material/esm5/form-field.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__angular_forms__ = __webpack_require__("../../../forms/esm5/forms.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__angular_material_input__ = __webpack_require__("../../../material/esm5/input.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__angular_material_button__ = __webpack_require__("../../../material/esm5/button.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__angular_material_tabs__ = __webpack_require__("../../../material/esm5/tabs.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__angular_material_dialog__ = __webpack_require__("../../../material/esm5/dialog.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__angular_material_slider__ = __webpack_require__("../../../material/esm5/slider.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__pipes_truncate_pipe__ = __webpack_require__("../../../../../src/app/pipes/truncate.pipe.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_19__angular_material_list__ = __webpack_require__("../../../material/esm5/list.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_20__angular_material_snack_bar__ = __webpack_require__("../../../material/esm5/snack-bar.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_21_hammerjs__ = __webpack_require__("../../../../hammerjs/hammer.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_21_hammerjs___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_21_hammerjs__);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};






















var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["H" /* NgModule */])({
            declarations: [
                __WEBPACK_IMPORTED_MODULE_5__app_component__["a" /* AppComponent */],
                __WEBPACK_IMPORTED_MODULE_18__pipes_truncate_pipe__["a" /* TruncatePipe */],
                __WEBPACK_IMPORTED_MODULE_7__dialog_track_dialog_track_dialog_component__["a" /* TrackDialogComponent */],
                __WEBPACK_IMPORTED_MODULE_8__dialog_user_dialog_user_dialog_component__["a" /* UserDialogComponent */]
            ],
            imports: [
                __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["a" /* BrowserModule */],
                __WEBPACK_IMPORTED_MODULE_2__angular_common_http__["b" /* HttpClientModule */],
                __WEBPACK_IMPORTED_MODULE_6__angular_platform_browser_animations__["a" /* BrowserAnimationsModule */],
                __WEBPACK_IMPORTED_MODULE_9__angular_material_toolbar__["a" /* MatToolbarModule */],
                __WEBPACK_IMPORTED_MODULE_12__angular_forms__["c" /* FormsModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_flex_layout__["a" /* FlexLayoutModule */],
                __WEBPACK_IMPORTED_MODULE_11__angular_material_form_field__["c" /* MatFormFieldModule */],
                __WEBPACK_IMPORTED_MODULE_13__angular_material_input__["b" /* MatInputModule */],
                __WEBPACK_IMPORTED_MODULE_14__angular_material_button__["a" /* MatButtonModule */],
                __WEBPACK_IMPORTED_MODULE_15__angular_material_tabs__["a" /* MatTabsModule */],
                __WEBPACK_IMPORTED_MODULE_16__angular_material_dialog__["c" /* MatDialogModule */],
                __WEBPACK_IMPORTED_MODULE_17__angular_material_slider__["a" /* MatSliderModule */],
                __WEBPACK_IMPORTED_MODULE_19__angular_material_list__["a" /* MatListModule */],
                __WEBPACK_IMPORTED_MODULE_20__angular_material_snack_bar__["b" /* MatSnackBarModule */]
            ],
            exports: [],
            providers: [__WEBPACK_IMPORTED_MODULE_3__services_search_service__["a" /* SearchService */], __WEBPACK_IMPORTED_MODULE_4__services_settings_service__["a" /* SettingsService */]],
            entryComponents: [__WEBPACK_IMPORTED_MODULE_8__dialog_user_dialog_user_dialog_component__["a" /* UserDialogComponent */], __WEBPACK_IMPORTED_MODULE_7__dialog_track_dialog_track_dialog_component__["a" /* TrackDialogComponent */]],
            bootstrap: [__WEBPACK_IMPORTED_MODULE_5__app_component__["a" /* AppComponent */]]
        })
    ], AppModule);
    return AppModule;
}());



/***/ }),

/***/ "../../../../../src/app/dialog/track-dialog/track-dialog.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/dialog/track-dialog/track-dialog.component.html":
/***/ (function(module, exports) {

module.exports = "<div fxLayout=\"column\" fxFlex=\"100\" style=\"width: 100%\">\n  <mat-toolbar style=\"background-color: white\" fxFlex=\"100\" fxLayoutAlign=\"center center\">\n    <div fxFlex=\"100\" fxLayoutAlign=\"start center\" fxLayout=\"column\">\n      <h2>Track details</h2>\n    </div>\n  </mat-toolbar>\n  <mat-list fxFlex=\"100\">\n    <mat-list-item>\n      Name:&nbsp;{{name}}\n    </mat-list-item>\n    <mat-list-item>\n      Album:&nbsp;{{album}}\n    </mat-list-item>\n    <mat-list-item>\n      Disc number:&nbsp;{{discNumber}}\n    </mat-list-item>\n    <mat-list-item>\n      Track number:&nbsp;{{trackNumber}}\n    </mat-list-item>\n    <mat-list-item>\n      Popularity:&nbsp;{{popularity}}\n    </mat-list-item>\n    <mat-list-item>\n      Duration:&nbsp;{{duration}}\n    </mat-list-item>\n  </mat-list>\n</div>\n"

/***/ }),

/***/ "../../../../../src/app/dialog/track-dialog/track-dialog.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return TrackDialogComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_material__ = __webpack_require__("../../../material/esm5/material.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_common_http__ = __webpack_require__("../../../common/esm5/http.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};



var TrackDialogComponent = (function () {
    function TrackDialogComponent(data, http) {
        this.data = data;
        this.http = http;
    }
    TrackDialogComponent.prototype.ngOnInit = function () {
        var track = this.data.track;
        this.token = this.data['token'];
        this.openTrack(track['id']);
    };
    // Get track details from track id
    TrackDialogComponent.prototype.openTrack = function (id) {
        var _this = this;
        this.http.get('https://api.spotify.com/v1/tracks/' + id, { headers: { 'Authorization': 'Bearer ' + this.token } })
            .subscribe(function (res) {
            try {
                var data = res;
                _this.album = data['album'].name;
                _this.name = data['name'];
                _this.duration = millisToMinutesAndSeconds(data['duration_ms']);
                _this.discNumber = data['disc_number'];
                _this.trackNumber = data['track_number'];
                _this.popularity = data['popularity'];
            }
            catch (e) {
                console.error(e);
            }
        }, function () {
            console.warn("Unable to get");
        });
    };
    TrackDialogComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'app-track-dialog',
            template: __webpack_require__("../../../../../src/app/dialog/track-dialog/track-dialog.component.html"),
            styles: [__webpack_require__("../../../../../src/app/dialog/track-dialog/track-dialog.component.css")]
        }),
        __param(0, Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["y" /* Inject */])(__WEBPACK_IMPORTED_MODULE_1__angular_material__["a" /* MAT_DIALOG_DATA */])),
        __metadata("design:paramtypes", [Object, __WEBPACK_IMPORTED_MODULE_2__angular_common_http__["a" /* HttpClient */]])
    ], TrackDialogComponent);
    return TrackDialogComponent;
}());

// Helper for converting milliseconds to readable value
function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    if (parseInt(seconds) < 10) {
        seconds = '0' + seconds.toString();
    }
    return minutes + ":" + seconds;
}


/***/ }),

/***/ "../../../../../src/app/dialog/user-dialog/user-dialog.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/dialog/user-dialog/user-dialog.component.html":
/***/ (function(module, exports) {

module.exports = "<div fxLayout=\"column\" fxFlex=\"100\" style=\"width: 100%\">\n  <mat-toolbar style=\"background-color: white\" fxFlex=\"100\" fxLayoutAlign=\"center center\">\n    <div fxFlex=\"100\" fxLayoutAlign=\"start center\" fxLayout=\"column\">\n      <h2>User details</h2>\n    </div>\n  </mat-toolbar>\n\n  <mat-list fxFlex=\"100\">\n    <mat-list-item>\n      Display name:&nbsp;{{displayName}}\n    </mat-list-item>\n    <mat-list-item>\n      ID:&nbsp;{{id}}\n    </mat-list-item>\n    <mat-list-item>\n      Number of followers:&nbsp;{{numberOfFollowers}}\n    </mat-list-item>\n  </mat-list>\n</div>\n"

/***/ }),

/***/ "../../../../../src/app/dialog/user-dialog/user-dialog.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return UserDialogComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_material__ = __webpack_require__("../../../material/esm5/material.es5.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};


var UserDialogComponent = (function () {
    function UserDialogComponent(data) {
        this.data = data;
    }
    UserDialogComponent.prototype.ngOnInit = function () {
        this.token = this.data['token'];
        this.displayName = this.data['userData'].displayName;
        this.numberOfFollowers = this.data['userData'].numberOfFollowers;
        this.id = this.data['userData'].id;
    };
    UserDialogComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'app-user-dialog',
            template: __webpack_require__("../../../../../src/app/dialog/user-dialog/user-dialog.component.html"),
            styles: [__webpack_require__("../../../../../src/app/dialog/user-dialog/user-dialog.component.css")]
        }),
        __param(0, Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["y" /* Inject */])(__WEBPACK_IMPORTED_MODULE_1__angular_material__["a" /* MAT_DIALOG_DATA */])),
        __metadata("design:paramtypes", [Object])
    ], UserDialogComponent);
    return UserDialogComponent;
}());



/***/ }),

/***/ "../../../../../src/app/pipes/truncate.pipe.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return TruncatePipe; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/esm5/core.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var TruncatePipe = (function () {
    function TruncatePipe() {
    }
    TruncatePipe.prototype.transform = function (value, args) {
        var limit = args ? parseInt(args, 10) : 10;
        return value.slice(0, limit);
    };
    TruncatePipe = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["R" /* Pipe */])({
            name: 'limitTo'
        })
    ], TruncatePipe);
    return TruncatePipe;
}());



/***/ }),

/***/ "../../../../../src/app/services/search.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SearchService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_common_http__ = __webpack_require__("../../../common/esm5/http.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_Subject__ = __webpack_require__("../../../../rxjs/_esm5/Subject.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var SearchService = (function () {
    function SearchService(http) {
        var _this = this;
        this.http = http;
        // Get artist from artist id
        this.openArtist = function (token, artist, next) {
            _this.selectedArtist.next(artist);
            var url;
            if (next && _this.nextAlbums) {
                url = _this.nextAlbums;
            }
            else {
                url = 'https://api.spotify.com/v1/artists/' + artist.id + '/albums';
            }
            _this.http.get(url, { headers: { 'Authorization': 'Bearer ' + token } })
                .subscribe(function (res) {
                try {
                    if (!res.hasOwnProperty('next')) {
                        return;
                    }
                    _this.nextAlbums = res['next'];
                    if (!res.hasOwnProperty('items')) {
                        return;
                    }
                    _this.artistAlbums.next(res['items']);
                }
                catch (e) {
                    console.error(e);
                }
            }, function (error) {
                _this.snackBarSubject.next('Unable to open artist');
                console.warn("Unable to open artist");
            });
        };
        this.snackBarSubject = new __WEBPACK_IMPORTED_MODULE_2_rxjs_Subject__["a" /* Subject */]();
        this.searchedArtists = new __WEBPACK_IMPORTED_MODULE_2_rxjs_Subject__["a" /* Subject */]();
        this.selectedArtist = new __WEBPACK_IMPORTED_MODULE_2_rxjs_Subject__["a" /* Subject */]();
        this.artistAlbums = new __WEBPACK_IMPORTED_MODULE_2_rxjs_Subject__["a" /* Subject */]();
        this.selectedAlbum = new __WEBPACK_IMPORTED_MODULE_2_rxjs_Subject__["a" /* Subject */]();
        this.userData = new __WEBPACK_IMPORTED_MODULE_2_rxjs_Subject__["a" /* Subject */]();
    }
    // Get artists from name
    SearchService.prototype.searchForArtist = function (token, artist) {
        var _this = this;
        this.http.get('https://api.spotify.com/v1/search?q=' + artist + '&type=artist', { headers: { 'Authorization': 'Bearer ' + token } })
            .subscribe(function (res) {
            try {
                if (!res.hasOwnProperty('artists')) {
                    return;
                }
                var artists = res['artists'];
                if (artists.hasOwnProperty('items') && artists['items'].length > 0) {
                    _this.searchedArtists.next(artists);
                }
            }
            catch (e) {
                console.error(e);
            }
        }, function (error) {
            _this.snackBarSubject.next('Unable to search for artists');
            console.warn("Unable to search for artists");
        });
    };
    ;
    // Get artist from artist list
    SearchService.prototype.newArtist = function (token, id) {
        var _this = this;
        var url = 'https://api.spotify.com/v1/artists/' + id;
        this.http.get(url, { headers: { 'Authorization': 'Bearer ' + token } })
            .subscribe(function (res) {
            try {
                _this.openArtist(token, res, false);
            }
            catch (e) {
                console.error(e);
            }
        }, function (error) {
            _this.snackBarSubject.next('Unable to open artist');
            console.warn("Unable to open artist");
        });
    };
    // Open album from id
    SearchService.prototype.openAlbum = function (token, album) {
        var _this = this;
        var url = 'https://api.spotify.com/v1/albums/' + album.id;
        this.http.get(url, { headers: { 'Authorization': 'Bearer ' + token } })
            .subscribe(function (res) {
            try {
                _this.selectedAlbum.next(res);
            }
            catch (e) {
                console.error(e);
            }
        }, function (error) {
            _this.snackBarSubject.next('Unable to open album');
            console.warn("Unable to open album");
        });
    };
    ;
    // Get user details
    SearchService.prototype.readUserDetails = function (token) {
        var _this = this;
        // Hardcoded for demo
        var userId = 's33qlm9iqvdx5q94ybekhzrq1';
        this.http.get('https://api.spotify.com/v1/users/' + userId, { headers: { 'Authorization': 'Bearer ' + token } })
            .subscribe(function (res) {
            try {
                var data = {};
                data['displayName'] = res['display_name'];
                data['numberOfFollowers'] = res['followers'].total;
                data['id'] = res['id'];
                _this.userData.next(data);
                _this.snackBarSubject.next('Welcome ' + data['displayName']);
            }
            catch (e) {
                console.error(e);
            }
        }, function (error) {
            _this.snackBarSubject.next('Unable to read user details');
            console.warn("Unable to read user details");
        });
    };
    SearchService = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["z" /* Injectable */])(),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__angular_common_http__["a" /* HttpClient */]])
    ], SearchService);
    return SearchService;
}());



/***/ }),

/***/ "../../../../../src/app/services/settings.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SettingsService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_rxjs_Subject__ = __webpack_require__("../../../../rxjs/_esm5/Subject.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var SettingsService = (function () {
    function SettingsService() {
        this.savedAlbums = [];
        this.visibleAlbums = [];
        this.albumsToView = new __WEBPACK_IMPORTED_MODULE_1_rxjs_Subject__["a" /* Subject */]();
    }
    // Read albums on load from local storage
    SettingsService.prototype.readSavedAlbums = function (albumsToStore) {
        if (localStorage.getItem("savedAlbums")) {
            this.savedAlbums = JSON.parse(localStorage.getItem("savedAlbums"));
            this.albumsToView.next(this.savedAlbums);
        }
    };
    ;
    // Update local storage and recently viewed
    SettingsService.prototype.updateSavedAlbums = function (albumsToStore, album) {
        if (album) {
            var albumExists = false;
            if (this.savedAlbums && this.savedAlbums.length > 0) {
                for (var i = 0; i < this.savedAlbums.length; i++) {
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
    ;
    SettingsService = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["z" /* Injectable */])(),
        __metadata("design:paramtypes", [])
    ], SettingsService);
    return SettingsService;
}());



/***/ }),

/***/ "../../../../../src/environments/environment.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return environment; });
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
var environment = {
    production: false
};


/***/ }),

/***/ "../../../../../src/main.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__ = __webpack_require__("../../../platform-browser-dynamic/esm5/platform-browser-dynamic.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__app_app_module__ = __webpack_require__("../../../../../src/app/app.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__environments_environment__ = __webpack_require__("../../../../../src/environments/environment.ts");




if (__WEBPACK_IMPORTED_MODULE_3__environments_environment__["a" /* environment */].production) {
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_13" /* enableProdMode */])();
}
Object(__WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_2__app_app_module__["a" /* AppModule */])
    .catch(function (err) { return console.log(err); });


/***/ }),

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("../../../../../src/main.ts");


/***/ })

},[0]);
//# sourceMappingURL=main.bundle.js.map