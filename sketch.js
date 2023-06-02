//--------------------------------------------lets and arrays--------------------------------------------------------

let simplex; //simplex noise object
let textures = []; // array of textures
let colors = []; // array of colors

/*------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------SETUP-------------------------------------------------------*/
    function setup() {
     // colors = [color("#008dc4"), color("#00a9cc"), color("#eecda3"), color("#7ec850"), color("#676767"), color("#fffafa")]; // colors for the planet
     colors = [
      [color("#008dc4"), color("#00a9cc"), color("#eecda3"), color("#7ec850"), color("#676767"), color("#fffafa")],
      [color("#FF0000"), color("#00FF00"), color("#0000FF"), color("#FFFF00"), color("#00FFFF"), color("#FF00FF")],
      //Preciso adicionar mais cores aqui
    ];
   // let colorArrayOrder = [...Array(colors.length).keys()];  // Create an array from 0 to colors.length
    //shuffle(colorArrayOrder, true);  // Randomly shuffle the array

      simplex = new SimplexNoise();   // create simplex noise object

      createCanvas(800, 800, WEBGL); // create canvas
      for (let i = 0; i < 10; i++) { // create 10 textures
        let seedX = random(0, 1000); // random seed for x
        let seedY = random(0, 1000); // random seed for y 
        let colorArray1 = colors[i % colors.length];
        let colorArray2 = colors[(i+1) % colors.length];
        textures[i] = defTexture(1000, 1000, seedX, seedY, colorArray1, colorArray2);
      }
      noStroke(); // no stroke on the planets
      lights();  // luuuuuuuuuuuz
    }

/*------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------DRAW-------------------------------------------------------*/

    function draw() {
      background(220); // background color, vou substituir por um mapa estrelado depois, mas por enquanto é isso
      
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
        sphere(60); // draw the planet
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
            for(let i = 0; i < 4; i++){ // for each octave  
              h += amplitude * (simplex.noise3D(seedX + nx * pow(2, i), seedY + ny * pow(2, i), nz * pow(2, i)) + 1) / 2; // calculate the height value using the noise function 
              amplitude *= 0.5; // decrease the amplitude
            }
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

      function pickColor(h, colorArray) { // Pick a color from the color array based on the height value
        let thresholds = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7]; // Thresholds for the height values
        for(let i=0; i<thresholds.length; i++) { 
          if(h < thresholds[i+1]) { // If the height value is between two thresholds 
            return lerpColor(colorArray[i], colorArray[i+1], (h - thresholds[i])/(thresholds[i+1] - thresholds[i])); // Return the color between the two colors based on the height value 
          }
        }
        return colorArray[colorArray.length-1]; // If the height value is greater than the last threshold, return the last color
      }