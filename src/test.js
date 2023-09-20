const axios = require("axios");
const cheerio = require("cheerio");
const log = console.log;

const getHtml = async () => {
  try {
    return await axios.get(
      // "https://cu.bgfretail.com/product/view.do?category=product&gdIdx=17686"
      "https://cu.bgfretail.com/product/product.do?category=product&depth2=4&sf=N"
    );
  } catch (error) {
    console.error(error);
  }
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

getHtml()
  .then(async (html) => {
    const $ = cheerio.load(html.data);
    await sleep(3000);
    const data = {
      mainContents: $(
        "#dataTable > div.prodListWrap > ul > li:nth-child(1) > div > div.prod_wrap > div.prod_text > div.name > p"
      ).text(),
    };
    return data;
  })
  .then((res) => log(res));
