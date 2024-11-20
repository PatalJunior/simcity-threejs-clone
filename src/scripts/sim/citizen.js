
import { ResidentialZone } from './buildings/zones/residential.js';
import config from '../config.js';

export class Citizen {
  /**
   * @param {ResidentialZone} residence 
   */
  constructor(residence) {
    /**
     * Unique identifier for the citizen
     * @type {string}
     */
    this.id = crypto.randomUUID();

    /**
     * Name of this citizen
     * @type {string}
     */
    this.name = generateRandomName();

    /**
     * Age of the citizen in years
     * @type {number}
     */
    this.age = 1 + Math.floor(100*Math.random());

    /**
     * The current state of the citizen
     * @type {'idle' | 'school' | 'employed' | 'unemployed' | 'retired'}
     */
    this.state = 'idle';

    /**
     * Number of simulation steps in the current state
     */
    this.stateCounter = 0;

    /**
     * Reference to the building the citizen lives at
     * @type {ResidentialZone}
     */
    this.residence = residence;

    this.#initializeState();
  }

  /**
   * Sets the initial state of the citizen
   */
  #initializeState() {
    if (this.age < config.citizen.minWorkingAge) {
      this.state = 'school';
    } else if (this.age >= config.citizen.retirementAge) {
      this.state = 'retired';
    } else {
      this.state = 'unemployed';
    }
  }

  /**
   * Steps the state of the citizen forward in time by one simulation step
   * @param {object} city 
   */
  simulate(city) {
    switch (this.state) {
      case 'idle':
      case 'school':
      case 'retired':
        // Action - None

        // Transitions - None

        break;
      case 'unemployed':

        // TODO

        break;
      case 'employed':
        // Actions - None

        break;
      default:
        console.error(`Citizen ${this.id} is in an unknown state (${this.state})`);
    }
  }

  /**
   * Handles any clean up needed before a building is removed
   */
  dispose() {

  }



  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    return `
      <li class="info-citizen">
        <span class="info-citizen-name">${this.name}</span>
        <br>
        <span class="info-citizen-details">
          <span>
            <img class="info-citizen-icon" src="/icons/calendar.png">
            ${this.age} 
          </span>
          <span>
            <img class="info-citizen-icon" src="/icons/job.png">
            ${this.state}
          </span>
        </span>
      </li>
    `;
  }
}

function generateRandomName() {
  const firstNames = [
    'Emma', 'Olivia', 'Ava', 'Sophia', 'Isabella',
    'Liam', 'Noah', 'William', 'James', 'Benjamin',
    'Elizabeth', 'Margaret', 'Alice', 'Dorothy', 'Eleanor',
    'John', 'Robert', 'William', 'Charles', 'Henry',
    'Alex', 'Taylor', 'Jordan', 'Casey', 'Robin'
  ];

  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Jones', 'Brown',
    'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor',
    'Anderson', 'Thomas', 'Jackson', 'White', 'Harris',
    'Clark', 'Lewis', 'Walker', 'Hall', 'Young',
    'Lee', 'King', 'Wright', 'Adams', 'Green'
  ];

  const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return randomFirstName + ' ' + randomLastName;
}