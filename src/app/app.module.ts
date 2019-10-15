import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { RouterModule } from '@angular/router'
// import { appRoutes } from './routes'

import { StoreModule } from '@ngrx/store'
import { StoreDevtoolsModule } from '@ngrx/store-devtools'
import { EffectsModule } from '@ngrx/effects'

import { environment } from '../environments/environment'

import { CoreModule } from './core/core.module'
import { PersistenceModule } from './persistence/persistence.module'
import { PlayerModule } from './player/player.module'

import { reducers, metaReducers } from './core/reducers'

// import {AppShellContainer} from './shell'
import { MainContainer } from './core/components/main/main'
import { MessageService } from './core/actions/message.service';
// import { MediArchiveComponent } from './medi-archive/medi-archive.component'


@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot([]),
    // RouterModule.forRoot(appRoutes/*, {enableTracing: !environment.production}*/),
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot([]),
    !environment.production ? StoreDevtoolsModule.instrument() : [],

    CoreModule,
    PersistenceModule,
    PlayerModule
  ],
  // declarations: [AppShellContainer],
  bootstrap: [MainContainer],
  providers: [MessageService],
  // declarations: [MediArchiveComponent],
})
export class AppModule { }
