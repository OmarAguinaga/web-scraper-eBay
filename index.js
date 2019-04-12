const puppeteer = require('puppeteer')
const fs = require('fs')

// Extract partners on the page, recursively check the next page in the URL pattern
const getData = async ({ url, startPage, browser }) => {
  const searchArea = `s-kreuzberg`
  const searchParam = `bike`
  const firstUrl =
    url ||
    `https://www.ebay-kleinanzeigen.de/${searchArea}/seite:${startPage}/${searchParam}/k0l3375r5`
  // Scrape the data we want
  const page = await browser.newPage()
  await page.goto(firstUrl)

  const next = await page.evaluate(async () =>
    document.querySelector('.pagination-next')
  )

  const listItem = await page.evaluate(async () => {
    const items = [...document.querySelectorAll('.aditem')]

    return items.map(item => ({
      title: item.querySelector('.text-module-begin').textContent.trim(),
      price: item.querySelector('.aditem-details strong').textContent.trim(),
      link: item.querySelector('.ellipsis').href,
      img: item.querySelector('.imagebox').dataset.imgsrc,
    }))
  })

  await page.close()

  // Recursively scrape the next page

  // Terminate if there is no next page
  if (!next) {
    return listItem
  }

  /* eslint-disable-next-line */
  const nextPageNumber = startPage + 1
  const nextUrl = `https://www.ebay-kleinanzeigen.de/${searchArea}/seite:${nextPageNumber}/${searchParam}/k0l3375r5`

  return listItem.concat(
    await getData({ url: nextUrl, startPage: nextPageNumber, browser })
  )
}

const go = async () => {
  const startPage = 1

  const browser = await puppeteer.launch()

  const data = await getData({ url: null, startPage, browser })

  // write data to file
  fs.writeFile('data.json', JSON.stringify(data), err => {
    if (err) console.log(err)
    console.log(`${data.length} items scraped 😎`)
  })

  await browser.close()
}

go()
