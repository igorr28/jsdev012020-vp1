import render from '../templates/comments-list.hbs';

function mapInit() {
    ymaps.ready(() => {
        // кнопка Добавить коммент
        let addCommentBtn = document.querySelector('.popup__form-submit');
        // массив комментов
        let arrComments = [];
        // массив меток
        let myGeoObjects = [];
        // окно с комментариями и формой
        let popup = document.querySelector('.popup');
        // заголовак с адресом
        let popupTitle = document.querySelector('.popup__title-adress');
        // поле Имя            
        let inputName = document.querySelector('input[name="name"]'); 
        // поле Место          
        let inputPlace = document.querySelector('input[name="place"]');
        // поле Сообщение          
        let message = document.querySelector('textarea[name="message"]');
        // список комментариев
        let listComments = document.querySelector('.popup__comments-list');
        // кнопка Закрыть окно с комментариями
        let closeBtn = document.querySelector('.popup__close'); 
        // координаты метки с которой работаем       
        let currentCoords; 
        // дата добавления отзыва
        let date;       
        
        let myMap = new ymaps.Map('map', {
            center: [47.23, 39.72],
            zoom: 13
        });       
        
        // обработка клика по карте
        myMap.events.add('click', function (e) {
            // координаты клика по карте
            let coords = e.get('coords');
            // координаты отностельно окна
            let left = e.get('pagePixels')[0];
            let top = e.get('pagePixels')[1];

            currentCoords = coords; 
            console.log('coords', currentCoords);           

            getAddress(coords).then(adress => {                
                renderWindowComments ();
                showWindowComments (adress, left, top);                                              
            });            
        });

        // обработка клика Добавить отзыв
        addCommentBtn.addEventListener('click', e => {
            date = new Date();
            e.preventDefault();
            addCommentToArr();
            renderWindowComments ();
            createPlacemark(currentCoords);
            inputName.value = '';
            inputPlace.value = '';
            message.value = '';             
            // checkFormPlacemark(currentCoords);           
        });

        // обработка клика Закрыть окно отзывов
        closeBtn.addEventListener('click', e => {
            closeWindowComments();
        });

        // Создаем макет с информацией о выбранном геообъекте
        let customItemContentLayout = ymaps.templateLayoutFactory.createClass(            
            '<h2 class=ballon_header>{{ properties.balloonContentHeader|raw }}</h2>' +
                '<div class=ballon_body>{{ properties.balloonContentBody|raw }}</div>' +
                '<div class=ballon_footer>{{ properties.balloonContentFooter|raw }}</div>', {
                
                build: function () {                   
                    customItemContentLayout.superclass.build.call(this);
                    // почему-то не получилось получить baloon__adress через чистый js, а вот через jquery почему-то работает                
                    $('.baloon__adress').bind('click', this.onAdressClick);                   
                },

                onAdressClick: function () {
                    let adress = $('.baloon__adress').html();
                    let filterArrComments = arrComments.filter(item => {
                        return (item.adress === adress);
                    });

                    if (filterArrComments.length === 0) {
                        listComments.innerHTML = 'Отзывов пока нет';
                    } else {
                        listComments.innerHTML = render ({ filterArrComments });
                    }                  
                    showWindowComments (adress);                    
                }
            });
        
        let myClusterer = new ymaps.Clusterer({
            clusterDisableClickZoom: true,
            clusterOpenBalloonOnClick: true,            
            clusterBalloonContentLayout: 'cluster#balloonCarousel',            
            clusterBalloonItemContentLayout: customItemContentLayout,
            clusterBalloonPanelMaxMapArea: 0,
            clusterBalloonContentLayoutWidth: 200,
            clusterBalloonContentLayoutHeight: 130,
            clusterBalloonPagerSize: 4
        });       

        // получаем адрес по координатам
        function getAddress(coords) {
            return new Promise (resolve => {
                ymaps.geocode(coords).then(res => { 
                    let adress;           
                    let firstGeoObject = res.geoObjects.get(0);                    

                    adress = firstGeoObject.getAddressLine();                    
                    resolve(adress);                                     
                })                
            })            
        }

        // показать окно с комментариями
        function showWindowComments (adress, left, top) {
            popupTitle.innerHTML = adress;
            popup.style.top = `${top}px`;                
            popup.style.left = `${left}px`;
            popup.style.display = 'block';
        }

        // Добавление комментария в массив с комментариями
        function addCommentToArr() {
            let obj = {};             
            let [latitude, longitude] = currentCoords;           

            obj.adress = popupTitle.innerHTML;
            obj.latitude = latitude;
            obj.longitude = longitude;
            obj.name = inputName.value;
            obj.place = inputPlace.value;
            obj.date = `${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()}`;
            obj.message = message.value;
            arrComments.push(obj);
            console.log('arrcomments', arrComments);
        }

        // перерисовка списка комментариев в зависимости от геообъекта
        function renderWindowComments () {
            let filterArrComments = arrComments.filter(item => {
                return (item.latitude === currentCoords[0] && item.longitude === currentCoords[1]);
            });

            console.log('filtercomments', filterArrComments);
            if (filterArrComments.length === 0) {
                listComments.innerHTML = 'Отзывов пока нет';
            } else {
                listComments.innerHTML = render ({ filterArrComments });
            }            
        }

        // закрыть окно
        function closeWindowComments () {
            inputName.value = '';
            inputPlace.value = '';
            message.value = ''; 
            popup.style.display = '';
        }

        // Создать метку и добавить ее в кластер
        function createPlacemark(coords) {
            // for(let i=0; i<myGeoObjects.length; i++) {
            //     if (myGeoObjects[i].geometry.getCoordinates() === coords) {
            //         return;
            //     }
            // }
            let myPlacemark = new ymaps.Placemark(coords, {                
                balloonContentHeader: `<div>${inputName.value}</div><div class="baloon__adress">${popupTitle.innerHTML}</div>`,
                balloonContentBody: message.value,
                balloonContentFooter: `${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()}`
            });
            
            myPlacemark.events.add('click', placemarkHandler);
            myGeoObjects.push(myPlacemark);
            console.log('mygeoobjects', myGeoObjects); 
            myMap.geoObjects.add(myPlacemark);
            myClusterer.add(myGeoObjects);
            myMap.geoObjects.add(myClusterer);            
           
        }

        // обработчик клика по метке
        function placemarkHandler (e) {            
            let target = e.get('target');
            let coords = target.geometry.getCoordinates();
            let left = e.get('pagePixels')[0];
            let top = e.get('pagePixels')[1];

            currentCoords = coords;
            target.options.set('openBalloonOnClick', false);                                  

            getAddress(coords).then(adress => {                                
                renderWindowComments ();                
                showWindowComments (adress, left, top);                                              
            });  

        }
        // изменение вида метки
        // function checkFormPlacemark(coords) {
        //     let currentPlacemark = myGeoObjects.find(item => {
        //         return (item.geometry.getCoordinates()[0] === coords[0] && item.geometry.getCoordinates()[1] === coords[1])
        //     });
        //     let filterArrComments = arrComments.filter(item => {
        //         return (item.latitude === coords[0] && item.longitude === coords[1]);
        //     });

        //     if (filterArrComments.length>1) {
        //         currentPlacemark.options.set('preset', 'islands#greenIcon');
        //         //currentPlacemark.properties.set ('iconContent', filterArrComments.length); 
        //     }

        // }
        
    })
}

export {
    mapInit
}