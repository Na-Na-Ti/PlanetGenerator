class Planet {
  constructor(colors, seedX, seedY, seedXCloud, seedYCloud, colorArray1, colorArray2, colorArray1Cloud, colorArray2Cloud, octaves, octavesCloud, size) {
    this.colors = colors;
    this.seedX = seedX;
    this.seedY = seedY;
    this.seedXCloud = seedXCloud;
    this.seedYCloud = seedYCloud;
    this.colorArray1 = colorArray1;
    this.colorArray2 = colorArray2;
    this.colorArray1Cloud = colorArray1Cloud;
    this.colorArray2Cloud = colorArray2Cloud;

    this.octaves = octaves;
    this.octavesCloud = octavesCloud;
    this.size = size;
    this.fitness = 0;

    this.initTextures();
  }
  async initTextures() {
    [this.texture, this.cloudTexture] = await Promise.all([
      this.genTexture(this.seedX, this.seedY, this.colorArray1, this.colorArray2, this.octaves),
      this.genTexture(this.seedXCloud, this.seedYCloud, this.colorArray1Cloud, this.colorArray2Cloud, this.octavesCloud)
    ]);
  }

  async genTexture(seedX, seedY, colorArray1, colorArray2, octaves) {
    let t = await defTexture(200, 200, seedX, seedY, colorArray1, colorArray2, octaves);
    return t;
  }

  crossover(partner) {
    let child = new Planet(this.colors,
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
      random() > 0.5 ? this.size : partner.size);

    return child;
  }

  async mutate() {
    if (random() < 0.01) {
      this.seedX = random(0, 200);
      this.seedY = random(0, 200);
      this.seedXCloud = random(0, 200);
      this.seedYCloud = random(0, 200);
      this.octaves = floor(random(1, 8));
      this.octavesCloud = floor(random(1, 4));
      this.size = random(30, 100);
    }
    if (random() < 0.01) {
      this.colorArray1 = customShuffle(this.colors[colorIndex]).slice(0, 15); // Use this.colors instead of colors
      this.colorArray2 = customShuffle(this.colors[colorIndex]).slice(0, 15); // Use this.colors instead of colors
      this.colorArray1Cloud = customShuffle(this.colors[colorIndex]).slice(0, 15); // Use this.colors instead of colors
      this.colorArray2Cloud = customShuffle(this.colors[colorIndex]).slice(0, 15); // Use this.colors instead of colors
    }


      [this.texture, this.cloudTexture] = await Promise.all([
        this.genTexture(this.seedX, this.seedY, this.colorArray1, this.colorArray2, this.octaves),
        this.genTexture(this.seedXCloud, this.seedYCloud, this.colorArray1Cloud, this.colorArray2Cloud, this.octavesCloud)
      ]);
    }
  }


class Population {
  constructor(colors, populationSize) {
    this.isGenerating = false;
    this.planets = [];
    this.highlightedPlanet = null;
    for (let i = 0; i < populationSize; i++) {
      let seedX = random(0, 200);
      let seedY = random(0, 200);
      let seedXCloud = random(0, 200);
      let seedYCloud = random(0, 200);
      let colorArray1 = customShuffle(colors[i % colors.length]).slice(0, 15);
      let colorArray2 = customShuffle(colors[(i + 1) % colors.length]).slice(0, 15);
      let colorArray1Cloud = customShuffle(colors[i % colors.length]).slice(0, 15);
      let colorArray2Cloud = customShuffle(colors[(i + 1) % colors.length]).slice(0, 15);
      let octavesCloud = floor(random(1, 4));
      let octaves = floor(random(1, 8));
      let size = random(30, 100);
      this.selected = false;

      this.planets.push(new Planet(colors, seedX, seedY, seedXCloud, seedYCloud, colorArray1, colorArray2, colorArray1Cloud, colorArray2Cloud, octaves, octavesCloud, size));
    }
    this.fitness = 0;
  }

