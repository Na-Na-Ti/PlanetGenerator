


//--------------------------------------------lets and arrays--------------------------------------------------------

let simplex; //simplex noise object
let textures = []; // array of textures
let colors = []; // array of colors
let planetSizes = []; // array for storing different sizes for each planet
let cloudTextures = [];


/*------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------SETUP-------------------------------------------------------*/
    function setup() {
     // paleta de cores para os planetas, elas são escolhidas aleatoriamente para cada planeta e para as nuvens
     // cada array tem 5 cores, as cores são escolhidas aleatoriamente, embaralhadas e depois as 5 primeiras são escolhidas
     // 
     colors = [
      [color("#008dc4"), color("#00a9cc"), color("#eecda3"), color("#7ec850"), color("#676767")],
      [color("#fffafa"), color("#DB6853"), color("#8CEA79"), color("#B66EF5"), color("#F5D15F")],
      [color("#6AE7EB"), color("#DB66F5"), color("#ECD67D"), color("#5867AE"), color("#3E7C34")], 
      [color("#242E5D"), color("#774724"), color("#84D0F0"), color("#D4BF64"), color("#858DC5")],
      [color("#E7EBEC"), color("#FCBF0A"), color("#EF7917"), color("#C8E6EC"), color("#D4C99C")],
      [color("#EAEAEA"), color("#B8CBD6"), color("#C28447"), color("#4A120C"), color("#9FC4CB")]
    ];

      simplex = new SimplexNoise();   // create simplex noise object, o simplex noise é parecido com o perlin noise, 

      createCanvas(900, 900, WEBGL); // create canvas
      for (let i = 0; i < 9; i++) { // create 10 textures for the planets
        let seedX = random(0, 1000); // random seed for x
        let seedY = random(0, 1000); // random seed for y 
        let seedXCloud = random(0, 1000); // random seed for x
        let seedYCloud = random(0, 1000); // random seed for y
      let colorArray1 = customShuffle(colors[i % colors.length]).slice(0, 15); // 
      let colorArray2 = customShuffle(colors[(i+1) % colors.length]).slice(0, 15); //
      let colorArray1Cloud = customShuffle(colors[i % colors.length]).slice(0, 15); // 
    let colorArray2Cloud = customShuffle(colors[(i+1) % colors.length]).slice(0, 15); 
    let octavesCloud = floor(random(1, 4));
       let octaves = floor(random(1, 8));
        textures[i] = defTexture(1000, 1000, seedX, seedY, colorArray1, colorArray2, octaves);
        planetSizes[i] = random(30, 100); // create random size for each planet
        cloudTextures[i] = generateCloudTexture(1000, 1000, seedXCloud, seedYCloud, colorArray1Cloud, colorArray2Cloud, octavesCloud); // create the cloud texture
        
      }
      noStroke(); // no stroke on the planets
      lights();  // luuuuuuuuuuuz
    
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
  
          texture(cloudTextures[i]); // set the cloud texture
          sphere(planetSizes[i] * 1.02);
          pop();  // pop to not affect the other planets
      }
    }
