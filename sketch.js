// 1. noise functions: https://thebookofshaders.com/11/ (Tirei muita coisa desse site, me salvou)
// 2. simplex noise: https://en.wikipedia.org/wiki/Simplex_noise
// 3. noise functions in p5.js: https://p5js.org/reference/#/p5/noise
// 4. quaternion: https://en.wikipedia.org/wiki/Quaternion
// 5. spherical coordinates: https://en.wikipedia.org/wiki/Spherical_coordinate_system
// 6. fBm: https://thebookofshaders.com/13/
// 7. lacunarity: https://thebookofshaders.com/13/
// 8. octaves: https://thebookofshaders.com/13/


//--------------------------------------------lets and arrays--------------------------------------------------------

let simplex; //simplex noise object
let textures = []; // array of textures
let colors = []; // array of colors
let planetSizes = []; // array for storing different sizes for each planet
let cloudTextures = [];


/*------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------SETUP-------------------------------------------------------*/
    function setup() {
     // colors = [color("#008dc4"), color("#00a9cc"), color("#eecda3"), color("#7ec850"), color("#676767"), color("#fffafa")]; // colors for the planet
     colors = [
      [color("#008dc4"), color("#00a9cc"), color("#eecda3"), color("#7ec850"), color("#676767"), color("#fffafa")],
    [color("#DB6853"), color("#8CEA79"), color("#B66EF5"), color("#F5D15F"), color("#6AE7EB"), color("#DB66F5")],
      //Preciso adicionar mais cores aqui
    ];
   // let colorArrayOrder = [...Array(colors.length).keys()];  // Create an array from 0 to colors.length
    //shuffle(colorArrayOrder, true);  // Randomly shuffle the array

      simplex = new SimplexNoise();   // create simplex noise object

      createCanvas(900, 900, WEBGL); // create canvas
      for (let i = 0; i < 9; i++) { // create 10 textures
        let seedX = random(0, 10000); // random seed for x
        let seedY = random(0, 10000); // random seed for y 
       // cloudTextures[i] = generateCloudTexture(1000, 1000);
      //  let colorArray1 = colors[i % colors.length];
       // let colorArray2 = colors[(i+1) % colors.length];
      let colorArray1 = customShuffle(colors[i % colors.length]).slice(0, 5); // shuffle the colors and get the first 5, the slice function is used to not change the original array
      let colorArray2 = customShuffle(colors[(i+1) % colors.length]).slice(0, 5); //same thing as before, but for the second color array
        textures[i] = defTexture(1000, 1000, seedX, seedY, colorArray1, colorArray2);
        planetSizes[i] = random(30, 100); // create random size for each planet
      }
      noStroke(); // no stroke on the planets
      lights();  // luuuuuuuuuuuz
      //sphere(random(30,60)); // draw the planet
    }

/*------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------DRAW-------------------------------------------------------*/

    function draw() {
      background(0); // background color, vou substituir por um mapa estrelado depois, mas por enquanto é isso
      
      let columns = Math.floor(Math.sqrt(textures.length)); // number of columns
      let rows = Math.ceil(textures.length / columns); // number of rows
      let planetSize = Math.min(width / (columns + 1), height / (rows + 1)); // size of the planets
      let offsetX = (width - (columns * planetSize)) / 2; // offset for the planets in X
      let offsetY = (height - (rows * planetSize)) / 2; // offset for the planets in Y
      
      for (let i = 0; i < textures.length; i++) { // for each texture
        let x = (i % columns) * planetSize + offsetX; // position in X
        let y = Math.floor(i / columns) * planetSize + offsetY; // position in Y
        push(); // push and pop to not affect the other planets
        translate(x - width / 2, y - height / 2); // translate to the position
        rotateY(frameCount * 0.01); // rotate the planet
        texture(textures[i]); // set the texture
        sphere(planetSizes[i]); // draw the planet with the defined size
      //  texture(cloudTextures[i]); // set the cloud texture
       // sphere(planetSize);
        // sphere(); // draw the planet
        pop();  // pop to not affect the other planets
      }
    }


