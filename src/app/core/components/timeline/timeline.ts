import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef,
  ViewChild, ElementRef,
  AfterViewInit, Inject
} from '@angular/core'

import {DOCUMENT} from '@angular/platform-browser'

import {Store} from '@ngrx/store'

import {Record, Set} from 'immutable'

import {Observable} from 'rxjs/Observable'
import {ReplaySubject} from 'rxjs/ReplaySubject'
import {Subscription} from 'rxjs/Subscription'
// import {animationFrame as animationScheduler} from 'rxjs/scheduler/animationFrame'
import 'rxjs/add/observable/combineLatest'
import 'rxjs/add/observable/merge'
import 'rxjs/add/observable/concat'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/startWith'
import 'rxjs/add/operator/filter'

import * as fromProject from '../../../persistence/reducers'
import * as fromPlayer from '../../../player/reducers'
import * as project from '../../../persistence/actions/project'
import * as player from '../../../player/actions'
import {Timeline, Track, Annotation} from '../../../persistence/model'
import {HandlebarComponent} from '../../components/timeline/handlebar/handlebar.component'
import {_SCROLLBAR_CAPTION_} from '../../../config/timeline/scrollbar'
import {rndColor} from '../../../lib/color'

export interface ScrollSettings {
  readonly zoom: number
  readonly scrollLeft: number
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-timeline',
  templateUrl: 'timeline.html',
  styleUrls: ['timeline.scss']
})
export class TimelineContainer implements OnInit, AfterViewInit, OnDestroy {
  timeline: Record<Timeline>
  selectedAnnotations: Set<Record<Annotation>>
  pZoom = 0
  playerPos = 0
  playerCurrentTime = 0
  scrollbarLeft = 0
  scrollbarWidth = 100
  readonly scrollbarCaption = _SCROLLBAR_CAPTION_
  readonly scrollbarRect = new ReplaySubject<ClientRect>(1)
  readonly timelineWrapperRect = new ReplaySubject<ClientRect>(1)
  readonly scrollSettings = new ReplaySubject<ScrollSettings>(1)

