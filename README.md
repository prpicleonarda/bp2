## Autori
Projekt su razvili studenti Fakulteta Informatike u Puli:
- **Leonarda Prpić**
- **Dominik Ćurić**
- **Filip Lukes**
- **Igor Tadić**
- **Renzo Ermacora**
- **Gabriel Pavić**

## Opis projekta
Ovaj projekt je razvijen za predmet Baze Podataka 2. Tema koju smo mi odabrali je lanac trgovina pod imenom "Dani nakon" te se sastoji od fizičkih trgovina i Internet trgovine. Tehnologije koje smo odlučili koristiti su MySQL za bazu podataka, Flask kao naš web framework te uz njega kombinaciju html-a, css-a i javascripta za izradu same web stranice. 
Što se same trgovine tiče, proizvoda ima svakakvih, od vrtne garniture, preko hrane i pića sve do jeftine kineske elektronike. Svi ti proizvodi se onda dijele na trgovine koje su na svojim lokacijama te svaka ima pripadajuće skladište. Internet trgovina kombinira njihove proizvode te ovisno o privilegijama korisnika(admin, user, zaposlenik, gost) može se kupovati i/ili upravljati samim lancem trgovina.

![Trgovina "Dani nakon"](./app/assets/readme/app.jpg)


Napomena: može biti samo jedna poslovnica po gradu  te zaposlenik može raditi u samo jednoj poslovnici radi jednostavnosti.

# Dokumentacija baze podataka: `trgovina`

Ova baza podataka modelira poslovne procese unutar trgovine. Struktura baze omogućuje upravljanje kupcima, zaposlenicima, proizvodima, transakcijama, zalihama i drugim ključnim elementima poslovanja.

---

## Sadržaj 
1. [Dijagram EER](#dijagram-eer)
2. [Dijagram ERD](#dijagram-erd)
3. [Instalacija i pokretanje](#instalacija-i-pokretanje)
4. [Opis tablica](#opis-tablica)
5. [Relacije između tablica](#relacije-između-tablica)
6. [Validacijska pravila i ograničenja](#validacijska-pravila-i-ograničenja)
7. [Upitni jezik](#upitni-jezik)
8. [Pogled kupca](#pogled-kupca)
9. [Pogled admina](#pogled-admina) 

---

## Dijagram EER 

![Dijagram EER](./app/assets/readme/trgovinaeer.png)

---

## Dijagram ERD

![Dijagram ERD](./app/assets/readme/trgovinaerd.png)


## Instalacija i pokretanje

```
git clone https://github.com/LordJellyfish13/trgovina_dani_nakon.git
```

```
cd trgovina_dani_nakon
```

```
pip install -r requirements.txt
```