  async createNewGeneration() {
    if (this.isGenerating) {
      return;
    }
    this.isGenerating = true;
    let newGeneration = [];

    let selectedPlanets = this.planets.filter(planet => planet.selected);
    let totalFitness = this.planets.reduce((total, planet) => total + planet.fitness, 0);

    
    for (let i = 0; i < this.planets.length; i++) {
      let parent1 = this.selectParent(totalFitness, selectedPlanets);
      let parent2 = this.selectParent(totalFitness, selectedPlanets);

      let child = parent1.crossover(parent2);
      child.mutate();
      await child.initTextures();
      newGeneration.push(child);
      
    }

    this.planets = newGeneration;
    this.isGenerating = false;
  }
  selectParent(totalFitness) {
    let selection = random(totalFitness);
    for(let i = 0; i < this.planets.length; i++){
      if (selection < this.planets[i].fitness){
        return this.planets[i];
      }
      selection -= this.planets[i].fitness;
    }
  }
  getPlanetIndexAtMousePosition() {
    let columns = Math.floor(Math.sqrt(this.planets.length));
    let rows = Math.ceil(this.planets.length / columns);
    let planetSize = Math.min(width / (columns + 1), height / (rows + 1));
    let offsetX = (width - (columns * planetSize)) / 2;
    let offsetY = (height - (rows * planetSize)) / 2;


    let mouseColumn = Math.floor((mouseX - offsetX));
    let mouseRow = Math.floor((mouseY - offsetY));

    if (mouseColumn < 0 || mouseRow < 0 || mouseColumn >= columns || mouseRow >= rows) {
      return -1;
  }
    let index = mouseRow * columns + mouseColumn;
    if (index >= this.planets.length) {
    
      return -1;
  }

  let planetCenterX = offsetX + (mouseColumn * planetSize) + (planetSize / 2);
  let planetCenterY = offsetY + (mouseRow * planetSize) + (planetSize / 2);

  let dx = mouseX - planetCenterX;
  let dy = mouseY - planetCenterY;
  let distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > planetSize / 2) {
    
    return -1;
  }
  return index;
}
  
    selectPlanet(index) {
      if (index !== -1) { 
        this.planets[index].selected = !this.planets[index].selected;
      }
    }
    highlightPlanet() {
      let index = this.getPlanetIndexAtMousePosition();
      this.highlightedPlanet = index !== -1 ? this.planets[index] : null;
    }
    updateFitness() {
      for (let planet of this.planets) {
        planet.fitness = planet.selected ? 1 : 0;
      }
    }
  }


