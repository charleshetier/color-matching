declare module 'delaunay-triangulate' {
    export default function triangulate(points: [number, number][] | [number, number, number][], includePointAtInfinity?: [])
}