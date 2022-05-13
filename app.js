//variables
const state = { continent: null, dataType: "confirmed" };
const continentsList = ["asia", "europe", "africa", "america"];
const countriesMap = {};
const covidPerCountryMap = {};
const cors = "https://intense-mesa-62220.herokuapp.com/";
const colors = { 1: "#6C4A4A", 2: "#C89595", 3: "#DDBEBE", 4: "#EDEDED" };

//DOM Elements
const continentsEL = document.querySelectorAll("[data-continent]");
const dataTypeEL = document.querySelectorAll("[data-type]");
const countriesContainerEl = document.querySelector(".countries-container");
const chartContainerEl = document.querySelector(".chart-container");
const openingAreaEl = document.querySelector(".main__opening");
const spinnerEl = document.querySelector(".loading-spinner");

//classes
function Country(name, code) {
    this.name = name;
    this.code = code;
}

class CovidData {
    constructor(continent, confirmed, deaths, recovered, critical) {
        this.continent = continent;
        this.confirmed = confirmed;
        this.deaths = deaths;
        this.recovered = recovered;
        this.critical = critical;
    }
}


//functions
//check if data exists. if not, get it from api
function getData(continent) {
    if (countriesMap[continent]) {
        return;
    } else {
        spinnerEl.classList.toggle("display-none");
        getCountriesData(continent);
    }
}

async function getCountriesData(continent) {
    try {
        const countriesApi = await axios.get(
            `${cors}https://restcountries.herokuapp.com/api/v1/region/${continent}?fields=name;alpha2Code`
        );
        const data = countriesApi.data
        const currentContinent = countriesMap[continent] = data.map((country) => {
            return (new Country(country.name.common, country.cca2));
        })

        const countriesPromiseArr = currentContinent.map((country) => {
            return axios.get(`${cors}https://corona-api.com/countries/${country.code}`);
        });
        const countriesDataArr = await Promise.allSettled(countriesPromiseArr);


        console.log(data, countriesMap, currentContinent, countriesPromiseArr, countriesDataArr)
    } catch (error) {
        console.log(error);
    }
}
//countries and covid API's are somewhat inconsistent. fix it:

getCountriesData("asia")

// store data in variables

//get covid data by countries and store in variables


//fetch multiple simultaneously


//countries and covid API's are somewhat inconsistent. fix it:




//create button for each country

//create a line chart



//create a doughnut chart for a country


//check screen size, if not enough, display a message


//extract data from storage and return it