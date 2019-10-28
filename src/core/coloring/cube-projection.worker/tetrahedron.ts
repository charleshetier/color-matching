import { RGB } from "core/model";
import { subtract, dot, cross, norm } from 'mathjs';

/*
bool SameSide(v1, v2, v3, v4, p)
{
    normal := cross(v2 - v1, v3 - v1)
    dotV4 := dot(normal, v4 - v1)
    dotP := dot(normal, p - v1)
    return Math.Sign(dotV4) == Math.Sign(dotP);
}

bool PointInTetrahedron(v1, v2, v3, v4, p)
{
    return SameSide(v1, v2, v3, v4, p) &&
           SameSide(v2, v3, v4, v1, p) &&
           SameSide(v3, v4, v1, v2, p) &&
           SameSide(v4, v1, v2, v3, p);               
}
*/

const sameSide = (triangle: [RGB, RGB, RGB, RGB], point: RGB) => {
    const [v1, v2, v3, v4] = triangle;
    const normal = cross(
        subtract(v2, v1) as RGB,
        subtract(v3, v1) as RGB);

    const dotV4 = dot(normal, subtract(v4, v1) as RGB);
    const dotP = dot(normal, subtract(point, v1) as RGB);
    return Math.sign(dotV4) === Math.sign(dotP);
};

/**
 * Determines whether the point is inside the tetrahedron.
 * @param tetrahedron
 * @param point 
 */
export const isInTetrahedron = (tetrahedron: [RGB, RGB, RGB, RGB], point: RGB) => {
    const [v1, v2, v3, v4] = tetrahedron;
    return sameSide([v1, v2, v3, v4], point) &&
        sameSide([v2, v3, v4, v1], point) &&
        sameSide([v3, v4, v1, v2], point) &&
        sameSide([v4, v1, v2, v3], point);
}

/**
 * Determines whether the tetrahedron is flat (ie volume = 0)
 * @param tetrahedron The tetrahedron to test
 */
export const isFlatTetrahedron = (tetrahedron: [RGB, RGB, RGB, RGB]) => {

    // p1 p2 p3 p4 are coplanar
    const [p1, p2, p3, p4] = tetrahedron;
    const
        p1p2 = subtract(p2, p1) as [number, number, number],
        p1p3 = subtract(p3, p1) as [number, number, number],
        p1p4 = subtract(p4, p1) as [number, number, number];

    return dot(p1p4,
        cross(p1p3, p1p2)   // = the normal of the plan
        ) === 0;
}