const RAYS_PER_LIGHT = (65 * 2) / RAY_ACCURACY
class RayTracer {
    lights: Light[] = [];
    mirrors: Mirror[] = [];
    intersections: { hx: number; hy: number; dt: number }[] = []; // Unique intersections
    lightMap: Image; // 2D image for lighting

    constructor() {
        this.lightMap = image.create(480, 320); // Match your screen dimensions
        game.onShade(() => {
            this.update();
            this.renderLightMap();
        });
    }

    // Update method: Computes intersections for all lights
    update() {
        this.intersections = []; // Clear intersections
        try {
            this.lights.forEach(light => {
                const lightIntersections = light.lightMap; // Get intersections from the light
                lightIntersections.forEach(intersection => {
                    // Add only unique intersections
                    if (!this.isDuplicateIntersection(intersection)) {
                        this.intersections.push(intersection);
                    }
                });
            });
        } catch (e) {
            console.log("Error during RayTracing: " + e);
            this.reset(); // Reset to avoid another crash
        }
    }

    // Generate and render the light map
    renderLightMap() {
        this.lightMap.fill(0); // Clear the light map (all black)
        this.intersections.forEach(intersection => {
            const brightness = Math.min(Math.max(0, 255 - intersection.dt * 10),15); // Decrease brightness with distance
            this.lightMap.setPixel(intersection.hx, intersection.hy, brightness);
        });
        scene.setBackgroundImage(this.lightMap); // Update the scene with the light map
    }

    // Check for duplicate intersections
    isDuplicateIntersection(intersection: { hx: number; hy: number; dt: number }): boolean {
        return this.intersections.some(existing =>
            Math.abs(existing.hx - intersection.hx) < 1 &&
            Math.abs(existing.hy - intersection.hy) < 1
        );
    }

    // Add a light source
    addLight(light: Light) {
        this.lights.push(light);
        console.log("Rays predicted to be shot each frame: " + (RAYS_PER_LIGHT * this.lights.length));
    }

    // Add a mirror
    addMirror(mirror: Mirror) {
        this.mirrors.push(mirror);
        console.log("Mirror addded!")
    }

    // Reset the raytracer
    reset() {
        this.mirrors = []
        this.lights = [];
        this.intersections = [];
        this.lightMap.fill(0); // Clear the light map
    }
}
