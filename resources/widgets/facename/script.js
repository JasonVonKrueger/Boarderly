(function() {
    const socket = io();

    socket.emit('GET_FACENAME_PICTURE');

    const img = '/albums/Roger_and_family/Raelyn.png';
    const txt = 'Raelyn';

    let img_markup = `<img src="${img}" />`;
    facename__image.innerHTML = img_markup;

    let txt_markup = `<h2>${txt}</h2>`;
    facename__text.innerHTML = txt_markup;

    this.addEventListener('click', handleFaceNameClick, false);

    function handleFaceNameClick() {
        let card = document.querySelector('.flip-card');
        card.classList.toggle('is-flipped');
    }

})();



