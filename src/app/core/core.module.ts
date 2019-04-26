import {NgModule} from '@angular/core'
import {CommonModule} from '@angular/common'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import { ContenteditableModule } from '@ng-stack/contenteditable'

import {MainContainer} from './components/main/main'
import {PlayerContainer} from './components/player/player'
import {InspectorContainer} from './components/inspector/inspector'
import {TimelineContainer} from './components/timeline/timeline'

import {NotFoundComponent} from './components/notFound.component'
import {LogoComponent} from './components/logo.component'
import {ProjectBtnComponent} from './components/project/projectBtn/projectBtn.component'
import {ProjectModalComponent} from './components/project/projectModal/projectModal.component'
import {FooterComponent} from './components/footer/footer.component'
import {VersionComponent} from './components/version/version.component'
import {ToolbarComponent} from './components/toolbar/toolbar.component'
import {TaggingComponent} from './components/tagging/tagging.component'

// Inspector components
import {InspectorEntryComponent} from './components/inspector/inspectorEntry/inspectorEntry.component'

// Timeline components
import {TrackComponent} from './components/timeline/track/track.component'
import {HandlebarComponent} from './components/timeline/handlebar/handlebar.component'
import {PlayheadComponent} from './components/timeline/playhead/playhead.component'

import {MatInputModule} from '@angular/material'
import {MatFormFieldModule} from '@angular/material/form-field'
import {MatAutocompleteModule} from '@angular/material/autocomplete'

const _DECLS_ = [
  // Containers
  MainContainer, PlayerContainer, InspectorContainer,
  TimelineContainer,
  // Components
  NotFoundComponent, LogoComponent, VersionComponent,
  ProjectBtnComponent, ProjectModalComponent, FooterComponent,
  ToolbarComponent,
  // Inspector
  InspectorEntryComponent,
  // Timeline
  TrackComponent, HandlebarComponent, PlayheadComponent,
  // Tagging
  TaggingComponent
]

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ContenteditableModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule
  ],
  declarations: _DECLS_,
  exports: _DECLS_,
  entryComponents: [TaggingComponent],
})
export class CoreModule {}
