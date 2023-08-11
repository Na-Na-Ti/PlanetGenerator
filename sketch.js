//--------------------------------------------lets and arrays--------------------------------------------------------

let simplex; // simplex noise object
let textures = []; // array of textures
let colors = []; // array of colors
let planetSizes = []; // array of planet sizes
let cloudTextures = []; // array of cloud textures
let populationSize = 9; // number of planets in population
let population; // population object
let MutationRate = 0.5;  // mutation rate
//solar system code
let angle = 0; 
let sunRadius = 100;
let a = 300; 
let b = -300; 
let orbitSpeed = 0.01;
let sunTexture;
let page = 0;
//solar system code

/*-----------------------------------------------------------------------------------------------------------------
--------------------------------------------Classes--------------------------------------------------------*/

class Planet {
  constructor(colors, seedX, seedY, seedXCloud, seedYCloud, colorArray1, colorArray2, colorArray1Cloud, colorArray2Cloud, octaves, octavesCloud, size) {
    this.colors = colors; 
    this.seedX = seedX; // x seed for planet texture
    this.seedY = seedY; // y seed for planet texture
    this.seedXCloud = seedXCloud; // x seed for cloud texture
    this.seedYCloud = seedYCloud; // y seed for cloud texture
    this.colorArray1 = colorArray1; // color array for planet texture
    this.colorArray2 = colorArray2; // color array for planet texture
    this.colorArray1Cloud = colorArray1Cloud; // color array for cloud texture
    this.colorArray2Cloud = colorArray2Cloud; // color array for cloud texture
    this.octaves = octaves; // octaves, number of layers of noise
    this.octavesCloud = octavesCloud; // octaves, number of layers of noise for clouds
    this.size = size; // size of planet
    this.fitness = 0; // fitness of planet
    this.texturesReady = false; // boolean for if textures are ready
    this.selected = false; // boolean for if planet is selected
    this.initTextures(); // initialize textures
  }
  // initialize textures
   initTextures() {
    this.texture = this.genTexture(this.seedX, this.seedY, this.colorArray1, this.colorArray2, this.octaves);
    this.cloudTexture = this.genTextureCloud(this.seedXCloud, this.seedYCloud, this.colorArray1Cloud, this.colorArray2Cloud, this.octavesCloud);
    this.texturesReady = true; 
  }

  // generate planet texture
   genTexture(seedX, seedY, colorArray1, colorArray2, octaves) {
    let t = defTexture(200, 200, seedX, seedY, colorArray1, colorArray2, octaves);
    return t;
  }

  // generate cloud texture
  genTextureCloud(seedX, seedY, colorArray1, colorArray2, octavesCloud){
    let c = generateCloudTexture(200, 200, seedX, seedY, colorArray1, colorArray2, octavesCloud);
    return c;
  }

  // crossover function, this function do a crossover between two or more planets, and return a new planet
  crossover(partner) {  
    // chance of 50% to get a gene from one of the parents
    let child = new Planet(
      this.colors, 
      random() > 0.5 ? this.seedX : partner.seedX,
      random() > 0.5 ? this.seedY : partner.seedY,
      random() > 0.5 ? this.seedXCloud : partner.seedXCloud,
      random() > 0.5 ? this.seedYCloud : partner.seedYCloud,
      random() > 0.5 ? this.colorArray1 : partner.colorArray1,
      random() > 0.5 ? this.colorArray2 : partner.colorArray2,
      random() > 0.5 ? this.colorArray1Cloud : partner.colorArray1Cloud,
      random() > 0.5 ? this.colorArray2Cloud : partner.colorArray2Cloud,
      random() > 0.5 ? this.octaves : partner.octaves,
      random() > 0.5 ? this.octavesCloud : partner.octavesCloud,
      random() > 0.5 ? this.size : partner.size
    );
    return child;
  }

  // mutation function, this function do a mutation in the planet depending on the mutation rate
  // this specific mutation function 
   mutate() {

    if (random() < MutationRate) {
      this.seedX += random(-100, 100);
        this.seedY += random(-100, 100);
        this.seedXCloud += random(-100, 100);
        this.seedYCloud += random(-100, 100);
        this.size += random(-10, 10);
        this.octaves += floor(random(-1, 2));
        this.octavesCloud += floor(random(-1, 2));
        
        let colorIndex = Math.floor(Math.random() * this.colors.length);
        this.colorArray1 = customShuffle(this.colors[colorIndex]).slice(0, 5); 
        this.colorArray2 = customShuffle(this.colors[colorIndex]).slice(0, 5); 
        this.colorArray1Cloud = customShuffle(this.colors[colorIndex]).slice(0, 5); 
        this.colorArray2Cloud = customShuffle(this.colors[colorIndex]).slice(0, 5); 

        this.size = constrain(this.size, 30, 100);
        this.octaves = constrain(this.octaves, 1, 8);
        this.octavesCloud = constrain(this.octavesCloud, 1, 4);
     
    }
      
    
      [this.texture, this.cloudTexture] = ([
        this.genTexture(this.seedX, this.seedY, this.colorArray1, this.colorArray2, this.octaves),
        this.genTextureCloud(this.seedXCloud, this.seedYCloud, this.colorArray1Cloud, this.colorArray2Cloud, this.octavesCloud)
      ]);
    
  }
}