/*------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------FUNCTIONS-------------------------------------------------------*/
    
      //TEXTURAS DOS PLANETAS

      function defTexture(wid=1000, hei=1000, seedX=0, seedY=0, colorArray1, colorArray2, octaves) { /* function to create the texture, with default values for 
      the width and height of the texture and the seeds for the noise function */
        let t = createImage(wid, hei); // create the image with the width and height
        t.loadPixels(); // load the pixels 

        // warp effect, the warping effect is based on the noise function, so it's not random, but it's not the same for each planet
        // o que o warp faz é basicamente distorcer a imagem, ele pega a posição de um pixel e muda para a posição de outro pixel
        // usando random aqui, cada planeta vai ter um efeito diferente baseado na função de ruído atribuida a ele
        let warpScale = random(0.01, 0.5); //reduce warp effect for smoother result
        let warpMultiplier = random(0.01, 0.5); //reduce warp effect for smoother result
        // let frequency = random(0.1, 0.3); //higher for more varied patterns
        // let persistence = random(0.01, 0.5); //higher for smoother transitions

        for (let y = 0; y < t.height; y++) { // for each pixel in the image 
          for (let x = 0; x < t.width; x++) { 
            let lon = map(x, 0, t.width, 0, TWO_PI); // map the x value to the longitude value (0 to 2PI) 
            let lat = map(y, 0, t.height, 0, PI); // map the y value to the latitude value (0 to PI) 
            // pra mapear corretamente estou usando coordenadas esféricas (longitude e latitude) e não cartesianas (x e y) 
            let nx = sin(lat) * cos(lon); // calculate the x value of the normal vector 
            let ny = sin(lat) * sin(lon); // calculate the y value of the normal vector
            let nz = cos(lat); // calculate the z value of the normal vector
            
            let warpX = noise(nx * warpScale, ny * warpScale);
            let warpY = noise(ny * warpScale, nx * warpScale);
            let warpZ = noise(nz * warpScale, nx * warpScale);

            nx += warpX * warpMultiplier; //use consistent warp multiplier
            ny += warpY * warpMultiplier; 
            nz += warpZ * warpMultiplier;
            
            // Noise value using fBm, with 4 octaves and a lacunarity of 2. fBm is a fractal noise function, that is, a noise function that is composed of 
            let h = 0; // height value
            //let maxPossible = 0;
            let amplitude = 0.5; // amplitude value
            for(let i = 0; i < octaves; i++){ // for each octave, calculate the height value. An octave is a noise function with a frequency and an amplitude 
              h += amplitude * (simplex.noise3D(seedX + nx * pow(2, i), seedY + ny * pow(2, i), nz * pow(2, i)) + noise(nx, ny, nz) + 1) / 3; // calculate the height value using the noise function 
              amplitude *= 0.5; // decrease the amplitude
              // maxPossible += amplitude;
              //       amplitude *= persistence;
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

      function generateCloudTexture(wid, hei, seedX=0, seedY=0, colorArray1, colorArray2, octavesCloud) {
        let cl = createImage(wid, hei);
        cl.loadPixels();
        
        let frequency = random(0.1, 0.3); //higher for more varied patterns
        let persistence = random(0.01, 0.5); //higher for smoother transitions
        let warpScale = random(0.01, 0.5); //reduce warp effect for smoother result
        let warpMultiplier = random(0.01, 0.5); //higher for more varied patterns
        
        for (let y = 0; y < cl.height; y++) {
            for (let x = 0; x < cl.width; x++) {
                let lon = map(y, 0, cl.width, 0, TWO_PI);
                let lat = map(x, 0, cl.height, 0, PI);
                let nx = sin(lat) * cos(lon);
                let ny = sin(lat) * sin(lon);
                let nz = cos(lat);
                
                let warpX = noise(nx * warpScale, ny * warpScale);
                let warpY = noise(ny * warpScale, nx * warpScale);
                
                
                nx += warpX * warpMultiplier; //use consistent warp multiplier
                ny += warpY * warpMultiplier;
    
                let n = 0;
                let maxPossible = 0;
                let amplitude = 0.8;  //higher for more varied patterns
                
                for(let i = 0; i < octavesCloud; i++) {
                    n += amplitude * noise(seedX + nx * pow(2, i) * frequency, seedY + ny * pow(2, i) * frequency, nz * pow(2, i) * frequency);
                    maxPossible += amplitude;
                    amplitude *= persistence;
                }
                
                n = n / maxPossible; //normalize the result
                
                let c1 = pickColor(n, colorArray1);
                let c2 = pickColor(n, colorArray2);
                let mix = (sin(n * PI) + 1) / 2;
                let c = lerpColor(c1, c2, mix);
    
                c.setAlpha(map(n, 0, 1, random(0,20), random(0,200))); //set the minimum alpha value to a higher number for more opacity
                
                cl.set(x, y, c);
            }
        }
        cl.updatePixels();
        return cl;
    }
    
    
    

    
    
    
      

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
