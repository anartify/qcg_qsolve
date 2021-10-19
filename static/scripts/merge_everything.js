class Matrix {

   constructor(rows, columns, inputMatrix) {
      this.rows = rows;
      this.columns = columns;
      /** @type {Fraction[][]} */
      this.array = this.toFraction(inputMatrix);
      this.DEBUG = false;
   }

   toFraction(array) {
      let fracArray = [];
      for (let i = 0; i < array.length; i++) {
         fracArray[i] = [];
         for (let j = 0; j < array[0].length; j++) {
            fracArray[i][j] = new Fraction(array[i][j]);
         }
      }
      return fracArray;
   }

   toString() {
      let strArray = [];
      for (let i = 0; i < this.rows; i++) {
         strArray[i] = [];
         for (let j = 0; j < this.columns; j++) {
            strArray[i][j] = this.array[i][j].toFraction();
         }
      }
      return strArray;
   }
}
class QSolveCalculator {
   /**
    * Finds all the html elements the calculator depends on. 
    * Adds event listeners to the proper html elements. 
    * Sets matrix inputs and matrix selects.
    * @throws Null pointer error, if it any of its this fields are null.
    */
   constructor() {
      this.matrixInputs = this.initMatrixInputs();
      this.matrices = [];

      this.input = document.getElementById("input");
      this.display = document.getElementById("display");

      this.qsolve = document.querySelector("#qsolve button");

      // check for null elements
      for (let field in this) {
         if (this[field] === null) {
            throw Error("Error: element " + field + " is null");
         }
      }

      this.qsolve.addEventListener('click', () => this.handleQSolve());
   }


   // ---------------------------------------------------------------------------
   // Setup
   // ---------------------------------------------------------------------------

   /**
    * @returns Creates objects of MatrixInput for each matrixInput html element.
    */
   initMatrixInputs() {
      const matrixInputs = [];
      document.querySelectorAll(".matrix-input").forEach(matrixInput => matrixInputs.push(new MatrixInput(matrixInput.id)));
      return matrixInputs;
   }


   // ---------------------------------------------------------------------------
   // Display
   // ---------------------------------------------------------------------------

   displayResults(stmt) {
      this.display.innerHTML = "<div class='res_hdr'>Result</div><div class='res_box'>" + stmt + "</div>";
   }


   // ---------------------------------------------------------------------------
   // Fetching Results From Qsolve API
   // ---------------------------------------------------------------------------

   handleQSolve() {
      const matrices = this.getMatrices(0, 1);
      if (matrices !== null) {
         try {
            let A = "[";
            for (let i = 0; i < matrices[0].rows; i++) {
               A += "[" + matrices[0].array[i] + "]";
               if (i < matrices[0].rows - 1)
                  A += ",";
               else
                  A += ']';
            }

            let b = "[";
            for (let i = 0; i < matrices[1].rows; i++) {
               b += "[" + matrices[1].array[i] + "]";
               if (i < matrices[1].rows - 1)
                  b += ",";
               else
                  b += ']';
            }
            let stmt; let Globalthis = this;
            const api_url = "/api/q?A=" + A + "&b=" + b;
            fetch(api_url)
               .then(response => response.json())
               .then(function (data) {
                  stmt = data.results;
                  Globalthis.displayResults(stmt);
               });

         } catch (error) {
            this.displayResults("Kindly make sure values entered in Matrix is either an integer, decimal or fractional");
         }
      }
   }


   // ---------------------------------------------------------------------------
   // Get Input
   // ---------------------------------------------------------------------------

   getMatrixFromInput(index) {
      const array = this.matrixInputs[index].toArray();
      return new Matrix(array.length, array[0].length, array);
   }

   /**
    * Alerts the user if any of the specified matrix inputs have invalid values.
    * @returns {Matrix[]|Matrix|null} If possible returns new matrices from the specified matrix inputs, otherwise returns null. 
    */
   getMatrices(...indices) {
      try {
         const matrices = [];
         indices.forEach((matrixIndex, i) => matrices[i] = this.getMatrixFromInput(matrixIndex));

         if (matrices.length === 1) {
            return matrices[0];
         } else {
            return matrices;
         }
      } catch (error) {
         this.displayResults("Kindly make sure values entered in Matrix is either an integer, decimal or fractional");
         return null;
      }
   }
}

const matrixOps = new QSolveCalculator();