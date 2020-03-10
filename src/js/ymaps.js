function mapInit() {
    ymaps.ready(() => {
        // let myMap = new ymaps.Map('map', {
        //     center: [47.23, 39.72],
        //     zoom: 13
        // });

        var myPlacemark,
            myMap = new ymaps.Map('map', {
                center: [47.23, 39.72],
                zoom: 13
            });

        // Слушаем клик на карте.
        myMap.events.add('click', function (e) {
            var coords = e.get('coords');

            // Если метка уже создана – просто передвигаем ее.
            if (myPlacemark) {
                myPlacemark.geometry.setCoordinates(coords);
            }
            // Если нет – создаем.
            else {
                myPlacemark = createPlacemark(coords);
                myMap.geoObjects.add(myPlacemark);
                // Слушаем событие окончания перетаскивания на метке.
                myPlacemark.events.add('dragend', function () {
                    getAddress(myPlacemark.geometry.getCoordinates());
                });
            }
            getAddress(coords);
        });

        // Создание метки.
        function createPlacemark(coords) {
            return new ymaps.Placemark(coords, {
                iconCaption: 'поиск...'
            }, {
                preset: 'islands#violetDotIconWithCaption',
                draggable: true
            });
        }

        // Определяем адрес по координатам (обратное геокодирование).
        function getAddress(coords) {
            myPlacemark.properties.set('iconCaption', 'поиск...');
            ymaps.geocode(coords).then(function (res) {
                console.log(res.geoObjects.get(0));
                var firstGeoObject = res.geoObjects.get(0);

                myPlacemark.properties
                    .set({
                    // Формируем строку с данными об объекте.
                        iconCaption: `${firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() : firstGeoObject.getAdministrativeAreas()} ${firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()}`,
                        // В качестве контента балуна задаем строку с адресом объекта.
                        balloonContent: firstGeoObject.getAddressLine()
                    });
                    console.log(firstGeoObject.getAddressLine());
            });
            
        }
    })
}

export {
    mapInit
}