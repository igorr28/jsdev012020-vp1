import { mapInit } from './js/ymaps';
// import './font-awesome/css/font-awesome.min.css';
import './css/styles.css';
// import render from './templates/friends.hbs';

window.onload = mapInit();

const map = document.querySelector('#map');

const list = [
    {
        name: 'Иван', last_name: 'Иванов'
    },
    {
        name: 'Олег', last_name: 'Петров'
    },
    {
        name: 'Игорь', last_name: 'Авдеев'
    },
    {
        name: 'Денис', last_name: 'Иванов'
    },
    {
        name: 'Артем', last_name: 'Картушин'
    },
];

// map.innerHTML = render ({ list })