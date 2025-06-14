namespace userconfig { //expand screen so more of the map is visible
    export const ARCADE_SCREEN_WIDTH = 480
    export const ARCADE_SCREEN_HEIGHT = 320
}

const DRAW_DEBUG_LINES = false
const SHOW_COLLISIONS = true
const MAX_IT = 45
class Ray {
    x:number
    y:number
    vx:number
    vy:number
    dist:number
    private light:Light
    constructor(x:number,y:number,vx:number,vy:number,light:Light) {
      this.x = x
      this.y = y
      this.vx = vx
      this.vy = vy
      this.light = light 
      this.dist = 0
      this.start() // start shooting the ray
    }
    start() {
        if (!raytracer._enabled()) {
            return
        }
        const col = Math.floor(this.x / 16);
        const row = Math.floor(this.y / 16);

        // Check if the starting position is already inside a wall
        if (tiles.tileAtLocationIsWall(tiles.getTileLocation(col, row))) {
            return;
        }

        let it = 0; // Iteration counter
        const steps = 4; // Number of sub-steps per movement
        while (true) {
            // Calculate the current tile position
            const col = Math.floor(this.x / 16);
            const row = Math.floor(this.y / 16);

            // Check if the ray hits a wall
            if (tiles.tileAtLocationIsWall(tiles.getTileLocation(col, row))) {
                this.light.lightMap.push({ hx: this.x, hy: this.y, dt: this.dist });
                if (SHOW_COLLISIONS) { 
                   scene.backgroundImage().fillCircle(this.x, this.y, 1, 2) // show the collision
                }
                break;
            }

            // Break if too many iterations or the ray is not moving
            if (it > MAX_IT || (this.vx === 0 && this.vy === 0)) {
                break;
            }

            // Sub-stepping logic
            const stepVx = this.vx / steps;
            const stepVy = this.vy / steps;
            for (let i = 0; i < steps; i++) {
                const prevX = this.x;
                const prevY = this.y;
                this.x += stepVx;
                this.y += stepVy;
                this.dist += Math.sqrt(stepVx * stepVx + stepVy * stepVy);

                // Check for collision at the intermediate step
                const subCol = Math.floor(this.x / 16);
                const subRow = Math.floor(this.y / 16);
                if (tiles.tileAtLocationIsWall(tiles.getTileLocation(subCol, subRow))) {
                    // Reset position to avoid skipping over the wall
                    this.x = prevX;
                    this.y = prevY;
                    this.light.lightMap.push({ hx: this.x, hy: this.y, dt: this.dist });
                    if (SHOW_COLLISIONS) {
                      scene.backgroundImage().fillCircle(this.x, this.y, 1, 2) // show the collision
                    }
                    this.vx = 0;
                    this.vy = 0; // Stop the ray
                    return;
                }
            }

            // Draw debug lines if enabled
            if (DRAW_DEBUG_LINES) {
                scene.backgroundImage().drawLine(this.x - this.vx, this.y - this.vy, this.x, this.y, 1);
            }

            it++; // Increment iteration counter
        }
    }

    ckeckForMirrors(ox:number,oy:number) {
        rt.mirrors.forEach((mirror) => {
            mirror.doesReflectRay(this); // Pass the ray instance to the mirror
        });
    }
}
const RAY_ACCURACY = 8 // or low accuracy
class Light {
    x:number
    y:number
    lightMap: {hx:number,hy:number,dt:number}[] = [] // a map of  the rays that intersect
    constructor(x:number,y:number) { 
        this.x = x
        this.y = y
        rt.addLight(this) // add this light
        game.onShade(function() {
            this.lightMap = [] // clear it
            this.light()
            this.x += controller.dx()
            this.y += controller.dy()
        })
    }
    light() {
        for (let i = -32; i < 32; i += RAY_ACCURACY) {
            for (let k = -32; k < 32; k += RAY_ACCURACY) {
                const ray = new Ray(this.x,this.y,i,k,this) // it will shoot itself
            }
        }
        scene.backgroundImage().fillCircle(this.x,this.y,5,2)
    }
}
class Mirror {
    x: number;
    y: number;
    reflectIndex: number; // Determines probability of reflection (0-1)

    constructor(x: number, y: number, reflectIndex: number = 0.5) {
        this.x = x;
        this.y = y;
        this.reflectIndex = reflectIndex ; // Allow customization during creation
        rt.addMirror(this)
        game.onShade(() => {
            this.render();
        });
    }

    // Render the mirror's appearance on the screen
    render() {
        scene.backgroundImage().fillCircle(this.x, this.y, 5, 3); // Mirror visual representation
    }

    // Reflect or stop the ray based on proximity and reflection index
    handleRayInteraction(ray: Ray, mx: number, my: number) {
        const distance = Math.sqrt((mx - this.x) ** 2 + (my - this.y) ** 2); // Use Euclidean distance for precision
        if (distance < 16) { // Within interaction range
            if (Math.random() <= this.reflectIndex) {
                // Reflect the ray based on mirror logic
                const normalX = this.x - ray.x; // Calculate normal direction
                const normalY = this.y - ray.y;
                const magnitude = Math.sqrt(normalX ** 2 + normalY ** 2);
                const unitNormalX = normalX / magnitude;
                const unitNormalY = normalY / magnitude;

                // Reflect the ray using normal vector
                const dotProduct = ray.vx * unitNormalX + ray.vy * unitNormalY;
                ray.vx = ray.vx - 2 * dotProduct * unitNormalX // then apply it
                ray.vy = ray.vy - 2 * dotProduct * unitNormalY 
            } else {
                // Stop the ray
                ray.vx = 0;
                ray.vy = 0;
            }
        } else {
            return // just exit
        }
    }

    // Simplified method for checking interaction directly
    doesReflectRay(ray: Ray) {
        this.handleRayInteraction(ray, ray.x, ray.y);
    }

    // Extended method for midpoint interaction
    doesReflectRayMidpoint(ray: Ray, mx: number, my: number) {
        this.handleRayInteraction(ray, mx, my);
    }
}

game.onPaint(function() {
    scene.setBackgroundImage(image.create(480,320))
})
const l = new Light(Math.random() * 320, Math.random() * 320)
for (let i = 0; i < 3; i++) {
    const l = new Light(Math.random() * 320, Math.random() * 320)
}