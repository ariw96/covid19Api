//variables
const state = { continent: null, dataType: "confirmed" };
const continentsList = ["asia", "europe", "africa", "america"];
const countriesMap = {};
const covidPerCountryMap = {};
let latest_dataArr = [];
const cors = "https://intense-mesa-62220.herokuapp.com/";
const colors = { 1: "#6C4A4A", 2: "#C89595", 3: "#DDBEBE", 4: "#EDEDED" };

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
        displayBtn(curContinentNameArr)
        countriesMap[continent] = curContinentNameArr;
        const countriesPromiseArr = curContinentCodeArr.map((code) => {
            return axios.get(`${cors}https://corona-api.com/countries/${code}`);
        });
        const countriesDataArr = await Promise.allSettled(countriesPromiseArr);
        const covidCountryMap = {}
        latest_dataArr = countriesDataArr.map((element) => {
            covidCountryMap[element.value.data.data.name] = element.value.data.data.latest_data
            return element.value.data.data.latest_data
        })
        covidPerCountryMap[continent] = covidCountryMap



        createChart(continent)

        console.log(covidPerCountryMap[continent], latest_dataArr)
    } catch (error) {
        console.log(error);
    }
}

function displayBtn(arr) {
    arr.forEach((country) => {
        const countryEl = document.createElement("button");
        countryEl.classList.add("btn", "btn-country");
        countryEl.dataset.country = country;
        countryEl.innerText = country;
        countriesContainerEl.appendChild(countryEl);

    });
}



//create a line chart
function createChart(continent) {
    if (countriesMap[continent]) {
        const chartEl = document.createElement("canvas");
        chartContainerEl.innerHTML = "";
        chartContainerEl.appendChild(chartEl);
        chartEl.setAttribute(
            "height",
            (window.screen.availHeight / 3.5).toString()
        );
        chartEl.setAttribute("width", (window.screen.availHeight * 0.8).toString());
        Chart.defaults.global.defaultFontColor = colors[1];
        const chart = new Chart(chartEl, {
            type: "line",
            data: {
                labels: countriesMap[continent],
                datasets: [{
                    data: dataTypeArr(state.dataType),
                    backgroundColor: "rgba(200, 149, 149, 0.2)",
                    borderColor: colors[2],
                }, ],
            },
            options: {
                title: {
                    display: true,
                    text: `Covid-19 in ${continent}`,
                    fontSize: 20,
                },
            },
        });

    }
}
continentsEL.forEach((continent) => {
    continent.addEventListener("click", (e) => {
        state.continent = e.target.dataset.continent;
        getCountriesData(e.target.dataset.continent);
        createChart(e.target.dataset.continent);

    });
});

dataTypeEL.forEach((dataType) => {
    dataType.addEventListener("click", (e) => {
        state.dataType = e.target.dataset.type;
        createChart(state.continent);
    });
});

function dataTypeArr(dataType) {
    return latest_dataArr.map((e) => e[dataType])
}