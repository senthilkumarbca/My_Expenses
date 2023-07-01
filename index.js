document.addEventListener("DOMContentLoaded", () => {
    const dbRequest = indexedDB.open("ExpenseDB", 1);
    let db;
  
    dbRequest.onerror = function (event) {
      console.error("Database error: " + event.target.errorCode);
    };
  
    dbRequest.onupgradeneeded = function (event) {
      db = event.target.result;
      const objectStore = db.createObjectStore("expenses", { keyPath: "id", autoIncrement: true });
      objectStore.createIndex("date", "date");
    };
  
    dbRequest.onsuccess = function (event) {
      db = event.target.result;
  
      const addExpenseBtn = document.getElementById("addExpense");
      addExpenseBtn.addEventListener("click", addExpense);
  
      const dateFilter = document.getElementById("dateFilter");
      dateFilter.addEventListener("change", filterExpenses);
  
      displayExpenses();
    };
  
    function addExpense() {
      const dateInput = document.getElementById("date");
      const textInput = document.getElementById("text");
      const amountInput = document.getElementById("amount");
  
      const expense = {
        date: dateInput.value,
        text: textInput.value,
        amount: parseFloat(amountInput.value),
      };
  
      const transaction = db.transaction(["expenses"], "readwrite");
      const objectStore = transaction.objectStore("expenses");
      const request = objectStore.add(expense);
  
      request.onsuccess = function (event) {
        dateInput.value = "";
        textInput.value = "";
        amountInput.value = "";
        displayExpenses();
      };
  
      request.onerror = function (event) {
        console.error("Error adding expense to database: " + event.target.errorCode);
      };
    }
  
    function displayExpenses() {
      const expenseList = document.getElementById("expenseList");
      expenseList.innerHTML = "";
  
      const objectStore = db.transaction("expenses").objectStore("expenses");
      const request = objectStore.openCursor();
  
      let totalAmount = 0;
      let currentDate = null;
      let currentListItem = null;
  
      request.onsuccess = function (event) {
        const cursor = event.target.result;
  
        if (cursor) {
          const expense = cursor.value;
  
          if (currentDate !== expense.date) {
            if (currentListItem) {
              currentListItem.innerHTML += ` (Total: ${totalAmount.toFixed(2)})`;
              expenseList.appendChild(currentListItem);
            }
  
            currentDate = expense.date;
            currentListItem = document.createElement("li");
            currentListItem.textContent = currentDate;
            totalAmount = 0;
          }
  
          const expenseText = `${expense.text} - ${expense.amount.toFixed(2)}`;
          const expenseItem = document.createElement("div");
          expenseItem.textContent = expenseText;
          currentListItem.appendChild(expenseItem);
  
          totalAmount += expense.amount;
  
          cursor.continue();
        } else {
          if (currentListItem) {
            currentListItem.innerHTML += ` (Total: ${totalAmount.toFixed(2)})`;
            expenseList.appendChild(currentListItem);
          }
        }
      };
    }
  
    function filterExpenses() {
      const dateFilter = document.getElementById("dateFilter").value;
  
      const expenseList = document.getElementById("expenseList");
      expenseList.innerHTML = "";
  
      const objectStore = db.transaction("expenses").objectStore("expenses");
      const index = objectStore.index("date");
      const request = index.openCursor(IDBKeyRange.only(dateFilter));
  
      let totalAmount = 0;
      let currentListItem = null;
  
      request.onsuccess = function (event) {
        const cursor = event.target.result;
  
        if (cursor) {
          const expense = cursor.value;
  
          if (!currentListItem) {
            currentListItem = document.createElement("li");
            currentListItem.textContent = `Expenses for ${dateFilter}`;
            expenseList.appendChild(currentListItem);
          }
  
          const expenseText = `${expense.text} - ${expense.amount.toFixed(2)}`;
          const expenseItem = document.createElement("div");
          expenseItem.textContent = expenseText;
          currentListItem.appendChild(expenseItem);
  
          totalAmount += expense.amount;
  
          cursor.continue();
        } else {
          if (currentListItem) {
            currentListItem.innerHTML += ` (Total: ${totalAmount.toFixed(2)})`;
          }
        }
      };
    }
  });
  