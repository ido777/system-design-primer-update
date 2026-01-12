import { ClozeNoteContent } from "../type-implementations/cloze/types";
import { DoubleSidedNoteContent } from "../type-implementations/double-sided/types";
import { ListNoteContent } from "../type-implementations/list/types";
import { NormalNoteContent } from "../type-implementations/normal/types";
import { NoteType } from "./note";

export type NoteContent<T extends NoteType> = {
  type: T;
} & (T extends NoteType.Basic ? NormalNoteContent : {}) &
  (T extends NoteType.Cloze ? ClozeNoteContent : {}) &
  (T extends NoteType.DoubleSided ? DoubleSidedNoteContent : {}) &
  (T extends NoteType.List ? ListNoteContent : {});