// population class, basically a list of planets
class Population {
  constructor(colors, populationSize) {

    this.planets = [];   
    for (let i = 0; i < populationSize; i++) {
      let seedX = random(0, 200);
      let seedY = random(0, 200);
      let seedXCloud = random(0, 200);
      let seedYCloud = random(0, 200);
      let colorArray1 = customShuffle(colors[i % colors.length]).slice(0, 5);
      let colorArray2 = customShuffle(colors[(i + 1) % colors.length]).slice(0, 5);
      let colorArray1Cloud = customShuffle(colors[i % colors.length]).slice(0, 5);
      let colorArray2Cloud = customShuffle(colors[(i + 1) % colors.length]).slice(0, 5);
      let octavesCloud = floor(random(1, 4));
      let octaves = floor(random(1, 8));
      let size = random(30, 100);
      

      this.planets.push(new Planet(colors, seedX, seedY, seedXCloud, seedYCloud, colorArray1, colorArray2, colorArray1Cloud, colorArray2Cloud, octaves, octavesCloud, size));
    }
    this.fitness = 0;
  }


  // calculate fitness of each planet
  createNewGeneration() {
    let newGeneration = [];

    let selectedPlanets = this.planets.filter(planet => planet.selected);
    let totalFitness = this.planets.reduce((total, planet) => total + planet.fitness, 0);

    
    for (let i = 0; i < this.planets.length; i++) {
      let parent1 = this.selectParent(totalFitness, selectedPlanets);
      let parent2 = this.selectParent(totalFitness, selectedPlanets);

      let child = parent1.crossover(parent2);
      child.mutate();
      child.initTextures();
      newGeneration.push(child);
      
    }

    this.planets = newGeneration;
    
  }

  // select a parent based on the fitness
  selectParent(totalFitness, selectedPlanets) {
    let selection = random(totalFitness);
    for(let i = 0; i < selectedPlanets.length; i++){
      if (selection < selectedPlanets[i].fitness){
        return selectedPlanets[i];
      }
      selection -= selectedPlanets[i].fitness;
    }
  }

  //get the index of the planet that was pressed
  getPlanetIndexAtKeyPressed() {
    if (key >= '1' && key <= '9') {
      let index = int(key) - 1;
      if (index >= 0 && index < this.planets.length) {
        return index;
      }
    }
    return -1;
  }
  
    selectPlanet(index) {  
      if (index !== -1) {
        this.planets[index].selected = !this.planets[index].selected;
      }
    }

    updateFitness() {
      for (let planet of this.planets) {
        planet.fitness = planet.selected ? 1 : 0;
      }
    }
  }
  



/*-----------------------------------------------------------------------------------------------------------------------
------------------------------------------Texture functions-----------------------------------------------------*/
   
 function defTexture(wid, hei, seedX=0, seedY=0, colorArray1, colorArray2, octaves) { 
   
   let t = createImage(wid, hei);
   t.loadPixels();
   for (let y = 0; y < t.height; y++) { 
     for (let x = 0; x < t.width; x++) { 
       let lon = map(x, 0, t.width, 0, TWO_PI); 
       let lat = map(y, 0, t.height, 0, PI); 
       let nx = sin(lat) * cos(lon); 
       let ny = sin(lat) * sin(lon); 
       let nz = cos(lat);            
       let h = 0;
       let amplitude = 0.5; 
       for(let i = 0; i < octaves; i++){ 
         h += amplitude * (simplex.noise3D(seedX + nx * pow(2, i), seedY + ny * pow(2, i), nz * pow(2, i)) + 1)/ 2;
         amplitude *= 0.5;
       }
       h = map(h, 0, 1, 0, 1); 
       let c1 = pickColor(h, colorArray1);  
       let c2 = pickColor(h, colorArray2);  
       let mix = (sin(h * PI) + 1) / 2; 
       let c = lerpColor(c1, c2, mix);  
       t.set(x, y, c); 
     }
   }
   t.updatePixels(); 
   return t;
 }

 function generateCloudTexture(wid, hei, seedX=0, seedY=0, colorArray1, colorArray2, octavesCloud) {
   
   let cl = createImage(wid, hei);
   cl.loadPixels();             
   for (let y = 0; y < cl.height; y++) {
       for (let x = 0; x < cl.width; x++) {
           let lon = map(y, 0, cl.width, 0, TWO_PI);
           let lat = map(x, 0, cl.height, 0, PI);
           let nx = sin(lat) * cos(lon);
           let ny = sin(lat) * sin(lon);
           let nz = cos(lat);                   
           let n = 0;
           let amplitude = 0.5;                  
           for(let c = 0; c < octavesCloud; c++) {
            n += amplitude * noise(seedX + nx * pow(2, c), seedY + ny * pow(2, c), nz * pow(2, c) + 1)/2;
               amplitude *= 0.5;
           }                
            
           n = map(n, 0, 1, 0, 1);           
           let c1 = pickColor(n, colorArray1);
           let c2 = pickColor(n, colorArray2);
           let mix = (sin(n * PI) + 1) / 2;
           let c = lerpColor(c1, c2, mix);    
           c.setAlpha(map(n, 0, 1, random(0,30), random(0,200)));                 
           cl.set(x, y, c);
       }
   }
   cl.updatePixels();
    return cl;
}

 function pickColor(h, colorArray) { 
  let index = floor(h * (colorArray.length - 1)); 
  let color1 = colorArray[index]; 
  let color2 = colorArray[min(index + 1, colorArray.length - 1)]; 
  let factor = (h * (colorArray.length - 1)) - index; 

  return lerpColor(color1, color2, factor);
 }
 
 function customShuffle(array) { 
   let currentIndex = array.length, temporaryValue, randomIndex; 
   while (0 !== currentIndex) { 
     randomIndex = Math.floor(Math.random() * currentIndex); 
     currentIndex -= 1; 
     temporaryValue = array[currentIndex]; 
     array[currentIndex] = array[randomIndex];
     array[randomIndex] = temporaryValue; 
   }
   return array; 
 }