/*------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------FUNCTIONS-------------------------------------------------------*/
      function defTexture(wid=1000, hei=1000, seedX=0, seedY=0, colorArray1, colorArray2) { /* function to create the texture, with default values for 
      the width and height of the texture and the seeds for the noise function */
        let t = createImage(wid, hei); // create the image with the width and height
        t.loadPixels(); // load the pixels

        for (let y = 0; y < t.height; y++) { // for each pixel in the image 
          for (let x = 0; x < t.width; x++) { 
            let lon = map(x, 0, t.width, 0, TWO_PI); // map the x value to the longitude value (0 to 2PI) 
            let lat = map(y, 0, t.height, 0, PI); // map the y value to the latitude value (0 to PI) 
            // pra mapear corretamente estou usando coordenadas esféricas (longitude e latitude) e não cartesianas (x e y) 
            let nx = sin(lat) * cos(lon); // calculate the x value of the normal vector 
            let ny = sin(lat) * sin(lon); // calculate the y value of the normal vector
            let nz = cos(lat); // calculate the z value of the normal vector
            
            
            // Noise value using fBm, with 4 octaves and a lacunarity of 2. fBm is a fractal noise function, that is, a noise function that is composed of 
            let h = 0; // height value
            let amplitude = 0.5; // amplitude value
            for(let i = 0; i < 4; i++){ // for each octave, calculate the height value. An octave is a noise function with a frequency and an amplitude 
              h += amplitude * (simplex.noise3D(seedX + nx * pow(2, i), seedY + ny * pow(2, i), nz * pow(2, i)) + noise(nx, ny, nz) + 1) / 3; // calculate the height value using the noise function 
              amplitude *= 0.5; // decrease the amplitude
            }
            h = map(h, 0, 1, 0, 1); // map the height value to a value between 0 and 1
            let c1 = pickColor(h, colorArray1);  // Get color from first color array
            let c2 = pickColor(h, colorArray2);  // Get color from second color array
            let mix = (sin(h * PI) + 1) / 2;  // Blend factor, vary between 0 and 1
            let c = lerpColor(c1, c2, mix);  // Blend the two colors
            t.set(x, y, c); // set the pixel color

          }
        }
        t.updatePixels(); // update the pixels
        return t; // return the texture
      }

      // function generateCloudTexture(wid, hei) {
      //   let cl = createImage(wid, hei);
      //   cl.loadPixels();

      //   for (let y = 0; y < cl.height; y++) { // for each pixel in the image
      //     for (let x = 0; x < cl.width; x++) {
      //       let nx = map(x, 0, cl.width, 0, 1); // map the x value to the x value of the normal vector
      //       let ny = map(y, 0, cl.height, 0, 1); // map the y value to the y value of the normal vector

      //       let n = (simplex.noise3D(nx * 3, ny * 3) + 1) * 0.5 * 0.7 +  // noise value using fBm, with 3 octaves and a lacunarity of 2
      //               (simplex.noise3D(nx * 15, ny * 15) + 1) * 0.5 * 0.2 + // noise value using fBm, with 15 octaves and a lacunarity of 2
      //               (simplex.noise3D(nx * 30, ny * 30) + 1) * 0.5 * 0.1; // noise value using fBm, with 30 octaves and a lacunarity of 2
     
      //     let c = color(random(255), random(255), random(255), 0.5); 
      //     c.setAlpha(map(n, 0, 1, 0, 255)); // alpha value based on the noise value
      //     cl.set(x, y, c); // set the pixel color
      //     }
      //   }
      //   cl.updatePixels(); // update the pixels
      //   return cl; // return the cloud texture
        
      // }
    

      function pickColor(h, colorArray) { // Pick a color from the color array based on the height value
       // let thresholds = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7]; // Thresholds for the height values
       let index = floor(h * (colorArray.length - 1)); // Index of the color in the color array
       let color1 = colorArray[index]; // color 1 
       let color2 = colorArray[min(index + 1, colorArray.length - 1)]; // color 2, if the index is the last index, use the last color in the array
       let factor = (h * (colorArray.length - 1)) - index; // factor to blend the two colors, based on the height value
  
       return lerpColor(color1, color2, factor);
      // for(let i=0; i<thresholds.length; i++) { 
      //    if(h < thresholds[i+1]) { // If the height value is between two thresholds 
      //      return lerpColor(colorArray[i], colorArray[i+1], (h - thresholds[i])/(thresholds[i+1] - thresholds[i])); // Return the color between the two colors based on the height value 
      //    }
      //  }
       // return colorArray[colorArray.length-1]; // If the height value is greater than the last threshold, return the last color
      }
      function customShuffle(array) { // Shuffle the array, but keep the first and last elements in place 
        let currentIndex = array.length, temporaryValue, randomIndex; // While there remain elements to shuffle
        while (0 !== currentIndex) { // Pick a remaining element
          randomIndex = Math.floor(Math.random() * currentIndex); // And swap it with the current element
          currentIndex -= 1; // decrease the current index
          temporaryValue = array[currentIndex]; // save the current element
          array[currentIndex] = array[randomIndex]; // swap the current element with the random element
          array[randomIndex] = temporaryValue; // swap the random element with the current element
        }
        return array; // return the shuffled array
      }
