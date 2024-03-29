const prompts = require('prompts');
const cities = require('./cities');

function transformCitiesToChoices(cities) {
  return cities.map(({
    name,
    id
  }) => ({
    title: name,
    value: id,
  }));
}

const choices = transformCitiesToChoices(cities);

const questions = [{
    type: 'select',
    name: 'source',
    message: 'What is the source state?',
    choices,
  },
  {
    type: 'multiselect',
    name: 'target',
    message: 'What is the target state?',
    choices,
  }
];

function calculateH({
  lat: sourceLat,
  long: sourceLong
}, {
  lat: targetLat,
  long: targetLong
}) {
  return Math.sqrt(Math.pow(targetLat - sourceLat, 2) + Math.pow(sourceLong - targetLong, 2));
}

function getCity(id, cities) {
  return cities.find(city => city.id === id)
}

function getParent(id){
  const parent = cities.find(city => city.neighboars ? city.neighboars.find(n => n.id === id) : false)

  return parent;
}

function calculateGs(id, acG = 0){
  const parent = getParent(id);
  
  if(parent) {
    const { g } = parent.neighboars.find(n => n.id === id);
    return calculateGs(parent.id, acG + g);
  }
  return acG;
}

function aStar(source, target, fs = [], ways = [source]) {
  if(!source.neighboars) {
    return [];
  }
  source.neighboars.forEach(({ id }) => {
    const { name } = cities.find(city => city.id === id);
    const h = calculateH(source, getCity(id, cities));
    const gSum = calculateGs(id);

    const f = gSum + h;

    fs.push({
      f,
      id,
      name,
    });
  });

  const minF = fs.sort((item, targetItem) => targetItem.f - item.f).pop();

  const parent = getParent(minF.id);
  
  if(parent && parent.name !== ways[ways.length - 1].name) {
    ways = ways.splice(0, ways.findIndex(way => way.name === parent.name) + 1);
  }
  ways.push(minF)

  if (target.find(a => minF.id === a)) {
    return ways;
  }

  return aStar(getCity(minF.id, cities), target, fs, ways);
}

(async () => {
  const {
    source,
    target
  } = await prompts(questions);

  const ways = aStar(getCity(source, cities), target);

  if(ways.length) {
    console.log(ways);
  }else{
    console.log("WAY NOT FOUND!");
  }
})()