  @ViewChild('scrollbar') private readonly scrollbarRef: ElementRef
  @ViewChild('handlebar') private readonly handlebarRef: HandlebarComponent
  @ViewChild('timelineWrapper') private readonly timelineWrapperRef: ElementRef
  @ViewChild('playheadOverflow') private readonly playheadOverflowRef: ElementRef
  private readonly _subs: Subscription[] = []
  private readonly timelineSubj = this._store.select(fromProject.getProjectTimeline)
    .filter(timeline => timeline !== null)
    .share()

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    private readonly _store: Store<fromProject.State>,
    @Inject(DOCUMENT) private readonly _document: any) {}

  ngOnInit() {
    this._subs.push(
      this.timelineSubj.subscribe(timeline => {
        this.timeline = timeline as Record<Timeline> // use identifer! syntax?
        this._cdr.markForCheck()
      }))

    this._subs.push(
      this._store.select(fromProject.getSelectedAnnotations)
        .subscribe(selAnnotations => {
          this.selectedAnnotations = selAnnotations
          this._cdr.markForCheck()
        }))

    this._subs.push(
      this._store.select(fromPlayer.getCurrentTime)
        .withLatestFrom(this.timelineSubj, (currentTime, timeline) => {
          return {
            currentTime,
            progress: currentTime / timeline!.get('duration', null)
          }
        })
        .subscribe(({currentTime, progress}) => {
          this.playerPos = progress
          this.playerCurrentTime = currentTime
          this._cdr.markForCheck()
        }))
  }

  ngAfterViewInit() {
    const getScrollbarRect = () => {
      return this.scrollbarRef.nativeElement.getBoundingClientRect()
    }

    const getTimelineWrapperRect = () => {
      return this.timelineWrapperRef.nativeElement.getBoundingClientRect()
    }

    this._subs.push(
      this.handlebarRef.onHandlebarUpdate.subscribe(hb => {
        // Set new left and width
        this.scrollbarLeft = hb.left
        this.scrollbarWidth = hb.width
        this._cdr.markForCheck()
      }))

    const initHB = {
      left: this.scrollbarLeft,
      width: this.scrollbarWidth
    }

    const handlebarSettings = this.handlebarRef.onHandlebarUpdate.startWith(initHB)
      .map(hb => {
        const zoom = 100/hb.width
        return {zoom, scrollLeft: hb.left}
      })

    const winResize = Observable.fromEvent(window, 'resize')

    this._subs.push(
      winResize.startWith(null).subscribe(() => {
        this.scrollbarRect.next(getScrollbarRect())
        this.timelineWrapperRect.next(getTimelineWrapperRect())
      }))

    this._subs.push(Observable.combineLatest(
      this.timelineWrapperRect, handlebarSettings,
      (rect, {zoom, scrollLeft}) => {
        const zoomContainerWidth = zoom*rect.width
        const maxLeft = zoomContainerWidth-rect.width
        return {zoom, left: Math.max(0, Math.min(zoomContainerWidth*scrollLeft/100, maxLeft))}
      }).distinctUntilChanged((prev, cur) => {
        return prev.left === cur.left && prev.zoom === cur.zoom
      }).subscribe(({zoom, left}) => {
        this.scrollSettings.next({zoom, scrollLeft: left})
      }))

    this._subs.push(
      this.scrollSettings.subscribe(({zoom, scrollLeft}) => {
        this.pZoom = zoom
        this.playheadOverflowRef.nativeElement.scrollLeft = scrollLeft

        setTimeout(() => {
          this.playheadOverflowRef.nativeElement.scrollLeft = scrollLeft
          this._cdr.markForCheck()
        })
        this._cdr.markForCheck()
      }))

    const isLeftBtn = (ev: MouseEvent) => ev.button === 0

    const mousemove: Observable<MouseEvent> = Observable.fromEvent(this._document, 'mousemove')
    const mouseup: Observable<MouseEvent> = Observable.fromEvent(this._document, 'mouseup')
    const placeHeadMd: Observable<MouseEvent> = Observable.fromEvent(this.timelineWrapperRef.nativeElement, 'mousedown').filter(isLeftBtn)

    const zoomContainer = Observable.combineLatest(
      this.timelineWrapperRect, this.scrollSettings,
      (rect, {zoom, scrollLeft}) => {
        return {x: rect.left-scrollLeft, width: zoom*rect.width}
      })

    this._subs.push(placeHeadMd
      .switchMap(md => {
        const init = {clientX: md.clientX}
        return Observable.concat(
          Observable.of(init),
          mousemove.map(mmEvent => {
            const {clientX, clientY} = mmEvent
            return {clientX, clientY}
          }).takeUntil(mouseup))
      })
      .withLatestFrom(zoomContainer, (ev: MouseEvent, {x, width}) => {
        const localX = ev.clientX - x
        return localX / width
      })
      .map(progress => {
        return Math.max(0, Math.min(progress, 1))
      })
      .distinctUntilChanged()
      .withLatestFrom(this.timelineSubj, (progress, tl) => {
        const totalTime = tl!.get('duration', null)
        return {
          progress,
          currentTime: progress*totalTime
        }
      })
      .subscribe(({progress, currentTime}) => {
        this.playerPos = progress
        this.playerCurrentTime = currentTime
        this._cdr.markForCheck()
        this._store.dispatch(new player.PlayerRequestCurrentTime({currentTime}))
      }))
  }

  trackByFunc(_: number, track: Record<Track>) {
    return track.get('id', null)
  }

  addAnnotation(addAnnotation: project.AddAnnotationPayload) {
    this._store.dispatch(new project.ProjectAddAnnotation(addAnnotation))
  }

  updateAnnotation(updateAnnotation: project.UpdateAnnotationPayload) {
    this._store.dispatch(new project.ProjectUpdateAnnotation(updateAnnotation))
  }

  selectAnnotation(annotation: project.SelectAnnotationPayload) {
    this._store.dispatch(new project.ProjectSelectAnnotation(annotation))
  }

  addTrack() {
    this._store.dispatch(new project.ProjectAddTrack({color: rndColor()}))
  }

  updateTrack(payload: project.UpdateTrackPayload) {
    this._store.dispatch(new project.ProjectUpdateTrack(payload))
  }

  deleteTrack(deleteTrack: project.DeleteTrackPlayload) {
    this._store.dispatch(new project.ProjectDeleteTrack(deleteTrack))
  }

  duplicateTrack(duplicateTrack: project.DuplicateTrackPayload) {
    this._store.dispatch(new project.ProjectDuplicateTrack(duplicateTrack))
  }

  insertTrackAt(insertTrackAt: project.TrackInsertAtPayload) {
    this._store.dispatch(new project.ProjectInsertAtTrack(insertTrackAt))
  }

  pasteAnnotations(pasteAnnotations: project.PasteClipboardPayload) {
    this._store.dispatch(new project.ProjectPasteClipBoard(pasteAnnotations))
  }

  getNumTracks() {
    return this.timeline.get('tracks', null).size
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}