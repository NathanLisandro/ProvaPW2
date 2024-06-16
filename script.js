document.addEventListener('DOMContentLoaded', function () {
    const searchForm = document.getElementById('search-form');
    const filterIcon = document.getElementById('filter-icon');
    const filterDialog = document.getElementById('filter-dialog');
    const closeDialogButton = document.getElementById('close-dialog');
    const applyFiltersButton = document.getElementById('apply-filters');
    const newsList = document.getElementById('news-list');
    const pagination = document.getElementById('pagination');
    const filterQuantity = document.getElementById('filter-quantity');
    const filterType = document.getElementById('filter-type');
    const filterFrom = document.getElementById('filter-from')
    const filterTo = document.getElementById('filter-to');
    const counterFilter = document.getElementById('counter-apply-filter');

    counterFiltersApply()
    filterIcon.addEventListener('click', () => {
        filterDialog.showModal();
    });

    closeDialogButton.addEventListener('click', () => {
        filterDialog.close();
    });

    applyFiltersButton.addEventListener('click', () => {
        counterFiltersApply()
        const formData = new FormData(document.getElementById('filter-form'));
        const queryString = new URLSearchParams();

        formData.forEach((value, key) => {
            queryString.append(key, value);
        });

        filterDialog.close();
        const selectedQuantity = filterQuantity.value;
        fetchNews(`?${queryString.toString()}&qtd=${selectedQuantity}&page=1`);
    })

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = new URLSearchParams(new FormData(searchForm)).toString();
        const selectedQuantity = filterQuantity.value;
        fetchNews(`?${query}&qtd=${selectedQuantity}&page=1`);
    });

    function counterFiltersApply() {
        const arrCounter = [filterQuantity.value, filterType.value, filterFrom.value, counterFilter.value]

        let counter = 0;
        for (let i = 0; i < arrCounter.length; i++) {
            if (arrCounter[i] !== undefined && arrCounter[i] !== null && arrCounter[i] !== '') {
                counter++;
            }
        }
        document.getElementById('counter-apply-filter').innerHTML = counter
    }

    function fetchNews(query = '') {
        const apiUrl = `http://servicodados.ibge.gov.br/api/v3/noticias${query}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                newsList.innerHTML = '';
                data.items.forEach(news => {
                    const li = document.createElement('li');
                    li.classList.add('news-item');

                    const images = JSON.parse(news.imagens);
                    const imageUrl = `https://agenciadenoticias.ibge.gov.br/${images.image_intro}`;

                    li.innerHTML = `
                        <img src="${imageUrl}" alt="${news.titulo}">
                        <div class="news-content">
                            <h2>${news.titulo}</h2>
                            <p>${news.introducao}</p>
                            <p>#${news.editorias}</p>
                            <p>Publicado há ${calculateTimeAgo(news.data_publicacao)}</p>
                            <button onclick="window.open('${news.link}', '_blank')">Leia Mais</button>
                        </div>
                    `;
                    newsList.appendChild(li);
                });

                updatePagination(data.page, data.totalPages);
            });
    }


    function calculateTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Publicado hoje';
        if (days === 1) return 'Publicado ontem';
        return `Publicado há ${days} dias`;
    }

    function updatePagination(currentPage, totalPages) {
        pagination.innerHTML = '';
        const maxButtons = 10;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = startPage + maxButtons - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        for (let page = startPage; page <= endPage; page++) {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.textContent = page;
            if (page === currentPage) {
                button.classList.add('active');
            }
            button.addEventListener('click', () => {
                const query = new URLSearchParams(window.location.search);
                query.set('page', page);
                window.history.pushState({}, '', `?${query.toString()}`);
                const selectedQuantity = filterQuantity.value;
                fetchNews(`?${query.toString()}&qtd=${selectedQuantity}`);
            });
            li.appendChild(button);
            pagination.appendChild(li);
        }
    }

    const initialQuery = new URLSearchParams(window.location.search);
    const selectedQuantity = filterQuantity.value;
    fetchNews(`?${initialQuery.toString()}&qtd=${selectedQuantity}&page=1`);
});
