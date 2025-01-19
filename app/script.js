document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.data-fetch-button'); // Buttons to fetch data
    const tableContainer = document.getElementById('table-container'); // Where the table will be displayed
  
    buttons.forEach(button => {
      button.addEventListener('click', async () => {
        const route = button.id; // Use the button's id as the route name
        await fetchAndDisplayData(route);
      });
    });
  
    async function fetchAndDisplayData(route) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/${route}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch data from /${route}`);
        }
  
        const data = await response.json();
        renderTable(data);
      } catch (error) {
        console.error(error);
        tableContainer.innerHTML = `<p>Error loading data: ${error.message}</p>`;
      }
    }
  
    function renderTable(data) {
      if (!data.length) {
        tableContainer.innerHTML = `<p>No data available for this table.</p>`;
        return;
      }
  
      const table = document.createElement('table');
      table.classList.add('data-table');
  
      // Create table header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      Object.keys(data[0]).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
  
      // Create table body
      const tbody = document.createElement('tbody');
      data.forEach(row => {
        const tr = document.createElement('tr');
        Object.values(row).forEach(value => {
          const td = document.createElement('td');
          td.textContent = value;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
  
      // Clear previous table and append the new one
      tableContainer.innerHTML = '';
      tableContainer.appendChild(table);
    }
  });
  