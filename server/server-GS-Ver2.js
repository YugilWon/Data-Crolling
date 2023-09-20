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
      // "http://gs25.gsretail.com/gscvs/ko/products/youus-different-service"
      "http://gs25.gsretail.com/gscvs/ko/products/youus-freshfood"
    );

    // await page.evaluate(() => {
    //   const productDrinkButton = document.querySelector("#productDrink > span");
    //   if (productDrinkButton) {
    //     productDrinkButton.click();
    //   }
    // });

    await page.waitForTimeout(3000);

    async function scrapeData() {
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
