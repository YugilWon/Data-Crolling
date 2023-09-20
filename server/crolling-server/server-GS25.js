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
      "http://gs25.gsretail.com/gscvs/ko/products/youus-freshfood#;"
    );

    async function scrapeData() {
      const items = [];

      while (true) {
        const nameElements = await page.$$(
          "#contents > div.yCmsComponent.span-24.section1.cms_disp-img_slot > div > div > div > div > div > div.tblwrap.mt20 > div.tab_cont.on > ul > li > div > p.tit"
        );
        const priceElements = await page.$$(
          "#contents > div.yCmsComponent.span-24.section1.cms_disp-img_slot > div > div > div > div > div > div.tblwrap.mt20 > div.tab_cont.on > ul > li > div > p.price > span"
        );
        const imgElements = await page.$$(
          "#contents > div.yCmsComponent.span-24.section1.cms_disp-img_slot > div > div > div > div > div > div.tblwrap.mt20 > div.tab_cont.on > ul > li > div > p.img > img"
        );

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

        const nextPageButton = await page.$(
          "#contents > div.yCmsComponent.span-24.section1.cms_disp-img_slot > div > div > div > div > div > div.tblwrap.mt20 > div.paging > span > a.on"
        );

        if (nextPageButton) {
          const pageNumber = await nextPageButton.evaluate((element) =>
            parseInt(element.textContent)
          );

          if (pageNumber === 13) {
            break;
          }
        } else {
          break;
        }

        const loadMoreButton = await page.$(
          "#contents > div.yCmsComponent.span-24.section1.cms_disp-img_slot > div > div > div > div > div > div.tblwrap.mt20 > div.paging > a.next"
        );

        await loadMoreButton.click();
        await page.waitForTimeout(1000);
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
