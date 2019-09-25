import { State } from 'store';
import { spyderChecker24Preset } from 'store/color-checker-presets';

/**
 * Resets the color checker grid to the selected reference.
 * @param state The current state
 * @returns The updated state
 */
export const resetColorCheckerGrid = (state: State): State => ({...state, colorCheckerReference: { grid: spyderChecker24Preset }});