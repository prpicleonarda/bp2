document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.data-fetch-button');
    const tableContainer = document.getElementById('table-container');
    const noviRacunContainer = document.getElementById('novi-racun-container');
    const noviRacunForm = document.getElementById('novi-racun-form');
    const popup = document.getElementById('popup');
    const closePopup = document.getElementById('close-popup');
    const dodajStavkeForm = document.getElementById('dodaj-stavke-form');
    const stavkeContainer = document.getElementById('stavke-container');
    const addStavkaButton = document.getElementById('add-stavka');
  
    let currentRacunId = null;
  
    // Fetch and display data for routes
    buttons.forEach((button) => {
      button.addEventListener('click', async () => {
        const route = button.id;
  
        if (route === 'pregled_racuna') {
          noviRacunContainer.classList.add('active');
        } else {
          noviRacunContainer.classList.remove('active');
        }
  
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
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
  
      Object.keys(data[0]).forEach((key) => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
  
      const tbody = document.createElement('tbody');
      data.forEach((row) => {
        const tr = document.createElement('tr');
        Object.values(row).forEach((value) => {
          const td = document.createElement('td');
          td.textContent = value;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
  
      table.appendChild(tbody);
      tableContainer.innerHTML = '';
      tableContainer.appendChild(table);
    }
  
    // Handle Novi Račun form submission
    noviRacunForm.addEventListener('submit', async (e) => {
        e.preventDefault();
      
        // Get the values from the form
        let kupacId = document.getElementById('kupac-id').value;
        const zaposlenikId = document.getElementById('zaposlenik-id').value;
        const nacinPlacanja = document.getElementById('nacin-placanja').value;
      
        // If Kupac ID is empty, set it to null
        if (kupacId === '') {
          kupacId = null;
        }
      
        try {
          const response = await fetch('http://127.0.0.1:5000/novi_racun', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kupac_id: kupacId, zaposlenik_id: zaposlenikId, nacin_placanja: nacinPlacanja }),
          });
      
          const data = await response.json();
          if (data.success) {
            currentRacunId = data.racun_id;
            alert(`Račun kreiran s ID: ${currentRacunId}`);
            popup.style.display = 'flex';
          } else {
            alert(`Greška: ${data.error}`);
          }
        } catch (error) {
          console.error(error);
          alert('Greška pri kreiranju računa.');
        }
      });
      
  
    // Add items dynamically
    addStavkaButton.addEventListener('click', () => {
      const stavkaDiv = document.createElement('div');
      stavkaDiv.classList.add('stavka');
      stavkaDiv.innerHTML = `
        <label>Proizvod ID:</label>
        <input type="number" class="proizvod-id" required />
        <label>Količina:</label>
        <input type="number" class="kolicina" required />
      `;
      stavkeContainer.appendChild(stavkaDiv);
    });
  
    // Submit items
    dodajStavkeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const stavke = Array.from(stavkeContainer.querySelectorAll('.stavka')).map((stavka) => ({
        proizvod_id: stavka.querySelector('.proizvod-id').value,
        kolicina: stavka.querySelector('.kolicina').value,
      }));
  
      try {
        const response = await fetch('http://127.0.0.1:5000/dodaj_stavke', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ racun_id: currentRacunId, stavke }),
        });
  
        const data = await response.json();
        if (data.success) {
          alert('Stavke uspješno dodane!');
          popup.style.display = 'none';
          dodajStavkeForm.reset();
          stavkeContainer.innerHTML = '';
        } else {
          alert(`Greška: ${data.error}`);
        }
      } catch (error) {
        console.error(error);
        alert('Greška pri dodavanju stavki.');
      }
    });
  
    // Close popup
    closePopup.addEventListener('click', () => {
      popup.style.display = 'none';
    });
  });
  