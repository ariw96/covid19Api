//variables
const state = { continent: null, dataType: "confirmed" };
const continentsList = ["asia", "europe", "africa", "america"];
const countriesMap = {};
const covidCountryMap = {};
const covidPerContinentMap = {};
let latest_dataArr = [];
const cors = "https://intense-mesa-62220.herokuapp.com/";


//DOM Elements
const continentsEL = document.querySelectorAll("[data-continent]");
const dataTypeEL = document.querySelectorAll("[data-type]");
const countriesContainerEl = document.querySelector(".countries-container");
const chartContainerEl = document.querySelector(".chart-container");
const openingAreaEl = document.querySelector(".main__opening");
const spinnerEl = document.querySelector(".loading-spinner");

async function getCountriesData(continent) {
    try {
        const countriesApi = await axios.get(
            `${cors}https://restcountries.herokuapp.com/api/v1/region/${continent}?fields=name;alpha2Code`
        );
        const { data } = countriesApi;
        const curContinentCodeArr = await data.map((country) => {
            return country.cca2;
        })
        const curContinentNameArr = await data.map((country) => {
            return country.name.common;
        })
        countriesMap[continent] = curContinentNameArr;
        const countriesPromiseArr = curContinentCodeArr.map((code) => {
            return axios.get(`${cors}https://corona-api.com/countries/${code}`);
        });
        const countriesDataArr = await Promise.allSettled(countriesPromiseArr);
        latest_dataArr = countriesDataArr.map((element) => {
            covidCountryMap[element.value.data.data.name] = element.value.data.data.latest_data
            return element.value.data.data.latest_data
        })
        covidPerContinentMap[continent] = covidCountryMap

        console.log(covidCountryMap, countriesMap[continent])

    } catch (error) {
        console.log(error);
    }
}
//utilities functions
async function displayContent(continent) {
    if (covidPerContinentMap[continent]) return;
    spinnerEl.classList.toggle("display-none");
    await getCountriesData(continent)
    await displayBtn(continent)
    spinnerEl.classList.toggle("display-none");
    createChart(continent)
}

function dataTypeArr(dataType) {
    return latest_dataArr.map((e) => e[dataType])
}

function displayBtn(continent) {
    countriesMap[continent].forEach((country) => {
        const countryEl = document.createElement("button");
        countryEl.classList.add("btn", "btn-country");
        countryEl.dataset.country = country;
        countryEl.innerText = country;
        countriesContainerEl.appendChild(countryEl);
        countryEl.addEventListener("click", (e) => {
            createCountryChart(e.target.dataset.country);
        });

    });
}



//create a line chart
function createChart(continent) {
    if (covidPerContinentMap[continent]) {
        const chartEl = document.createElement("canvas");
        chartContainerEl.innerHTML = "";
        chartContainerEl.appendChild(chartEl);
        chartEl.setAttribute(
            "height",
            (window.screen.availHeight / 3.5).toString()
        );
        chartEl.setAttribute("width", (window.screen.availHeight * 0.8).toString());
        Chart.defaults.global.defaultFontColor = "black";
        const chart = new Chart(chartEl, {
            type: "line",
            data: {
                labels: countriesMap[continent],
                datasets: [{
                    label: `${state.dataType}`,
                    data: dataTypeArr(state.dataType),
                    backgroundColor: "yellow",
                }, ],
            },
            options: {
                title: {
                    display: true,
                    text: ` ${continent}`,
                    fontSize: 20,
                },
            },
        });

    }
}
// bar chart
function createCountryChart(country) {
    const chartEl = document.createElement("canvas");
    chartContainerEl.innerHTML = "";
    chartContainerEl.appendChild(chartEl);
    chartEl.setAttribute("height", (window.screen.availHeight / 4).toString());
    chartEl.setAttribute("width", (window.screen.availHeight * 0.9).toString());
    const chart = new Chart(chartEl, {
        type: "bar",
        data: {
            labels: ["confirmed", "deaths", "recovered", "critical"],
            datasets: [{
                label: country,
                data: [
                    covidCountryMap[country].confirmed,
                    covidCountryMap[country].deaths,
                    covidCountryMap[country].recovered,
                    covidCountryMap[country].critical,
                ],
                backgroundColor: ["yellow", "red", 'green', "orange"]
            }, ],
        },
        options: {
            title: {
                display: true,
                text: ` ${country}`,
                fontSize: 20,
            },
        },
    });
}
//addEventListener
continentsEL.forEach((continent) => {
    continent.addEventListener("click", (e) => {
        state.continent = e.target.dataset.continent;
        displayContent(e.target.dataset.continent)
        createChart(e.target.dataset.continent);

    });
});

dataTypeEL.forEach((dataType) => {
    dataType.addEventListener("click", (e) => {
        state.dataType = e.target.dataset.type;
        createChart(state.continent);
    });
});