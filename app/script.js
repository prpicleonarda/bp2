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
    const locationSelect = document.getElementById('location-select');
    const proizvodiContainer = document.getElementById('proizvodi-na-lokacijama-container');
    const ukupnaKolicinaContainer = document.getElementById('ukupna-kolicina-proizvoda-container');
    const dodajNabavuButton = document.getElementById('dodaj-nabavu-button');
  
    let currentRacunId = null;
    let proizvodi = [];
  
    // Show kupac view initially
    kupacView.style.display = 'block';
  
    // Hide the buttons initially 
    dodajNabavuButton.style.display = 'none';
  
    // Fetch and display data for routes
    buttons.forEach((button) => {
      button.addEventListener('click', async () => {
        const route = button.id;
  
        // Hide the location select dropdown initially
        locationSelect.style.display = 'none'; // Hide the dropdown by default
  
        if (route === 'pregled_racuna') {
          noviRacunContainer.classList.add('active');
        } else {
          noviRacunContainer.classList.remove('active');
        }
  
        // Show the products container only if the "Proizvodi" button is clicked
        if (route === 'pregled_proizvoda') {
          proizvodiContainer.style.display = 'block'; // Show the products container
          locationSelect.style.display = 'block'; // Show the dropdown for location selection
          
          // Show the tables for najprodavaniji proizvodi and najbolja zarada
          document.querySelector('.tables-container').style.display = 'flex'; // Show the tables container

          // Show the "Dodaj Proizvod" button
          document.getElementById('dodaj-proizvod-button').style.display = 'block';

          // Fetch and display data
        await fetchAndDisplayData(route);
          fetchNajprodavanijiProizvodi(); // Fetch best-selling products
          fetchNajboljaZarada(); // Fetch best profit products
        } else {
          proizvodiContainer.style.display = 'none'; // Hide the products container
          document.querySelector('.tables-container').style.display = 'none'; // Hide the tables container
          document.getElementById('dodaj-proizvod-button').style.display = 'none'; // Hide the "Dodaj Proizvod" button
          await fetchAndDisplayData(route);
        }

        // Hide the buttons by default
        dodajNabavuButton.style.display = 'none';

        // Show the products container only if the "Proizvodi" button is clicked
        if (route === 'pregled_narudzba') {
            fetchNarudzbe(); // Fetch and display Narudžbe
        } else if (route === 'pregled_nabava') {
            fetchNabava(); // Fetch and display Nabava
            dodajNabavuButton.style.display = 'block'; // Show the "Dodaj Nabavu" button
        } else {
            // Hide the forms and buttons for other sections
            dodajNabavuButton.style.display = 'none';
            document.getElementById('dodaj-nabavu-container').style.display = 'none';
        }
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
      // Add an empty header for the "Ponisti" button
      const actionTh = document.createElement('th');
      actionTh.textContent = ''; // Empty header
      headerRow.appendChild(actionTh);
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
          
          // Add a "Ponisti" button
          const actionTd = document.createElement('td');
          const ponistiButton = document.createElement('button');
          ponistiButton.textContent = 'Ponisti';
          ponistiButton.style.backgroundColor = '#f44336'; // Red color
          ponistiButton.style.color = 'white';
          ponistiButton.style.border = 'none';
          ponistiButton.style.padding = '5px 10px';
          ponistiButton.style.borderRadius = '5px';
          ponistiButton.style.cursor = 'pointer';
          ponistiButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering the row click event
            const adminPassword = prompt('Unesite admin lozinku za poništavanje računa:');
            if (adminPassword) {
              ponistiRacun(row.racun_id || row.id, adminPassword);
            }
          });
          actionTd.appendChild(ponistiButton);
          tr.appendChild(actionTd);
        }
  
        tbody.appendChild(tr);
      });
  
      table.appendChild(tbody);
      tableContainer.innerHTML = '';
      tableContainer.appendChild(table);
    }
  
    async function fetchRacunDetalji(racunId) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/racun_detalji/${racunId}`);
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
          <td>${stavka.cijena + ' €' || '-'}</td>
          <td>${stavka.popust || '-'}</td>
          <td>${stavka.nakon_popusta + ' €' || '-'}</td>
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
            <td>${racunInfo.ukupan_iznos + ' €' || '-'}</td>
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
            // Show the popup for adding stavke
            popup.innerHTML = `
              <h2>Dodaj Stavke za Račun ID: ${currentRacunId}</h2>
              <form id="dodaj-stavke-form">
                <div id="stavke-container">
                  <div class="stavka">
                    <label>Proizvod ID:</label>
                    <input type="number" class="proizvod-id" required min="1" />
                    <label>Količina:</label>
                    <input type="number" class="kolicina" required min="1" />
                  </div>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                  <button type="button" id="add-stavka">Dodaj Još</button>
                  <button type="submit">Pošalji Stavke</button>
                </div>
              </form>
              <button class="close-popup" id="close-popup">Zatvori</button>
            `;
            popup.style.display = 'flex';

            // Attach event listeners after the form is created
            document.getElementById('close-popup').addEventListener('click', () => {
              popup.style.display = 'none';
            });

            document.getElementById('add-stavka').addEventListener('click', () => {
              const stavkeContainer = document.getElementById('stavke-container');
              const stavkaDiv = document.createElement('div');
              stavkaDiv.classList.add('stavka');
              stavkaDiv.innerHTML = `
                <label>Proizvod ID:</label>
                <input type="number" class="proizvod-id" required min="1" />
                <label>Količina:</label>
                <input type="number" class="kolicina" required min="1" />
              `;
              stavkeContainer.appendChild(stavkaDiv);
            });

            document.getElementById('dodaj-stavke-form').addEventListener('submit', async (e) => {
              e.preventDefault();
              
              const stavke = Array.from(document.querySelectorAll('#stavke-container .stavka')).map((stavka) => ({
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
                  document.getElementById('dodaj-stavke-form').reset();
                  document.getElementById('stavke-container').innerHTML = '';
                  // Reload the "račun" table
                  await fetchAndDisplayData('pregled_racuna');
                } else {
                  alert(`Greška: ${data.error}`);
                }
              } catch (error) {
                console.error(error);
                alert('Greška pri dodavanju stavki.');
              }
            });
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
  
    // Show the "Dodaj Proizvod" form when the button is clicked
    document.getElementById('dodaj-proizvod-button').addEventListener('click', () => {
        document.getElementById('dodaj-proizvod-container').style.display = 'block';
    });

    // Handle the form submission
    document.getElementById('dodaj-proizvod-form').addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission
  
      const naziv = document.getElementById('naziv').value;
      const nabavnaCijena = document.getElementById('nabavna-cijena').value;
      const prodajnaCijena = document.getElementById('prodajna-cijena').value;
      const kategorijaId = document.getElementById('kategorija-id').value;
  
        // Send the data to the server
      try {
        const response = await fetch('http://127.0.0.1:5000/dodaj_proizvod', {
          method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    naziv,
                    n_cijena: nabavnaCijena,
                    p_cijena: prodajnaCijena,
                    kategorija_id: kategorijaId,
                }),
            });

            const result = await response.json();
            if (result.success) {
                alert('Proizvod je uspješno dodan!');
                // Optionally, you can reset the form or hide it
                document.getElementById('dodaj-proizvod-form').reset();
                document.getElementById('dodaj-proizvod-container').style.display = 'none';
        } else {
                alert('Greška: ' + result.error);
        }
      } catch (error) {
            console.error('Error adding product:', error);
        alert('Greška pri dodavanju proizvoda.');
      }
    });
  
    // Show or hide OIB field based on the selected tip
    document.getElementById('tip').addEventListener('change', (e) => {
        // Check if oibContainer exists before trying to access it
        const oibContainer = document.getElementById('oib-container');
        if (oibContainer) {
            if (e.target.value === 'poslovni') {
                oibContainer.style.display = 'block';
                document.getElementById('oib-firme').setAttribute('required', 'required'); // Make OIB required
            } else if (e.target.value === 'privatni') {
                oibContainer.style.display = 'none';
                document.getElementById('oib-firme').removeAttribute('required'); // Remove required attribute
            }
        }
    });
    // Fetch Kupac Data button
    document.getElementById('kupaci').addEventListener('click', async () => {
        // Show the add kupac form
        document.getElementById('dodaj-kupca-container').style.display = 'block';

        // Show the data containers for kupci
        document.getElementById('najcesci-kupci-container').style.display = 'block';
        document.getElementById('najbolji-kupci-container').style.display = 'block';

        // Hide other data containers
        document.getElementById('dodaj-zaposlenika-container').style.display = 'none'; // Hide add zaposlenik form
        document.getElementById('najbolji-zaposlenik-racuni-container').style.display = 'none'; // Hide zaposlenik data
        document.getElementById('najbolji-zaposlenik-zarada-container').style.display = 'none'; // Hide zaposlenik data

        try {
            const response = await fetch('http://127.0.0.1:5000/kupaci');
            const data = await response.json();
            renderKupacTable(data);

            // Fetch data from views
            const najcesciResponse = await fetch('http://127.0.0.1:5000/najcesci_kupci');
            const najcesciData = await najcesciResponse.json();
            renderNajcesciKupci(najcesciData);

            const najboljiResponse = await fetch('http://127.0.0.1:5000/najbolji_kupci');
            const najboljiData = await najboljiResponse.json();
            renderNajboljiKupci(najboljiData);
        } catch (error) {
            console.error(error);
            alert('Greška pri učitavanju podataka o kupcima.');
        }
    });

    function renderNajcesciKupci(data) {
        const najcesciContainer = document.getElementById('najcesci-kupci-container');
        // Clear previous data but keep the title
        const contentContainer = document.createElement('div');
        data.forEach((kupac) => {
            const div = document.createElement('div');
            div.textContent = `${kupac.kupac} - Broj Računa: ${kupac.broj_racuna}`;
            contentContainer.appendChild(div);
        });
        najcesciContainer.innerHTML = ''; // Clear previous content
        najcesciContainer.appendChild(contentContainer); // Append new content
    }

    function renderNajboljiKupci(data) {
        const najboljiContainer = document.getElementById('najbolji-kupci-container');
        // Clear previous data but keep the title
        const contentContainer = document.createElement('div');
        data.forEach((kupac) => {
            const div = document.createElement('div');
            div.textContent = `${kupac.kupac} - Ukupan Iznos: ${kupac.ukupan_iznos}`;
            contentContainer.appendChild(div);
        });
        najboljiContainer.innerHTML = ''; // Clear previous content
        najboljiContainer.appendChild(contentContainer); // Append new content
    }

    // Hide the add kupac form and data containers when other buttons are clicked
    const otherButtons = ['klub', 'lokacija', 'pregled_proizvoda', 'pregled_racuna', 'zaposlenici', 'pregled_narudzba', 'pregled_nabava', 'evidencija'];
    otherButtons.forEach(buttonId => {
        document.getElementById(buttonId).addEventListener('click', () => {
            document.getElementById('dodaj-kupca-container').style.display = 'none';
            document.getElementById('najcesci-kupci-container').style.display = 'none';
            document.getElementById('najbolji-kupci-container').style.display = 'none';
            document.getElementById('dodaj-zaposlenika-container').style.display = 'none';
            document.getElementById('najbolji-zaposlenik-racuni-container').style.display = 'none';
            document.getElementById('najbolji-zaposlenik-zarada-container').style.display = 'none';
        });
    });

    // Handle Dodaj Kupca form submission
    document.getElementById('dodaj-kupca-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const ime = document.getElementById('ime').value;
        const prezime = document.getElementById('prezime').value;
        const spol = document.getElementById('spol').value;
        const adresa = document.getElementById('adresa').value;
        const email = document.getElementById('email').value;
        const tip = document.getElementById('tip').value;
        const oibFirme = document.getElementById('oib-firme').value || null;

        // Disable the submit button to prevent multiple submissions
        const submitButton = document.querySelector('#dodaj-kupca-form button[type="submit"]');
        submitButton.disabled = true;

        try {
            const response = await fetch('http://127.0.0.1:5000/dodaj_kupca', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ime, prezime, spol, adresa, email, tip, oib_firme: oibFirme }),
            });

            const data = await response.json();
            if (data.success) {
                alert('Kupac uspješno dodan!');
                document.getElementById('dodaj-kupca-form').reset();
                // Optionally, refresh the kupac table
                const kupacResponse = await fetch('http://127.0.0.1:5000/kupaci');
                const kupacData = await kupacResponse.json();
                renderKupacTable(kupacData);
            } else {
                alert(`Greška: ${data.error}`);
            }
        } catch (error) {
            console.error(error);
            alert('Greška pri dodavanju kupca.');
        } finally {
            // Re-enable the submit button after the operation is complete
            submitButton.disabled = false;
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

    async function ponistiRacun(racunId, adminPassword) {
      try {
        const response = await fetch('http://127.0.0.1:5000/ponisti_racun', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ racun_id: racunId, admin_password: adminPassword }),
        });

        const data = await response.json();
        if (data.success) {
          alert('Račun uspješno poništen!');
          await fetchAndDisplayData('pregled_racuna');
        } else {
          alert(`Greška: ${data.error}`);
        }
      } catch (error) {
        console.error(error);
        alert('Greška pri poništavanju računa.');
      }
    }

    function renderKupacTable(data) {
        if (!data.length) {
            tableContainer.innerHTML = `<p>No data available for kupci.</p>`;
            return;
        }

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        // Create headers based on the keys of the first object
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
        tableContainer.innerHTML = ''; // Clear previous content
        tableContainer.appendChild(table); // Append new table
    }

    // Fetch Zaposlenici Data button
    document.getElementById('zaposlenici').addEventListener('click', async () => {
        // Show the add zaposlenik form
        document.getElementById('dodaj-zaposlenika-container').style.display = 'block';

        // Show the data containers for zaposlenici
        document.getElementById('najbolji-zaposlenik-racuni-container').style.display = 'block';
        document.getElementById('najbolji-zaposlenik-zarada-container').style.display = 'block';

        // Hide other data containers
        document.getElementById('dodaj-kupca-container').style.display = 'none'; // Hide add kupac form
        document.getElementById('najcesci-kupci-container').style.display = 'none'; // Hide kupac data
        document.getElementById('najbolji-kupci-container').style.display = 'none'; // Hide kupac data

        try {
            // Fetch data for najbolji zaposlenik
            const najboljiZaposlenikRacuniResponse = await fetch('http://127.0.0.1:5000/najbolji_zaposlenik_racuni');
            const najboljiZaposlenikRacuniData = await najboljiZaposlenikRacuniResponse.json();
            renderNajboljiZaposlenikRacuni(najboljiZaposlenikRacuniData);

            const najboljiZaposlenikZaradaResponse = await fetch('http://127.0.0.1:5000/najbolji_zaposlenik_zarada');
            const najboljiZaposlenikZaradaData = await najboljiZaposlenikZaradaResponse.json();
            renderNajboljiZaposlenikZarada(najboljiZaposlenikZaradaData);
        } catch (error) {
            console.error(error);
            alert('Greška pri učitavanju podataka o zaposlenicima.');
        }
    });

    function renderNajboljiZaposlenikRacuni(data) {
        const najboljiContainer = document.getElementById('najbolji-zaposlenik-racuni-container');
        // Clear previous data but keep the title
        const contentContainer = document.createElement('div');
        data.forEach((zaposlenik) => {
            const div = document.createElement('div');
            div.textContent = `${zaposlenik.zaposlenik} - Broj Računa: ${zaposlenik.broj_racuna}`;
            contentContainer.appendChild(div);
        });
        najboljiContainer.innerHTML = ''; // Clear previous content
        najboljiContainer.appendChild(contentContainer); // Append new content
    }

    function renderNajboljiZaposlenikZarada(data) {
        const najboljiContainer = document.getElementById('najbolji-zaposlenik-zarada-container');
        // Clear previous data but keep the title
        const contentContainer = document.createElement('div');
        data.forEach((zaposlenik) => {
            const div = document.createElement('div');
            div.textContent = `${zaposlenik.zaposlenik} - Ukupan Iznos: ${zaposlenik.ukupan_iznos}`;
            contentContainer.appendChild(div);
        });
        najboljiContainer.innerHTML = ''; // Clear previous content
        najboljiContainer.appendChild(contentContainer); // Append new content
    }

    // Handle Dodaj Zaposlenika form submission
    document.getElementById('dodaj-zaposlenika-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const ime = document.getElementById('ime-zaposlenika').value;
        const prezime = document.getElementById('prezime-zaposlenika').value;
        const mjesto_rada = document.getElementById('mjesto_rada').value;
        const placa = document.getElementById('placa').value;
        const spol = document.getElementById('spol').value;

        // Disable the submit button to prevent multiple submissions
        const submitButton = document.querySelector('#dodaj-zaposlenika-form button[type="submit"]');
        submitButton.disabled = true;

        try {
            const response = await fetch('http://127.0.0.1:5000/dodaj_zaposlenika', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ime, prezime, mjesto_rada, placa, spol }),
            });

            const data = await response.json();
            if (data.success) {
                alert('Zaposlenik uspješno dodan!');
                document.getElementById('dodaj-zaposlenika-form').reset();
                // Optionally, refresh the zaposlenici table
                await fetchAndDisplayZaposlenici();
            } else {
                alert(`Greška: ${data.error}`);
            }
        } catch (error) {
            console.error(error);
            alert('Greška pri dodavanju zaposlenika.');
        } finally {
            // Re-enable the submit button after the operation is complete
            submitButton.disabled = false;
        }
    });

    async function fetchAndDisplayZaposlenici() {
        try {
            const response = await fetch('http://127.0.0.1:5000/zaposlenici');
            const data = await response.json();
            renderZaposleniciTable(data);
        } catch (error) {
            console.error(error);
            alert('Greška pri učitavanju podataka o zaposlenicima.');
        }
    }

    function renderZaposleniciTable(data) {
        const tableContainer = document.getElementById('table-container');
        if (!data.length) {
            tableContainer.innerHTML = `<p>No data available for zaposlenici.</p>`;
            return;
        }

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        // Create headers based on the keys of the first object
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
        tableContainer.innerHTML = ''; // Clear previous content
        tableContainer.appendChild(table); // Append new table
    }

    // Fetch Evidencija Data button
    document.getElementById('evidencija').addEventListener('click', async () => {
        // Hide other data containers
        document.getElementById('dodaj-kupca-container').style.display = 'none';
        document.getElementById('najcesci-kupci-container').style.display = 'none';
        document.getElementById('najbolji-kupci-container').style.display = 'none';
        document.getElementById('dodaj-zaposlenika-container').style.display = 'none';
        document.getElementById('najbolji-zaposlenik-racuni-container').style.display = 'none';
        document.getElementById('najbolji-zaposlenik-zarada-container').style.display = 'none';

        try {
            const response = await fetch('http://127.0.0.1:5000/evidencija');
            const data = await response.json();
            renderEvidencijaTable(data);
        } catch (error) {
            console.error(error);
            alert('Greška pri učitavanju podataka o evidenciji.');
        }
    });

    function renderEvidencijaTable(data) {
        const tableContainer = document.getElementById('table-container');
        if (!data.length) {
            tableContainer.innerHTML = `<p>No data available for evidencija.</p>`;
            return;
        }

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        // Create headers based on the keys of the first object
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
        tableContainer.innerHTML = ''; // Clear previous content
        tableContainer.appendChild(table); // Append new table
    }

    // Fetch Proizvodi Data button
    document.getElementById('pregled_proizvoda').addEventListener('click', async () => {
        // Show the data containers for proizvodi
        document.getElementById('najprodavaniji-proizvodi-container').style.display = 'block';
        document.getElementById('najbolja-zarada-container').style.display = 'block';
        document.getElementById('proizvodi-na-lokacijama-container').style.display = 'block'; // New container
        document.getElementById('ukupna-kolicina-proizvoda-container').style.display = 'block'; // New container

        // Hide other data containers
        document.getElementById('dodaj-kupca-container').style.display = 'none'; // Hide add kupac form
        document.getElementById('najcesci-kupci-container').style.display = 'none'; // Hide kupac data
        document.getElementById('najbolji-kupci-container').style.display = 'none'; // Hide kupac data
        document.getElementById('dodaj-zaposlenika-container').style.display = 'none'; // Hide add zaposlenik form
        document.getElementById('najbolji-zaposlenik-racuni-container').style.display = 'none'; // Hide zaposlenik data
        document.getElementById('najbolji-zaposlenik-zarada-container').style.display = 'none'; // Hide zaposlenik data

        try {
            // Fetch data for proizvodi na lokacijama
            const proizvodiNaLokacijamaResponse = await fetch('http://127.0.0.1:5000/proizvodi_na_lokacijama');
            const proizvodiNaLokacijamaData = await proizvodiNaLokacijamaResponse.json();
            renderProizvodiNaLokacijama(proizvodiNaLokacijamaData);

            // Fetch data for ukupna količina proizvoda
            const ukupnaKolicinaResponse = await fetch('http://127.0.0.1:5000/ukupna_kolicina_proizvoda');
            const ukupnaKolicinaData = await ukupnaKolicinaResponse.json();
            renderUkupnaKolicinaProizvoda(ukupnaKolicinaData);
        } catch (error) {
            console.error(error);
            alert('Greška pri učitavanju podataka o proizvodima.');
        }
    });

    // Fetch locations to populate the dropdown
    async function fetchLocations() {
        try {
            const response = await fetch('http://127.0.0.1:5000/lokacija'); // Adjust the endpoint as needed
            const locations = await response.json();
            locations.forEach(location => {
                const option = document.createElement('option');
                option.value = location.grad; // Assuming 'grad' is the location name
                option.textContent = location.grad;
                locationSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    }

    // Fetch and display products based on selected location
    locationSelect.addEventListener('change', async () => {
        const selectedLocation = locationSelect.value;
        
        // Hide the products by location container when "Svi proizvodi" is selected
        if (selectedLocation === 'svi') {
            proizvodiContainer.style.display = 'none'; // Hide the container
        } else {
            proizvodiContainer.style.display = 'block'; // Show the container for specific locations

            // Fetch products for the selected location
            try {
                const response = await fetch(`http://127.0.0.1:5000/proizvodi_na_lokacijama?location=${selectedLocation}`);
                const data = await response.json();
                console.log('Fetched products for location:', data); // Debugging log
                renderProizvodiNaLokacijama(data);
            } catch (error) {
                console.error('Error fetching products by location:', error);
            }
        }
    });

    // Function to render Proizvodi na Lokacijama
    function renderProizvodiNaLokacijama(data) {
        const container = document.getElementById('proizvodi-table-container');
        container.innerHTML = ''; // Clear previous content

        if (data.length === 0) {
            container.innerHTML = '<p>No products available for this location.</p>';
        } else {
            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');

            // Create table headers
            const headers = ['Proizvod', 'Lokacija', 'Količina'];
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            data.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.proizvod_naziv}</td>
                    <td>${item.lokacija}</td>
                    <td>${item.kolicina}</td>
                `;
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            container.appendChild(table);
        }
        container.style.display = 'block'; // Show the container
        ukupnaKolicinaContainer.style.display = 'none'; // Hide the total quantity container
    }

    // Function to render all products
    function renderAllProducts(data) {
        const container = document.getElementById('proizvodi-na-lokacijama-container');
        container.innerHTML = ''; // Clear previous content

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        // Create table headers
        const headers = ['Proizvod', 'Količina'];
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.proizvod_naziv}</td>
                <td>${item.kolicina}</td>
            `;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        container.appendChild(table);

        container.style.display = 'block'; // Show the container
        ukupnaKolicinaContainer.style.display = 'none'; // Hide the total quantity container
    }

    // Function to render Ukupna Količina Proizvoda
    function renderUkupnaKolicinaProizvoda(data) {
        const container = document.getElementById('ukupna-kolicina-proizvoda-container');
        container.innerHTML = ''; // Clear previous content
        data.forEach(item => {
            const div = document.createElement('div');
            div.textContent = `Proizvod: ${item.proizvod_naziv}, Ukupna Količina: ${item.ukupna_kolicina}`;
            container.appendChild(div);
        });
    }

    // Call fetchLocations to populate the dropdown on page load
    fetchLocations();

    async function fetchNajprodavanijiProizvodi() {
        try {
            const response = await fetch('http://127.0.0.1:5000/najprodavaniji_proizvodi');
            const data = await response.json();
            renderNajprodavanijiProizvodi(data);
        } catch (error) {
            console.error('Error fetching najprodavaniji proizvodi:', error);
        }
    }

    function renderNajprodavanijiProizvodi(data) {
        const container = document.getElementById('najprodavaniji-proizvodi-container');
        container.innerHTML = ''; // Clear previous content

        if (data.length === 0) {
            container.innerHTML = '<p>No best-selling products available.</p>';
        } else {
            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');

            // Create table headers
            const headers = ['Proizvod', 'Količina'];
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            data.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.naziv}</td>
                    <td>${item.kolicina}</td>
                `;
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            container.appendChild(table);
        }
        container.style.display = 'block'; // Show the container
    }

    // Similar function for najbolja_zarada
    async function fetchNajboljaZarada() {
        try {
            const response = await fetch('http://127.0.0.1:5000/najbolja_zarada');
            const data = await response.json();
            renderNajboljaZarada(data);
        } catch (error) {
            console.error('Error fetching najbolja zarada:', error);
        }
    }

    function renderNajboljaZarada(data) {
        const container = document.getElementById('najbolja-zarada-container');
        container.innerHTML = ''; // Clear previous content

        if (data.length === 0) {
            container.innerHTML = '<p>No best profit products available.</p>';
        } else {
            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');

            // Create table headers
            const headers = ['Proizvod', 'Zarada'];
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            data.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.naziv}</td>
                    <td>${item.zarada}</td>
                `;
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            container.appendChild(table);
        }
        container.style.display = 'block'; // Show the container
    }

    // Call these functions when the page loads or when the relevant button is clicked
    fetchNajprodavanijiProizvodi();
    fetchNajboljaZarada();

    // Fetch Narudžbe data
    async function fetchNarudzbe() {
        try {
            const response = await fetch('http://127.0.0.1:5000/pregled_narudzba');
            const data = await response.json();
            renderNarudzbe(data);
        } catch (error) {
            console.error('Error fetching narudzbe:', error);
        }
    }

    function renderNarudzbe(data) {
        const container = document.getElementById('narudzbe-container');
        container.innerHTML = ''; // Clear previous content

        if (data.length === 0) {
            container.innerHTML = '<p>No narudzbe available.</p>';
        } else {
            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');

            // Create table headers
            const headers = ['ID', 'Lokacija ID', 'Kupac ID', 'Datum'];
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            data.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.id}</td>
                    <td>${item.lokacija_id}</td>
                    <td>${item.kupac_id}</td>
                    <td>${item.datum}</td>
                `;
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            container.appendChild(table);
        }
        container.style.display = 'block'; // Show the container
    }

    // Fetch Nabava data
    async function fetchNabava() {
        try {
            const response = await fetch('http://127.0.0.1:5000/pregled_nabava');
            const data = await response.json();
            renderNabava(data);
        } catch (error) {
            console.error('Error fetching nabava:', error);
        }
    }

    function renderNabava(data) {
        const container = document.getElementById('nabava-container');
        container.innerHTML = ''; // Clear previous content

        if (data.length === 0) {
            container.innerHTML = '<p>No nabava available.</p>';
        } else {
            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');

            // Create table headers
            const headers = ['ID', 'Lokacija ID', 'Datum'];
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            data.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.id}</td>
                    <td>${item.lokacija_id}</td>
                    <td>${item.datum}</td>
                `;
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            container.appendChild(table);
        }
        container.style.display = 'block'; // Show the container
    }

    // Add event listeners for the new buttons
    document.getElementById('pregled_narudzba').addEventListener('click', async () => {
        // Hide all databoxes except for the zaposlenik databox
        const allDataBoxes = document.querySelectorAll('.data-box');
        allDataBoxes.forEach(box => {
            box.style.display = 'none'; // Hide all databoxes
        });  
        
        fetchNarudzbe(); // Fetch and display Narudžbe
        document.getElementById('dodaj-nabavu-button').style.display = 'none'; // Hide the "Dodaj Nabavu" button
    });
 
 
    // Add event listeners for the Nabava button
    document.getElementById('pregled_nabava').addEventListener('click', async () => {
        // Show the Nabava container
        fetchNabava(); // Fetch and display Nabava
        document.getElementById('dodaj-nabavu-button').style.display = 'block'; // Show the "Dodaj Nabavu" button
       });

    document.getElementById('dodaj-nabavu-button').addEventListener('click', () => {
        document.getElementById('dodaj-nabavu-container').style.display = 'block'; // Show the form for adding Nabava
    });

    // Handle the form submission for adding Nabava
    document.getElementById('dodaj-nabavu-form').addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const lokacijaIdNabava = document.getElementById('lokacija-id-nabava').value;

        // Send the data to the server
        try {
            const response = await fetch('http://127.0.0.1:5000/dodaj_nabavu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lokacija_id: lokacijaIdNabava,
                }),
            });

            const result = await response.json();
            if (result.success) {
                alert('Nabava je uspješno dodana!');
                document.getElementById('dodaj-nabavu-form').reset();
                document.getElementById('dodaj-nabavu-container').style.display = 'none';
                fetchNabava(); // Refresh the list of Nabava
            } else {
                alert('Greška: ' + result.error);
            }
        } catch (error) {
            console.error('Error adding nabava:', error);
            alert('Greška pri dodavanju nabave.');
        }
    });
  });
  
  function showLogin() {
    document.getElementById('kupac-view').style.display = 'none';
    document.getElementById('login-view').style.display = 'block';
  }
  