let simplex; 
let textures = []; 
let colors = []; 
let planetSizes = []; 
let cloudTextures = [];
let population;
let populationSize = 9;
let isEnterKeyPressed = false;

    function setup() { 
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
      for (let i = 0; i < 9; i++) { 
        let seedX = random(0, 200); 
        let seedY = random(0, 200); 
        let seedXCloud = random(0, 200);
        let seedYCloud = random(0, 200); 
      let colorArray1 = customShuffle(colors[i % colors.length].slice(0,15));  
      let colorArray2 = customShuffle(colors[(i+1) % colors.length].slice(0,15)); 
      let colorArray1Cloud = customShuffle(colors[i % colors.length].slice(0,15)); 
      let colorArray2Cloud = customShuffle(colors[(i+1) % colors.length].slice(0,15)); 
      let octavesCloud = floor(random(1, 4));
       let octaves = floor(random(1, 8));
        textures[i] = defTexture(200, 200, seedX, seedY, colorArray1, colorArray2, octaves);
        planetSizes[i] = random(30, 100);
        cloudTextures[i] = generateCloudTexture(200, 200, seedXCloud, seedYCloud, colorArray1Cloud, colorArray2Cloud, octavesCloud);         
      }
      noStroke(); 
      lights();      
    }
    function draw() {

      
      background(0); 

      let columns = Math.floor(Math.sqrt(textures.length)); 
      let rows = Math.ceil(textures.length / columns); 
      let planetSize = Math.min(width / (columns + 1), height / (rows + 1)); 
      let offsetX = (width - (columns * planetSize)) / 2;
      let offsetY = (height - (rows * planetSize)) / 2;  
      population.highlightPlanet();

      for (let i = 0; i < population.planets.length; i++){ 
        let x = (i % columns) * planetSize + offsetX;
        let y = Math.floor(i / columns) * planetSize + offsetY;

        push();
        translate(x - width / 2, y - height / 2);
        rotateY(frameCount * 0.01);
        texture(population.planets[i].texture);
        sphere(population.planets[i].size);
        texture(population.planets[i].cloudTexture);
        sphere(population.planets[i].size * 1.02);
        pop();
        
        if (population.planets[i] === population.highlightedPlanet) {
          stroke(255, 255, 0);
          strokeWeight(1);
        } else if (population.planets[i].selected) {
          stroke(0, 255, 0);
          strokeWeight(2);
        } else {
          noStroke();
        }
      }
    }
  

    function mousePressed() {
      let index = population.getPlanetIndexAtMousePosition();
      population.selectPlanet(index);
    }

    function mouseClicked() {
      for (let i = 0; i < population.planets.length; i++) {
        population.planets[i].fitness += 1;
      }
    }

  function keyPressed() {
    if (keyCode === ENTER) {
      if (!population.isGenerating) {
        population = new Population(colors, populationSize);
      }
    } else if (keyCode === 32) {
      if (!population.isGenerating) {
        population.updateFitness();
        population.createNewGeneration();
      }
    }
  }
   
    let textureCache = {};
   
     async function defTexture(wid=200, hei=200, seedX=0, seedY=0, colorArray1, colorArray2, octaves) { 
        let key = `${wid}-${hei}-${seedX}-${seedY}-${colorArray1.toString()}-${colorArray2.toString()}-${octaves}`;
        if(textureCache[key]) {
          return textureCache[key];
        } 
        let t = await new Promise((resolve, reject) => {
        let t = createImage(wid, hei);
        t.loadPixels();
        let warpScale = random(0.01, 0.5); 
        let warpMultiplier = random(0.01, 0.5); 
        for (let y = 0; y < t.height; y++) { 
          for (let x = 0; x < t.width; x++) { 
            let lon = map(x, 0, t.width, 0, TWO_PI); 
            let lat = map(y, 0, t.height, 0, PI); 
            let nx = sin(lat) * cos(lon); 
            let ny = sin(lat) * sin(lon); 
            let nz = cos(lat);            
            let warpX = noise(nx * warpScale, ny * warpScale);
            let warpY = noise(ny * warpScale, nx * warpScale);
            let warpZ = noise(nz * warpScale, nx * warpScale);
            nx += warpX * warpMultiplier; 
            ny += warpY * warpMultiplier; 
            nz += warpZ * warpMultiplier; 
            let h = 0;
            let amplitude = 0.5; 
            for(let i = 0; i < octaves; i++){ 
              h += amplitude * (simplex.noise3D(seedX + nx * pow(2, i), seedY + ny * pow(2, i), nz * pow(2, i)) + noise(nx, ny, nz) + 1) / 3;
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
        resolve(t); 
      });
      textureCache[key] = t;
      return t; 
      }
      
    
      function generateCloudTexture(wid, hei, seedX=0, seedY=0, colorArray1, colorArray2, octavesCloud) {
        return new Promise((resolve, reject) => {
        let cl = createImage(wid, hei);
        cl.loadPixels();        
        let frequency = random(0.1, 0.3);
        let persistence = random(0.01, 0.5); 
        let warpScale = random(0.01, 0.5); 
        let warpMultiplier = random(0.01, 0.5);         
        for (let y = 0; y < cl.height; y++) {
            for (let x = 0; x < cl.width; x++) {
                let lon = map(y, 0, cl.width, 0, TWO_PI);
                let lat = map(x, 0, cl.height, 0, PI);
                let nx = sin(lat) * cos(lon);
                let ny = sin(lat) * sin(lon);
                let nz = cos(lat);                
                let warpX = noise(nx * warpScale, ny * warpScale);
                let warpY = noise(ny * warpScale, nx * warpScale);  
                nx += warpX * warpMultiplier;
                ny += warpY * warpMultiplier;    
                let n = 0;
                let maxPossible = 0;
                let amplitude = 0.8;                  
                for(let i = 0; i < octavesCloud; i++) {
                    n += amplitude * noise(seedX + nx * pow(2, i) * frequency, seedY + ny * pow(2, i) * frequency, nz * pow(2, i) * frequency);
                    maxPossible += amplitude;
                    amplitude *= persistence;
                }                
                n = n / maxPossible;                 
                let c1 = pickColor(n, colorArray1);
                let c2 = pickColor(n, colorArray2);
                let mix = (sin(n * PI) + 1) / 2;
                let c = lerpColor(c1, c2, mix);    
                c.setAlpha(map(n, 0, 1, random(0,30), random(0,200)));                 
                cl.set(x, y, c);
            }
        }
        cl.updatePixels();
         resolve(cl);
  });
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
