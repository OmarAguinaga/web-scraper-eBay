import puppeteer from 'puppeteer'

function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

async function getHTML(url) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url)

  const listItem = await page.evaluate(async () => {
    const items = [...document.querySelectorAll('.aditem')]
    for (const item of items) {
      item.scrollIntoView()
      await delay(100)
    }

    return items.map(item => ({
      title: item.querySelector('.text-module-begin').textContent.trim(),
      price: item.querySelector('.aditem-details strong').textContent.trim(),
      link: item.querySelector('.ellipsis').href,
      image: item.querySelector('img') ? item.querySelector('img').src : null,
    }))
  })
  console.log(listItem)

  await browser.close()
}

export { getHTML }
