const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const app = express();
const port = 3001;

app.use(cors());

app.get("/data", async (req, res) => {
  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(
      "http://gs25.gsretail.com/gscvs/ko/products/youus-freshfood"
    );

    const allData = [];
    let currentPage = 1;

    while (currentPage <= 13) {
      const items = await scrapeData(page);
      allData.push(...items);

      const nextButton = await page.$(
        "#wrap > div.cntwrap > div.yCmsComponent.span-24.section1.cms_disp-img_slot > div > div > div > div > div > div.tblwrap.mt20 > div.paging > a.next"
      );

      if (!nextButton) {
        break;
      }

      await nextButton.click();
      await page.waitForTimeout(5000);
      currentPage++;
    }

    await browser.close();

    res.json(allData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

async function scrapeData(page) {
  const items = [];

  const productElements = await page.$$(
    "#wrap > div.cntwrap > div.yCmsComponent.span-24.section1.cms_disp-img_slot > div > div > div > div > div > div.tblwrap.mt20 > div.tab_cont.on > ul > li"
  );

  for (const productElement of productElements) {
    const nameElement = await productElement.$("div > p.tit");
    const priceElement = await productElement.$("div > p.price > span");
    const imgElement = await productElement.$("div > p.img > img");

    const name = await nameElement.evaluate((element) =>
      element.textContent.trim()
    );
    const price = await priceElement.evaluate((element) =>
      element.textContent.trim()
    );
    const img = await imgElement.evaluate((element) =>
      element.getAttribute("src")
    );

    items.push({ name, img, price });
  }

  return items;
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
