'use strict';

// API key
const API_KEY = 'f88c3a45cec61d60561069a2513612bc';

// Total pages of movie data - may be changeable
const TOTAL_PAGES = 500;

// Generate a random number between 0 - 500
const generateRandomNumber = ( results, sum ) => {
    return Math.floor( Math.random() * results + sum )
};

// Generate URL for fetch call
const generateDatabaseUrl = (key, randNum) => `https://api.themoviedb.org/3/discover/movie?api_key=${key}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${randNum}`;

// Fetch data from database
const fetchMovieData = async url => {
    const res = await fetch(url)
    const data = await res.json();
    return data;
}

// Display search warning when filters are high
let ratingVal = 0;
let yearVal = 0;
const displaySearchWarning = (valueType, value) => {
    if ( valueType === 'rating' ) {
        ratingVal = parseInt(value);
    } else if ( valueType === 'year' ) {
        yearVal = parseInt(value);
    }

    const SEARCH_ALERT = document.querySelector('#search-alert');

    if ( ratingVal > 7 || yearVal > 11 || ratingVal + yearVal > 17 ) {
        
        SEARCH_ALERT.style.marginTop = '0';
        SEARCH_ALERT.style.opacity = '1'; 
    } else {
        
        SEARCH_ALERT.style.marginTop = '-7.5em';
        SEARCH_ALERT.style.opacity = '0';
    }
}

// Display range slider value
const displayRangeValueOutput = (sliderId, outputId, type = '') => {
    const SLIDER = document.querySelector(sliderId);
    const RANGE_OUTPUT = document.querySelector(outputId);
    RANGE_OUTPUT.innerText = 'ALL';

    switch ( type ) {
        case 'year':
            SLIDER.oninput = function() {
                SLIDER.value === '0' ? (
                    RANGE_OUTPUT.innerText = 'ALL'
                ) : (
                    displaySearchWarning('year', SLIDER.value),
                    RANGE_OUTPUT.innerHTML = 
                        `${( this.value * 10 ) + 1900} +`
                )
            }
            break;
        default:
            SLIDER.oninput = function() {
                SLIDER.value === '0' ? (
                    RANGE_OUTPUT.innerText = 'ALL'
                ) : (
                    displaySearchWarning('rating', SLIDER.value),
                    RANGE_OUTPUT.innerHTML = this.value
                )
            }
            break;
    }
    return SLIDER
};
const RATING_SLIDER = displayRangeValueOutput('#min-rating', '#range-output');
const YEAR_SLIDER = displayRangeValueOutput('#min-year', '#year-output', 'year');

// Scroll through array on timeout
const timedScroll = array => {
    let i = 0;
    function scrollTitles() {
        setTimeout(() => {
            if ( i < array.length - 1 ) {
                setTimeout(() => {
                    document.querySelector('#movie-title')
                        .innerText = array[i];
                }, 0)
                i++;
                scrollTitles();
            }
        }, 50);
    }
    scrollTitles();
};

// Generate information for final movie
const finalMovieDetails = (arr, a) => {
    document.querySelector('#movie-title')
        .innerText = arr[a].title;
    document.querySelector('#movie-image')
        .innerHTML = `<img src="https://image.tmdb.org/t/p/w600_and_h900_bestv2${arr[a].poster_path}" alt="Movie Poster" />`;
    document.querySelector('#description')
        .innerText = arr[a].overview;
    document.querySelector('#rating')
        .innerText = arr[a].vote_average;
    document.querySelector('#year')
        .innerText = arr[a].release_date.substring(0, 4);
}

// Display description, year and rating of movie
const finalMovie = (array, randNum) => {
    if ( 
        array[randNum].vote_average < parseInt( RATING_SLIDER.value ) ||
        parseInt(array[randNum].release_date.substring(0, 4)) < ( YEAR_SLIDER.value * 10 ) + 1900 
    ) {
        for ( let i = 0 ; i < array.length ; i++ ) {
            if ( 
                array[i].vote_average >= parseInt( RATING_SLIDER.value) &&
                parseInt(array[randNum].release_date.substring(0, 4)) >= ( YEAR_SLIDER.value * 10 ) + 1900  
            ) {
                finalMovieDetails(array, i);
                break;
            } else {
                randomMovie();
                break;
            }
        }
    } else {
        finalMovieDetails(array, randNum)
    }
};

// Choose random movie from fetch page
const randomMovie = () => {
    fetchMovieData(generateDatabaseUrl(API_KEY, generateRandomNumber(TOTAL_PAGES, 1)))
    .then(function(result) {
        const MOVIE_DATA_ARR = result.results.map(movie => movie);
        return MOVIE_DATA_ARR;
    })
    .then(function(result) {
        const MOVIE_TITLE_ARR = result.map(movie => movie.title);
        timedScroll(MOVIE_TITLE_ARR);
        setTimeout(finalMovie, 1000, result, generateRandomNumber(result.length, 0));
    })
};
document.querySelector('#get-random-movie').addEventListener('click', randomMovie, false);