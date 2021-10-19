/**
 * Holds the inputs for a dimension of an input matrix. 
 * Is either a row input or a column input. 
 * Contains behavior for the plus/minus buttons and the text input that holds the number of rows/columns.
 */
class DimensionInput {
   /**
    * Adds the event listeners to the buttons/input. 
    * @throws Invalid Input type is not "row" or "col".
    * @throws Input Elements Are Null if input, plusBtn or minusBtn cannot be found. 
    * @param {HTMLElement} wrapper The matrix input wrapper.
    * @param {string} type "row" or "col".
    */
   constructor(wrapper, type) {

      if (type !== "row" && type !== "col") {
         throw Error('Invalid Input, type must be either "row" or "col"');
      }

      this.input = wrapper.querySelector(`.${type}-in`);

      if (this.input === null) {
         throw Error("Input Elements Are Null");
      }

      this.oldValue = this.validateInput();
      this.addFocusEventListener();
   }

   /**
    * Adds focus event to the input.
    * On focus selects the text content of the input.
    */
   addFocusEventListener() {
      this.input.addEventListener('focus', () => this.input.select());
   }


   /**
    * Attempts to parse the input value to an integer, if it cannot it sets the input to 1. 
    * Constrains the input value to an integer between 1 and the html max.
    * Updates the input value html to the validated input.
    * @returns {number} An integer between 0 and max.
    */
   validateInput() {
      let val = parseInt(this.input.value);

      if (isNaN(val)) {
         val = 1;
      } else {
         val = Math.max(val, 1);
         val = Math.min(val, this.input.max);
      }
      this.input.value = val;
      return val;
   }
}


/**
 * Represents inputs for a matrix.
 * Holds the row inputs, column inputs, matrix entry inputs, and reset and create buttons.
 * Holds behaviour for them as well. 
 */
class MatrixInput {
   /**
    * Generates an initial input matrix and adds the event listeners to the buttons. 
    * @throws Input Elements Are Null if resetBtn, or the matrix input grid cannot be found.
    * @param {string} matrixID The unique html id of the input matrix.
    */
   constructor(matrixID) {
      this.wrapper = document.getElementById(matrixID);
      this.ID = matrixID;
      this.resetBtn = this.wrapper.querySelector('.reset-btn');

      this.matrix = this.wrapper.querySelector('.input-grid');

      if (this.resetBtn === null || this.matrix === null) {
         throw Error("Input Elements Are Null")
      }

      this.row = new DimensionInput(this.wrapper, "row");
      this.col = new DimensionInput(this.wrapper, "col");

      if (sessionStorage.getItem(this.ID) !== null) {
         let matrixArray = JSON.parse(sessionStorage.getItem(this.ID));
         this.initMatrixFromArray(matrixArray);
      } else {
         this.initMatrix();
      }

      this.addResetButtonListener();
   }


   // -----------------------------------------------------------
   // Add Event Listeners
   // -----------------------------------------------------------
   /**
    * Adds a click event listener to the reset button.
    * On click sets the value to every entry in the input matrix to a blank string.
    */
   addResetButtonListener() {
      this.resetBtn.addEventListener('click', () => this.entries().forEach(entry => entry.value = ""));
   }
   // -----------------------------------------------------------
   // Output
   // -----------------------------------------------------------
   /**
    * @throws Invalid Input Error
    * @returns {string[][]}
    */
   toArray() {
      let matrix = [];

      const rows = this.rows();
      const columns = this.columns();

      for (let row = 0; row < rows; row++) {
         matrix[row] = [];
         for (let col = 0; col < columns; col++) {
            let value = this.validateEntry(row, col);
            matrix[row][col] = value;
         }
      }

      return matrix;
   }

   validateEntry(row, column) {
      let entry = this.entry(row, column);
      let entryValue = this.cleanEntryValue(entry.value);
      entryValue = new Fraction(entryValue).toFraction();

      entry.value = entryValue;
      return entryValue;
   }

