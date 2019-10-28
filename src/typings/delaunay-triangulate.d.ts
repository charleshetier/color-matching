declare module 'delaunay-triangulate' {
    export default function triangulate(
        points: [number, number, number][], 
        includePointAtInfinity?: []): [number, number, number, number][]
}