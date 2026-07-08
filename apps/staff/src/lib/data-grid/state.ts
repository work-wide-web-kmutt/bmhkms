import { functionalUpdate } from "@tanstack/react-table";
import type {
  OnChangeFn,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";

export function resolvePaginationState(
  currentState: PaginationState,
  updater: Parameters<OnChangeFn<PaginationState>>[0]
): PaginationState {
  return functionalUpdate(updater, currentState);
}

export function resolveSortingState(
  currentState: SortingState,
  updater: Parameters<OnChangeFn<SortingState>>[0]
): SortingState {
  return functionalUpdate(updater, currentState);
}
