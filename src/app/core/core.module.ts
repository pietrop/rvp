import {NgModule} from '@angular/core'
import {CommonModule} from '@angular/common'

import {MainContainer} from './containers/main'
import {PlayerContainer} from './containers/player'
import {InspectorContainer} from './containers/inspector'
import {TimelineContainer} from './containers/timeline'

import {LoadingComponent} from './components/loading.component'
import {NotFoundComponent} from './components/notFound.component'
import {LogoComponent} from './components/logo.component'
import {MainNavComponent} from './components/mainNav.component'
import {ProjectBtnComponent} from './components/projectBtn/projectBtn.component'

const _DECLS_ = [
  // Containers
  MainContainer, PlayerContainer, InspectorContainer,
  TimelineContainer,
  // Components
  LoadingComponent, NotFoundComponent, LogoComponent,
  MainNavComponent, ProjectBtnComponent
]

@NgModule({
  imports: [CommonModule],
  declarations: _DECLS_,
  exports: _DECLS_,
})
export class CoreModule {}
