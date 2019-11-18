import { State } from 'store';
import { getGridData } from 'components/color-checker/grid';

/**
 * Set the current color checker live projection as the new color checker grid reference
 * @param state The current state.
 * @returns The updated state.
 */
export const setCurrentImageAsReference = (state: State): State => {

    if (state.currentImageIndex) {
        // The current image
        const currentImage = state.images[state.currentImageIndex];

        // Buffer Image canvas creation
        const img = document.createElement('IMG') as HTMLImageElement;
        const canvasElement = document.createElement('CANVAS') as HTMLCanvasElement;
        const canvasContext = canvasElement.getContext('2d')!;
        img.src = currentImage.properties.src;
        canvasElement.width = currentImage.properties.width;
        canvasElement.height = currentImage.properties.height;
        canvasContext.drawImage(img, 0, 0);

        // Computing uv coordinate of each grid items
        const items = getGridData(state.colorCheckerReference.grid, currentImage.colorChecker.handles);

        // Color extraction from current imate at each grid item position
        const itemsSnapshot = items.map(cell => {
            const data = canvasContext.getImageData(
                cell.uv.u * currentImage.properties.width,
                cell.uv.v * currentImage.properties.height,
                1,
                1).data.slice(0, 3); // TODO: extract a range of pixel instead
            const color = [data[0], data[1], data[2]] as [number, number, number];
            return { ...cell, color };
        });

        const grid = state.colorCheckerReference.grid
            .map((row, rowIndex) => row
                .map((item, columIndex) => itemsSnapshot
                    .find(o => o.row === rowIndex && o.column === columIndex)!.color));

        return { ...state, colorCheckerReference: { grid } };
    }

    // If nothing selected, the state isn't affected
    return state;
};