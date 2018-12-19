/** NOTE
 * J White
 * 12.14.2018
 * Automaton Delivery/Pick-up Project
 * Goal -
 *
 */

// MAP of Meadowfield that consists of 11 places with 14 roads between them.
// a list (array) of the place and roads in Meadowfield
//constant array --- Never changes
const roads =
[
    "Alice's House-Bob's House",   "Alice's House-Cabin",
    "Alice's House-Post Office",   "Bob's House-Town Hall",
    "Daria's House-Ernie's House", "Daria's House-Town Hall",
    "Ernie's House-Grete's House", "Grete's House-Farm",
    "Grete's House-Shop",          "Marketplace-Farm",
    "Marketplace-Post Office",     "Marketplace-Shop",
    "Marketplace-Town Hall",       "Shop-Town Hall"
];


//builds a graph of the locations (to <---> from)
//convert the list of roads to a data structure that,
//for each place, tells us what can be reached from there.
//refers to x,y coordinate --- gives your robot a location to
//travel to.
function buildGraph(edges)
{
    let graph = Object.create(null);
    function addEdge(from, to)
    {
      if (graph[from] == null)
      {
        graph[from] = [to];
      }
      else
      {
        graph[from].push(to);
      }
    }
    for (let [from, to] of edges.map(r => r.split("-")))
    {
      addEdge(from, to);
      addEdge(to, from);
    }
    return graph;
  }

  // binding the value of buildGraph to roads
  const roadGraph = buildGraph(roads);

  console.log(roadGraph);

  // creates the village state
  // how many packages or parcels or locations exists in the
  // village.
  class VillageState
  {
    constructor(place, parcels)
    {
      this.place = place;
      this.parcels = parcels;
    }
    move(destination)
    {
      if (!roadGraph[this.place].includes(destination))
      {
        return this;
      }
      else
      {
        let parcels = this.parcels.map(p => {
          if (p.place != this.place) return p;
          return {place: destination, address: p.address};
        }).filter(p => p.place != p.address);
        return new VillageState(destination, parcels);
      }
    }
  }

  //test

  console.log(VillageState);

  //function to that returns is an object containing both the
  //direction it wants to move in and a memory value that will
  //be given back to it the next time it is called.
  //function to hold the previous location that the robot has
  //been
  function runRobot(state, robot, memory)
  {
    for (let turn = 0;; turn++)
    {
      if (state.parcels.length == 0)
      {
        console.log(`Done in ${turn} turns`);
        break;
      }

      let action = robot(state, memory);
      state = state.move(action.direction);
      memory = action.memory;
      console.log(`Moved to ${action.direction}`);
    }
  }

  //
  function randomPick(array) {
    let choice = Math.floor(Math.random() * array.length);
    return array[choice];
  }

  function randomRobot(state) {
    return {direction: randomPick(roadGraph[state.place])};
  }


  // Creates a new state with some parcels.
  // randomly picks an address
  VillageState.random = function(parcelCount = 5)
  {
    let parcels = [];
    for (let i = 0; i < parcelCount; i++)
    {
      let address = randomPick(Object.keys(roadGraph));
      let place;
      do
      {
        place = randomPick(Object.keys(roadGraph));
      }
      while (place == address);
      parcels.push({place, address});
    }
    return new VillageState("Post Office", parcels);
  };

  // makes optinum decision where to deliver
  const mailRoute = [
    "Alice's House", "Cabin", "Alice's House", "Bob's House",
    "Town Hall", "Daria's House", "Ernie's House",
    "Grete's House", "Shop", "Grete's House", "Farm",
    "Marketplace", "Post Office"
  ];

  //
  function routeRobot(state, memory) {
    if (memory.length == 0) {
      memory = mailRoute;
    }
    return {direction: memory[0], memory: memory.slice(1)};
  }

  function findRoute(graph, from, to) {
    let work = [{at: from, route: []}];
    for (let i = 0; i < work.length; i++) {
      let {at, route} = work[i];
      for (let place of graph[at]) {
        if (place == to) return route.concat(place);
        if (!work.some(w => w.at == place)) {
          work.push({at: place, route: route.concat(place)});
        }
      }
    }
  }

  function goalOrientedRobot({place, parcels}, route) {
    if (route.length == 0) {
      let parcel = parcels[0];
      if (parcel.place != place) {
        route = findRoute(roadGraph, place, parcel.place);
      } else {
        route = findRoute(roadGraph, place, parcel.address);
      }
    }
    return {direction: route[0], memory: route.slice(1)};
  }



  //
  //runRobotAnimation(VillageState.random(), randomRobot);
  runRobot(VillageState.random(),
                  goalOrientedRobot, []);




//
 /* function runRobot(state, robot, memory) {
  for (let turn = 0;; turn++) {
    if (state.parcels.length == 0) {
      console.log(`Done in ${turn} turns`);
      break;
    }
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
    console.log(`Moved to ${action.direction}`);
  }
} */

  //
