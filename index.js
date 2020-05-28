const fs = require("fs");
const cheerio = require("cheerio");
const request = require("request");
const async = require("async");
const Promise = require("promise");

const category = [
  "Travel",
  "Food & Beverages",
  "Lifestyle",
  "Gadget & Entertainment",
  "Others",
  "Daily Needs",
];

async function getCategory(category, title) {
  return new Promise(function (resolve) {
    const urls = [];
    let index = 0;
    const dataPromise = [];
    while (index < 11) {
      urls.push(
        `https://www.bankmega.com/ajax.promolainnya.php?product=&subcat=${category}&page=${index}`
      );
      index++;
    }
    urls.map((url) => dataPromise.push(getDataByUrl(url)));
    Promise.all(dataPromise).then((arrays) => {
      const data = [];
      arrays.map((array) => {
        array.map((object) => {
          data.push(object);
        });
      });
      resolve({
        [title]: data,
      });
    });
  });
}

async function getDataByUrl(url) {
  return new Promise(function (resolve, reject) {
    request({ method: "GET", url }, function (err, _res, body) {
      if (err) return console.error(err);
      let element = cheerio.load(body);
      let data = element("#imgClass")
        .toArray()
        .map((value) => {
          let model = {
            title: value.attribs.title,
          };
          return model;
        });
      resolve(data);
    });
  });
}

async function main() {
  const dataPromise = [];
  category.map((value, index) => {
    dataPromise.push(getCategory(index + 1, value));
  });
  Promise.all(dataPromise).then((arrays) =>
    arrays.map((array, index) => {
      fs.writeFile(
        `./category/cat${index + 1}.json`,
        JSON.stringify(array, null, "\t"),
        function (err, success) {
          if (err) throw err;
          console.log(`Loading Category ${index + 1}!\n`);
        }
      );
    })
  );
}

main();