/*------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------SETUP-------------------------------------------------------*/


    function setup() { 
      sunTexture = loadImage('sun.png'); //solar system code

     colors = [
      [color("#008dc4"), color("#00a9cc"), color("#eecda3"), color("#7ec850"), color("#676767"), color("#fffafa")], 
      [color("#DB6853"), color("#8CEA79"), color("#B66EF5"), color("#F5D15F"), color("#6AE7EB"), color("#DB66F5")], 
      [color("#ECD67D"), color("#5867AE"), color("#3E7C34"), color("#242E5D"), color("#774724"), color("#84D0F0")],
      [color("#E7EBEC"), color("#FCBF0A"), color("#EF7917"), color("#C8E6EC"), color("#D4C99C"), color("#EAEAEA"),],
      [color("#B8CBD6"), color("#C28447"), color("#4A120C"), color("#9FC4CB"), color("#F2E8C4"), color("#F2E8C4")],
    ];
      simplex = new SimplexNoise();  
      population = new Population(colors, populationSize);  
      createCanvas(900, 900, WEBGL); 
      
      noStroke(); 
      lights();  

      
  }
  
/*------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------DRAW-------------------------------------------------------*/

    function draw() {
      if (keyPressed && key === 's') {
        page = 1;
      } else if (keyPressed && key === 'e'){
        page = 0;
      }

      switch (page) {
        case 0:
          background(0);
        
          let columns = Math.floor(Math.sqrt(population.planets.length)); 
          let rows = Math.ceil(population.planets.length / columns); 
          let planetSize = Math.min(width / (columns + 1), height / (rows + 1)); 
          let offsetX = (width - (columns * planetSize)) / 2;
          let offsetY = (height - (rows * planetSize)) / 2;  
      
          for (let i = 0; i < population.planets.length; i++){ 
            let x = (i % columns) * planetSize + offsetX;
            let y = Math.floor(i / columns) * planetSize + offsetY;

            push();
            translate(x - width / 2, y - height / 2);
            rotateY(frameCount * 0.01);
            texture(population.planets[i].texture);
            sphere(population.planets[i].size);
            

            if (population.planets[i].selected) {
              stroke(0, 255, 0);
              strokeWeight(0.5);
            } else {
              noStroke();
            }
            texture(population.planets[i].cloudTexture);
            sphere(population.planets[i].size * 1.02);
            pop();
          }
          
          break;
        case 1:
          background(0); 
          for (let i = 0; i < population.planets.length; i++) {
            if (population.planets[i].selected) {
              push();
    
              noStroke(); 
              camera(0, 0, 800, 0, 0, 0, 0, 1, 0);
    
              push();
              texture(sunTexture);
              sphere(sunRadius);
              pop();
    
              rotateY(frameCount * 0.01);
    
              push();
                let x = a * cos(angle);
                let y = 0;
                let z = b * sin(angle);
                translate(x, y, z);
                texture(population.planets[i].texture);
                sphere(population.planets[i].size);
              pop();
    
              angle += orbitSpeed;
              pop();
              return; 
            }
          }
          break;
      }
      
    }


/*------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------KEYPRESSED-------------------------------------------------------*/
  function keyPressed() {
    
    let index = population.getPlanetIndexAtKeyPressed();
    population.selectPlanet(index);

    if (keyCode === ENTER) {
      
        population = new Population(colors, populationSize);
      
    } else if (keyCode === 32) {
      console.log("Space bar pressed. Starting evolution process...");
          population.updateFitness();
          population.createNewGeneration();      
    } 
    
  } 
