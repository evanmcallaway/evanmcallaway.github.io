document.addEventListener('DOMContentLoaded', function() {
  const headerPromise = fetch('/layout/header.html').then(file => {
    file.text().then(content => {
      document.body.insertAdjacentHTML('afterbegin', content)
      if (window.location.pathname.length > 1)
        document.getElementById("back-button").style.display = 'block';
    })
  })

  const footerPromise = fetch('/layout/footer.html').then(file => {
    file.text().then(content => {
      document.body.insertAdjacentHTML('beforeend', content)
    })
  })

  Promise.all([headerPromise, footerPromise]).then(function() {
    document.body.style.opacity = '1'
  })
})