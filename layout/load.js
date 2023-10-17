document.addEventListener("DOMContentLoaded", function() {
  fetch(`/layout/header.html`).then(file => {
    file.text().then(content => {
      document.body.insertAdjacentHTML('afterbegin', content)
    })
  })

  fetch(`/layout/footer.html`).then(file => {
    file.text().then(content => {
      document.body.insertAdjacentHTML('beforeend', content)
    })
  })
})