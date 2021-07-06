const toCurrency = content => {
    return new Intl.NumberFormat('us-US', {
        currency: 'usd',
        style: 'currency',
        minimumFractionDigits: 0
    }).format(content)
}

const toDate = content => {
    return new Intl.DateTimeFormat('us-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(new Date(content))
}

document.querySelectorAll('.price').forEach(node => {
    node.textContent = toCurrency(node.textContent)
})

document.querySelectorAll('.date').forEach(node => {
    node.textContent = toDate(node.textContent)
})

const $table = document.querySelector('#table')

if ($table) {
    $table.addEventListener('click', (event) => {
        if (event.target.classList.contains('action')) {
            const id = event.target.dataset.id
            const csrf = event.target.dataset.csrf
            fetch('/card/remove/' + id, {
                headers: {'X-XSRF-TOKEN': csrf},
                method: 'delete'
            }).then(res => res.json())
                .then(card => {
                    if (card.courses.length) {
                        const html = card.courses.map(el => {
                            return `
                            <tr>
                                <td>${el.title}</td>
                                <td>${el.count}</td>
                                <td><button class="btn btn-small action" data-id="${el.id}">Delete</button></td>
                            </tr>
                            `
                        }).join('')
                        $table.querySelector('tbody').innerHTML = html
                        $table.querySelector('.price').textContent = toCurrency(card.price)
                    } else {
                        $table.innerHTML = '<p>Busket is empty</p>'
                    }
                })
        }
    })
}

M.Tabs.init(document.querySelectorAll('.tabs'));