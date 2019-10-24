import { RGB } from "core/model";
import { subtract, dot, cross } from 'mathjs';

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
 * @param triangle
 * @param point 
 */
export const isInTetrahedron = (triangle: [RGB, RGB, RGB, RGB], point: RGB) => {
    const [v1, v2, v3, v4] = triangle;
    return sameSide([v1, v2, v3, v4], point) &&
           sameSide([v2, v3, v4, v1], point) &&
           sameSide([v3, v4, v1, v2], point) &&
           sameSide([v4, v1, v2, v3], point); 
}