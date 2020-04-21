'use strict';

const storeApp = {
    selectedLocations: {},
    addDialogContainer: document.getElementById('addDialogContainer'),
};

/**
 * Toggles the visibility of the add location dialog box.
 */
function toggleAddDialog(event) {
    storeApp.addDialogContainer.classList.toggle('visible');
    if (!event || event.currentTarget.id !== 'butAdd') {
        var canvas = document.getElementById('canvas');
        var context = canvas.getContext('2d');
        document.getElementById('photoBooth').hidden = true;
        document.getElementById('take').hidden = false;
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
}

/**
 * Event handler for butDialogAdd, adds the selected location to the list.
 */
function addLocation() {
    // Hide the dialog
    toggleAddDialog();
    // Get the selected city
    const select = document.getElementById('selectCityToAdd');
    const geo = select.value;
    const label = select.value;
    const price = document.getElementById('price').value;
    const location = {
        label: label,
        geo: geo,
        price: price,
        //pic: pic
    };
    // Create a new card & get the weather data from the server
    const card = getForecastCard(location);
    getForecastFromNetwork(geo).then((forecast) => {
        renderForecast(card, forecast);
    });
    // Save the updated list of selected cities.
    storeApp.selectedLocations[geo] = location;
    saveLocationList(storeApp.selectedLocations);
}

/**
 * Event handler for .remove-city, removes a location from the list.
 *
 * @param {Event} evt
 */
function removeLocation(evt) {
    const parent = evt.srcElement.parentElement;
    parent.remove();
    if (storeApp.selectedLocations[parent.id]) {
        delete storeApp.selectedLocations[parent.id];
        saveLocationList(storeApp.selectedLocations);
    }
}

/**
 * Renders the forecast data into the card element.
 *
 * @param {Element} card The card element to update.
 * @param {Object} data Weather forecast data to update the element with.
 */
function renderForecast(card, data) {
    if (data) {
        const cardLastUpdatedElem = card.querySelector('.card-last-updated');
        const cardLastUpdated = cardLastUpdatedElem.textContent;
        const lastUpdated = parseInt(cardLastUpdated);

        // If the data on the element is newer, skip the update.
        if (lastUpdated >= data.currently.time) {
            return;
        }
        cardLastUpdatedElem.textContent = data.currently.time;

    }

    const spinner = card.querySelector('.card-spinner');
    if (spinner) {
        card.removeChild(spinner);
    }
}

/**
 * Get's the latest forecast data from the network.
 *
 * @param {string} coords Location object to.
 * @return {Object} The weather forecast, if the request fails, return null.
 */
function getForecastFromNetwork(coords) {
    return fetch(`/forecast/${coords}`)
        .then((response) => {
            return response.json();
        })
        .catch(() => {
            return null;
        });
}

/**
 * Get's the cached forecast data from the caches object.
 *
 * @param {string} coords Location object to.
 * @return {Object} The weather forecast, if the request fails, return null.
 */
function getForecastFromCache(coords) {
    // CODELAB: Add code to get weather forecast from the caches object.
    if (!('caches' in window)) {
        return null;
    }
    const url = `${window.location.origin}/forecast/${coords}`;
    return caches.match(url)
        .then((response) => {
            if (response) {
                return response.json();
            }
            return null;
        })
        .catch((err) => {
            console.error('Error getting data from cache', err);
            return null;
        });
}

/**
 * Get's the HTML element for the weather forecast, or clones the template
 * and adds it to the DOM if we're adding a new item.
 *
 * @param {Object} location Location object
 * @return {Element} The element for the weather forecast.
 */
function getForecastCard(location) {
    const id = location.geo;
    const card = document.getElementById(id);
    if (card) {
        return card;
    }
    const newCard = document.getElementById('weather-template').cloneNode(true);
    newCard.querySelector('.location').textContent = location.label;
    newCard.querySelector('.description').textContent = `$ ${location.price}`;
    newCard.querySelector('.photo').src = location.pic;
    newCard.setAttribute('id', id);
    newCard.querySelector('.remove-city')
        .addEventListener('click', removeLocation);
    document.querySelector('main').appendChild(newCard);
    newCard.removeAttribute('hidden');
    return newCard;
}

/**
 * Gets the latest weather forecast data and updates each card with the
 * new data.
 */
function updateData() {
    Object.keys(storeApp.selectedLocations).forEach((key) => {
        const location = storeApp.selectedLocations[key];
        const card = getForecastCard(location);
        // CODELAB: Add code to call getForecastFromCache
        getForecastFromCache(location.geo)
            .then((forecast) => {
                renderForecast(card, forecast);
            });

        // Get the forecast data from the network.
        getForecastFromNetwork(location.geo)
            .then((forecast) => {
                renderForecast(card, forecast);
            })
            .catch((error) => {
                console.log(`offline: ${error}`);
            });
    });
}

/**
 * Saves the list of locations.
 *
 * @param {Object} locations The list of locations to save.
 */
function saveLocationList(locations) {
    const data = JSON.stringify(locations);
    localStorage.setItem('locationList', data);
}

/**
 * Loads the list of saved location.
 *
 * @return {Array}
 */
function loadLocationList() {
    let locations = localStorage.getItem('locationList');
    if (locations) {
        try {
            locations = JSON.parse(locations);
        } catch (ex) {
            locations = {};
        }
    }
    if (!locations || Object.keys(locations).length === 0) {
        const key = '40.7720232,-73.9732319';
        locations = {};
        locations[key] = {
            label: 'New York City',
            geo: '40.7720232,-73.9732319'
        };
    }
    return locations;
}

function initateCamera() {
    var video = document.getElementById('video');

    // Get access to the camera!
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Not adding `{ audio: true }` since we only want video now
        navigator.mediaDevices.getUserMedia({
            video: true
        }).then(function (stream) {
            //video.src = window.URL.createObjectURL(stream);
            video.srcObject = stream;
            video.play();
        }).catch(function (err0r) {
            console.log("Something went wrong!");
        });
    }
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var video = document.getElementById('video');

    // Trigger photo take
    document.getElementById("snap").addEventListener("click", function () {
        context.drawImage(video, 0, 0, 200, 150);
        document.getElementById('video').srcObject.getVideoTracks().forEach(track => track.stop());
        const pic = document.getElementById("canvas").toDataURL();
        document.getElementById('photo1').src = pic;
        console.log(pic);
    });
}

function init() {

    // Set up the event handlers for all of the buttons.
    //document.getElementById('butRefresh').addEventListener('click', updateData);
    document.getElementById('butAdd').addEventListener('click', toggleAddDialog);
    document.getElementById('butDialogCancel')
        .addEventListener('click', toggleAddDialog);
    document.getElementById('butDialogAdd')
        .addEventListener('click', addLocation);
    document.getElementById('take').addEventListener('click', function () {
        document.getElementById('take').hidden = true;
        document.getElementById('photoBooth').hidden = false;
        initateCamera();
    });
        
}

init();