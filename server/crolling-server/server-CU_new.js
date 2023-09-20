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
      // "https://cu.bgfretail.com/product/product.do?category=service&depth2=4&sf=N"
      // "https://cu.bgfretail.com/product/product.do?category=product&depth2=4&depth3=2"
      // "https://cu.bgfretail.com/product/product.do?category=product&depth2=4&depth3=3"
      // "https://cu.bgfretail.com/product/product.do?category=product&depth2=4&depth3=4"
      // "https://cu.bgfretail.com/product/product.do?category=product&depth2=4&depth3=5"
      // "https://cu.bgfretail.com/product/product.do?category=product&depth2=4&depth3=6"
      "https://cu.bgfretail.com/product/product.do?category=product&depth2=4&sf=N"
    );

    await page.waitForSelector("#dataTable");

    async function scrapeData() {
      const items = await page.evaluate(() => {
        const items = [];

        const nameElements = document.querySelectorAll(
          "#dataTable > div.prodListWrap > ul > li > div > div.prod_wrap > div.prod_text > div.name > p"
        );
        const priceElements = document.querySelectorAll(
          "#dataTable > div.prodListWrap > ul > li > div > div.prod_wrap > div.prod_text > div.price > strong"
        );
        const imgElements = document.querySelectorAll(
          "#dataTable > div.prodListWrap > ul > li > div > div.prod_wrap > div.prod_img > img"
        );

        for (let i = 0; i < nameElements.length; i++) {
          const name = nameElements[i].textContent.trim();
          const price = priceElements[i].textContent.trim();
          const img = imgElements[i].getAttribute("src");
          items.push({ name, price, img });
        }

        return items;
      });

      return items;
    }

    let previousHeight = await page.evaluate("document.body.scrollHeight");

    while (true) {
      await page.evaluate(`window.scrollTo(0, ${previousHeight})`);
      await page.waitForTimeout(3000);
      const newHeight = await page.evaluate("document.body.scrollHeight");

      if (newHeight === previousHeight) {
        break;
      }

      previousHeight = newHeight;

      const loadMoreButton = await page.$(
        "#dataTable > div.prodListBtn > div.prodListBtn-w > a"
      );

      if (loadMoreButton) {
        await loadMoreButton.click();
        await page.waitForTimeout(5000);
      }
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
