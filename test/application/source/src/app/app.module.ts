import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { SearchService } from './services/search.service';
import { SettingsService } from './services/settings.service';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TrackDialogComponent } from './dialog/track-dialog/track-dialog.component';
import { UserDialogComponent } from './dialog/user-dialog/user-dialog.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';
import { TruncatePipe } from './pipes/truncate.pipe';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import 'hammerjs';

@NgModule({
  declarations: [
    AppComponent,
    TruncatePipe,
    TrackDialogComponent,
    UserDialogComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    FormsModule,
    FlexLayoutModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTabsModule,
    MatDialogModule,
    MatSliderModule,
    MatListModule,
    MatSnackBarModule
  ],
  exports:[],
  providers: [ SearchService, SettingsService ],
  entryComponents: [UserDialogComponent, TrackDialogComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