   cleanEntryValue(value) {
      value = value.replace(/\s+/g, '');
      value = value.replace(',', '.');

      if (value.length < 1 || value === "." || value === "-." || value === "-") {
         value = "0";
      }
      return value;
   }
   // -----------------------------------------------------------
   // Initialize Matrix Input Grid
   // -----------------------------------------------------------
   /**
    * Generates the initial entries for the input matrix. 
    */
   initMatrix() {
      const rows = this.rows();
      const columns = this.columns();

      for (let row = 0; row < rows; row++) {
         for (let col = 0; col < columns; col++) {
            this.matrix.appendChild(this.createMatrixEntry(row, col, this.ID));
         }
      }

      this.setMatrixGridRows(rows);
      this.setMatrixGridCols(columns);
   }

   /**
    * @param {string[][]}
    */
   initMatrixFromArray(matrixArray) {
      const rows = matrixArray.length;
      const columns = matrixArray[0].length;

      for (let row = 0; row < rows; row++) {
         for (let col = 0; col < columns; col++) {
            let entry = this.createMatrixEntry(row, col, this.ID);
            entry.value = matrixArray[row][col];
            this.matrix.appendChild(entry);
         }
      }

      this.row.input.value = rows;
      this.row.oldValue = rows;
      this.col.input.value = columns;
      this.col.oldValue = columns;

      this.setMatrixGridRows(rows);
      this.setMatrixGridCols(columns);
   }


   // -----------------------------------------------------------
   // Create Matrix Entry
   // -----------------------------------------------------------
   /**
    * Creates a text input for the entry of the matrix.
    * Adds an event listener for the focus event to each entry. Selects the input on focus. 
    * @param {number} row The row of the entry.
    * @param {number} column The column of the entry. 
    * @returns {HTMLElement} The text input that is the entry.
    */
   createMatrixEntry(row, column) {
      let entrySpace = document.createElement('input');
      entrySpace.type = 'text';

      entrySpace.classList.add("entry");
      entrySpace.classList.add(`${this.ID}_${row}_${column}`);

      entrySpace.addEventListener("focus", () => entrySpace.select());
      return entrySpace;
   }


   // -----------------------------------------------------------
   // Helper Functions
   // -----------------------------------------------------------
   /**
    * Sets grid-template-rows  and for the matrix entries grid. 
    * @param {number} rows 
    */
   setMatrixGridRows(rows) {
      this.matrix.style.setProperty('grid-template-rows', `repeat(${rows}, auto)`);
   }

   /**
    * Sets the grid-template-columns for the matrix entries grid.
    * @param {number} columns 
    */
   setMatrixGridCols(columns) {
      this.matrix.style.setProperty('grid-template-columns', `repeat(${columns}, auto)`);
   }


   // -----------------------------------------------------------
   // Getters
   // -----------------------------------------------------------
   /**
    * @returns {number} The number of rows the matrix has. 
    */
   rows() {
      return parseInt(this.row.validateInput());
   }

   /**
    * @returns {number} The number of columns the matrix has. 
    */
   columns() {
      return parseInt(this.col.validateInput());
   }

   /**
    * @returns {NodeList} The entries in the matrix. 
    */
   entries() {
      return this.matrix.childNodes;
   }

   /**
    * @throws Invalid Index if row and column out of bounds.
    * @param {number} row The row of the entry.
    * @param {number} column The column of the entry.
    * @returns {string} The value of the entry at 
    */
   entry(row, column) {
      const index = row * this.col.oldValue + column;

      if (index < 0 || index >= this.matrix.childNodes.length) {
         throw Error("Invalid Index");
      } else {
         return this.matrix.childNodes[index];
      }
   }
}

/**
 * Triggers the given event on the given element.
 * Adapted from https://plainjs.com/javascript/events/trigger-an-event-11/.
 * @param {HTMLElement} element The element to trigger the event on. 
 * @param {string} eventType The type of event to trigger.
 */
function triggerEvent(element, eventType) {
   if ('createEvent' in document) {
      // modern browsers, IE9+
      var e = document.createEvent('HTMLEvents');
      e.initEvent(eventType, false, true);
      element.dispatchEvent(e);
   } else {
      // IE 8
      var e = document.createEventObject();
      e.eventType = eventType;
      element.fireEvent('on' + e.eventType, e);
   }
}