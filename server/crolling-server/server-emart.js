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

    await page.goto(
      // "https://www.emart24.co.kr/goods/ff?search=&align="
      // "https://www.emart24.co.kr/goods/ff?search=&page=2&category_seq=&align="
      // "https://www.emart24.co.kr/goods/ff?search=&page=3&category_seq=&align="
      // "https://www.emart24.co.kr/goods/ff?search=&page=4&category_seq=&align="
      "https://www.emart24.co.kr/goods/ff?search=&page=5&category_seq=&align="
    );

    async function scrapeData() {
      const items = [];
      let itemIndex = 1;

      while (true) {
        const nameElements = await page.$$(
          `body > div.viewContentsWrap > div > section.itemList.active > div:nth-child(${itemIndex}) > div.itemTxtWrap > div > p > a`
        );
        const priceElements = await page.$$(
          `body > div.viewContentsWrap > div > section.itemList.active > div:nth-child(${itemIndex}) > div.itemTxtWrap > span > a`
        );
        const imgElements = await page.$$(
          `body > div.viewContentsWrap > div > section.itemList.active > div:nth-child(${itemIndex}) > div.itemImg > img`
        );

        if (nameElements.length === 0) {
          break;
        }

        for (let i = 0; i < nameElements.length; i++) {
          const name = await nameElements[i].evaluate((element) =>
            element.textContent.trim()
          );
          const price = await priceElements[i].evaluate((element) =>
            element.textContent.trim()
          );
          const img = await imgElements[i].evaluate((element) =>
            element.getAttribute("src")
          );
          items.push({ name, img, price });
        }

        itemIndex++;
      }

      return items;
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
