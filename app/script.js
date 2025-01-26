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
    const dodajProizvodForm = document.getElementById('dodaj-proizvod-form');
    const dodajKupcaForm = document.getElementById('dodaj-kupca-form');
    const loginForm = document.getElementById('login-form');
    const kupacView = document.getElementById('kupac-view');
    const zaposlenikView = document.getElementById('zaposlenik-view');
    const adminView = document.getElementById('admin-view');
    const loginView = document.getElementById('login-view');
    const loginButton = document.getElementById('login-button');
    const sortBySelect = document.getElementById('sort-by');
  
    let currentRacunId = null;
    let proizvodi = [];
  
    // Show kupac view initially
    kupacView.style.display = 'block';
  
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
        renderTable(data, route);
      } catch (error) {
        console.error(error);
        tableContainer.innerHTML = `<p>Error loading data: ${error.message}</p>`;
      }
    }
  
    function renderTable(data, route) {
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
  
        if (route === 'pregled_racuna') {
          tr.addEventListener('click', () => fetchRacunDetalji(row.racun_id || row.id));
        }
  
        tbody.appendChild(tr);
      });
  
      table.appendChild(tbody);
      tableContainer.innerHTML = '';
      tableContainer.appendChild(table);
    }
  
    async function fetchRacunDetalji(racunId) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/racun_detalji_full/${racunId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch racun details');
        }
  
        const data = await response.json();
        if (data.success) {
          renderReceiptPopup(data.racun);
        } else {
          alert(`Error: ${data.error}`);
        }
      } catch (error) {
        console.error(error);
        alert('Error fetching racun details.');
      }
    }
  
    function renderReceiptPopup(racunDetails) {
      if (!racunDetails.length) {
        alert('No details available for this racun.');
        return;
      }
  
      const racunInfo = racunDetails[0]; // Assuming the first entry contains general racun info
      const stavkeList = racunDetails.map(stavka => `
        <tr>
          <td>${stavka.proizvod_naziv || '-'}</td>
          <td>${stavka.kolicina || '-'}</td>
          <td>${stavka.cijena || '-'}</td>
          <td>${stavka.popust || '-'}</td>
          <td>${stavka.nakon_popusta || '-'}</td>
        </tr>
      `).join('');
  
      const popupContent = `
        <h2>Račun ID: ${racunInfo.racun_id}</h2>
        <p>Datum: ${new Date(racunInfo.datum).toLocaleString()}</p>
        <p>Kupac: ${racunInfo.kupac_ime}</p>
        <p>Zaposlenik: ${racunInfo.zaposlenik_ime}</p>
        <table class="receipt-table">
          <thead>
            <tr>
              <th>Proizvod</th>
              <th>Količina</th>
              <th>Cijena</th>
              <th>Popust</th>
              <th>Nakon Popusta</th>
            </tr>
          </thead>
          <tbody>
            ${stavkeList}
          </tbody>
        </table>
        <table class="total-table" style="margin-top: 10px;">
          <tr>
            <td><strong>Ukupno:</strong></td>
            <td>${racunInfo.ukupan_iznos || '-'}</td>
          </tr>
        </table>
        <button class="close-popup" id="close-popup">Zatvori</button>
      `;
  
      popup.innerHTML = popupContent;
      popup.style.display = 'flex';
  
      document.getElementById('close-popup').addEventListener('click', () => {
        popup.style.display = 'none';
      });
    }
  
    // Handle Novi Račun form submission
    noviRacunForm.addEventListener('submit', async (e) => {
        e.preventDefault();
      
        let kupacId = document.getElementById('kupac-id').value;
        const zaposlenikId = document.getElementById('zaposlenik-id').value;
        const nacinPlacanja = document.getElementById('nacin-placanja').value;
      
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
  
    // Handle Dodaj Proizvod form submission
    dodajProizvodForm.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const naziv = document.getElementById('naziv').value;
      const nabavnaCijena = document.getElementById('nabavna-cijena').value;
      const prodajnaCijena = document.getElementById('prodajna-cijena').value;
      const kategorijaId = document.getElementById('kategorija-id').value;
  
      try {
        const response = await fetch('http://127.0.0.1:5000/dodaj_proizvod', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ naziv, nabavna_cijena: nabavnaCijena, prodajna_cijena: prodajnaCijena, kategorija_id: kategorijaId }),
        });
  
        const data = await response.json();
        if (data.success) {
          alert('Proizvod uspješno dodan!');
          dodajProizvodForm.reset();
        } else {
          alert(`Greška: ${data.error}`);
        }
      } catch (error) {
        console.error(error);
        alert('Greška pri dodavanju proizvoda.');
      }
    });
  
    // Handle Dodaj Kupca form submission
    dodajKupcaForm.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const ime = document.getElementById('ime').value;
      const prezime = document.getElementById('prezime').value;
      const spol = document.getElementById('spol').value;
      const adresa = document.getElementById('adresa').value;
      const email = document.getElementById('email').value;
      const tip = document.getElementById('tip').value;
      const oibFirme = document.getElementById('oib-firme').value || null;
  
      try {
        const response = await fetch('http://127.0.0.1:5000/dodaj_kupca', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ime, prezime, spol, adresa, email, tip, oib_firme: oibFirme }),
        });
  
        const data = await response.json();
        if (data.success) {
          alert('Kupac uspješno dodan!');
          dodajKupcaForm.reset();
        } else {
          alert(`Greška: ${data.error}`);
        }
      } catch (error) {
        console.error(error);
        alert('Greška pri dodavanju kupca.');
      }
    });
  
    // Close popup
    closePopup.addEventListener('click', () => {
      popup.style.display = 'none';
    });
  
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = document.getElementById('user-id').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://127.0.0.1:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, password }),
            });

            const data = await response.json();
            if (data.success) {
                loginView.style.display = 'none';
                loginButton.textContent = 'Logout';
                loginButton.onclick = logout;
                if (data.role === 'admin' || data.role === 'zaposlenik') {
                    document.getElementById('restricted-view').style.display = 'block';
                }
                if (data.role === 'admin') {
                    adminView.style.display = 'block';
                } else if (data.role === 'zaposlenik') {
                    zaposlenikView.style.display = 'block';
                }
            } else {
                alert('Invalid credentials');
            }
        } catch (error) {
            console.error(error);
            alert('Error during login');
        }
    });

    function logout() {
        loginButton.textContent = 'Login';
        loginButton.onclick = showLogin;
        adminView.style.display = 'none';
        zaposlenikView.style.display = 'none';
        document.getElementById('restricted-view').style.display = 'none';
        kupacView.style.display = 'block';
    }

    // Fetch and display odjeli, kategorije, and proizvodi
    async function fetchAndDisplayOdjeliKategorijeProizvodi() {
      try {
        const response = await fetch('http://127.0.0.1:5000/odjeli_kategorije_proizvodi');
        if (!response.ok) {
          throw new Error('Failed to fetch odjeli, kategorije, and proizvodi');
        }

        const data = await response.json();
        proizvodi = data.proizvodi;
        renderOdjeliKategorije(data.odjeliKategorije);
        renderProizvodi(proizvodi);
      } catch (error) {
        console.error(error);
      }
    }

    function renderOdjeliKategorije(odjeliKategorije) {
      const list = document.getElementById('odjeli-kategorije-list');
      list.innerHTML = '';
      odjeliKategorije.forEach((item) => {
        const odjelLi = document.createElement('li');
        odjelLi.textContent = item.odjel;
        odjelLi.classList.add('clickable');
        odjelLi.addEventListener('click', () => filterProizvodi('odjel', item.odjel));
        list.appendChild(odjelLi);

        const kategorijaUl = document.createElement('ul');
        item.kategorije.forEach((kategorija) => {
          const kategorijaLi = document.createElement('li');
          kategorijaLi.textContent = kategorija;
          kategorijaLi.classList.add('clickable');
          kategorijaLi.addEventListener('click', () => filterProizvodi('kategorija', kategorija));
          kategorijaUl.appendChild(kategorijaLi);
        });
        list.appendChild(kategorijaUl);
      });
    }

    function filterProizvodi(type, value) {
      const filteredProizvodi = proizvodi.filter((proizvod) => proizvod[type] === value);
      renderProizvodi(filteredProizvodi);
    }

    function renderProizvodi(proizvodiData) {
      const grid = document.getElementById('proizvodi-grid');
      grid.innerHTML = '';
      proizvodiData.forEach((proizvod) => {
        const div = document.createElement('div');
        div.classList.add('product-box');
        div.innerHTML = `
          <img src="assets/pic.jpg" alt="${proizvod.naziv}" />
          <h4>${proizvod.naziv}</h4>
          <p>Nabavna Cijena: ${proizvod.nabavna_cijena}</p>
          <p>Prodajna Cijena: ${proizvod.prodajna_cijena}</p>
          <p>Kategorija: ${proizvod.kategorija}</p>
          <p>Odjel: ${proizvod.odjel}</p>
        `;
        grid.appendChild(div);
      });
    }

    sortBySelect.addEventListener('change', () => {
      const sortOrder = sortBySelect.value;
      sortProizvodi(sortOrder);
    });

    function sortProizvodi(order) {
      const sortedProizvodi = [...proizvodi].sort((a, b) => {
        const priceA = parseFloat(a.prodajna_cijena);
        const priceB = parseFloat(b.prodajna_cijena);
        return order === 'asc' ? priceA - priceB : priceB - priceA;
      });
      renderProizvodi(sortedProizvodi);
    }

    // Call the function to fetch and display data
    fetchAndDisplayOdjeliKategorijeProizvodi();
  });
  
  function showLogin() {
    document.getElementById('kupac-view').style.display = 'none';
    document.getElementById('login-view').style.display = 'block';
  }
  
