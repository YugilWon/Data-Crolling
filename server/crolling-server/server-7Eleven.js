const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const app = express();
const port = 3001;

app.use(cors());

app.get("/data", async (req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto("http://www.7-eleven.co.kr/product/bestdosirakList.asp");

    async function scrapeData() {
      const items = new Set();

      while (true) {
        const nameElements = await page.$$(".dosirak_list_01_02 .name");
        const priceElements = await page.$$(
          ".dosirak_list_01_02 .price > span"
        );
        const imgElements = await page.$$(".dosirak_list_01_02 img");

        for (let i = 0; i < nameElements.length; i++) {
          const name = await nameElements[i].evaluate((element) =>
            element.textContent.trim()
          );
          const price = await priceElements[i].evaluate((element) =>
            element.textContent.trim()
          );
          const relativeImgPath = await imgElements[i].evaluate((element) =>
            element.getAttribute("src")
          );
          const img = `http://www.7-eleven.co.kr${relativeImgPath}`;

          items.add(JSON.stringify({ name, img, price }));
        }

        const loadMoreButton = await page.$("#moreImg > a");

        if (!loadMoreButton) {
          break;
        }

        await loadMoreButton.click();
        await page.waitForTimeout(1000);
      }

      return Array.from(items).map((item) => JSON.parse(item));
    }

    const finalData = await scrapeData();

    await browser.close();

    res.json(finalData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
