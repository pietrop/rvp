// import {Set, Record} from 'immutable'

// import {Annotation, AnnotationRecordFactory} from '../../persistence/model'

// import * as selection from '../actions/selection'

// export const enum SelectionSource {
//   None,
//   Timeline,
//   Inspector
// }

// export interface AnnotationSelection {
//   readonly trackIndex: number
//   readonly annotationIndex: number
//   readonly annotation: Record<Annotation>
//   readonly source: SelectionSource
// }

// export const AnnotationSelectionFactory = Record<AnnotationSelection>({
//   trackIndex: -1,
//   annotationIndex: -1,
//   annotation: new AnnotationRecordFactory(),
//   source: SelectionSource.None
// })

// interface Selection {
//   readonly annotations: {
//     readonly range: Set<Record<AnnotationSelection>> // ranged selection via shift click
//     readonly click: Set<Record<AnnotationSelection>> // click selection via cmd click
//     readonly selected: Record<AnnotationSelection>   // special usage
//   }
// }

// const SelectionRecordFactory = Record<Selection>({annotations: Set()})

// const initialState = new SelectionRecordFactory()

// export type State = Record<Selection>

// export function reducer(state: State=initialState, action: selection.Actions): State {
//   switch(action.type) {
//     case selection.SELECTION_SELECT_ANNOTATION: {
//       const currentSelections = state.get('annotations', null)

//       const {selection: sel} = action.payload
//       const newId = sel.getIn(['annotation', 'id'])

//       const existing = currentSelections.find(annotationSelection => {
//         const a = annotationSelection.get('annotation', null)
//         return a.get('id', null) === newId
//       })

//       if(existing) {
//         if(existing.get('source', null) !== sel.get('source', null)) {
//           const updatedSelections = currentSelections.withMutations(annotations => {
//             annotations.delete(existing).add(sel)
//           })

//           return state.set('annotations', updatedSelections)
//         } else {
//           return state
//         }
//       } else {
//         return state.update('annotations', annotations => annotations.add(sel))
//       }
//     }
//     case selection.SELECTION_DESELECT_ANNOTATION: {
//       return state.update('annotations', annotations => {
//         return annotations.delete(action.payload.selection)
//       })
//     }
//     case selection.SELECTION_RESET_ANNOTATION: {
//       return state.set('annotations', Set())
//     }
//     default: {
//       return state
//     }
//   }
// }

// export const getSelectedAnnotations = (state: State) => state.get('annotations', null)
