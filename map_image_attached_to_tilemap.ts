/** 
 * for configuring the raytracer 
*/
namespace raytracer {
   const scaler = 100 / 15
   let normalmap:Image = image.create(1,1)
   let array2d:number[][] = [[]]
   let enabled_ = true
   function scaleImageTo2dArray() {    
    for (let i = 0; i < normalmap.width; i++) {
      const d:number[] = []

    for (let k = 0; k < normalmap.height; k++) {
        const c = normalmap.getPixel(i,k) * scaler // get the value and scale it to 0-100
        d.push(c)
    }
      array2d.push(d)
    }
   }
   export function SetRaytracerEnabled(enabled:boolean) {
      enabled_ = enabled
   }
   export function SetCurrentTileMapNormalMap(map:Image) {
       normalmap = map
       scaleImageTo2dArray() // then update the 2d array that's faster to read from
   }
   export function _read(x:number,y:number) {
       return array2d[x][y]
   }
   export function _enabled() {
       return enabled_
   }
}