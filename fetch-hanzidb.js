const fs = require("fs");
const cheerio = require("cheerio");
const axios = require("axios");

const hanzi_pinyin_table = {};
const pinyin_hanzi_table = {};

function fetch_hanzidb(page = 1) {
  axios
    .get("http://hanzidb.org/character-list/by-frequency", {
      params: {
        page
      }
    })
    .then(function(response) {
      console.log("Page " + page);
      const $ = cheerio.load(response.data);
      $("table tr:not(:first-child)").each(function(index, element) {
        const hanzi = $(this)
          .find("td:first-child")
          .text();
        console.log(hanzi);
        const pinyin = $(this)
          .find("td:nth-child(2)")
          .text();
        console.log(pinyin);

        if (!hanzi_pinyin_table[hanzi]) {
          hanzi_pinyin_table[hanzi] = [];
        }
        hanzi_pinyin_table[hanzi].push(pinyin);

        if (!pinyin_hanzi_table[pinyin]) {
          pinyin_hanzi_table[pinyin] = [];
        }
        pinyin_hanzi_table[pinyin].push(hanzi);
      });
      fetch_hanzidb(page + 1);
    })
    .catch(function() {
      // TODO dump data to json files
      fs.writeFile(
        "hanzi-pinyin-table.json",
        JSON.stringify(hanzi_pinyin_table),
        "utf8"
      );

      fs.writeFile(
        "pinyin-hanzi-table.json",
        JSON.stringify(pinyin_hanzi_table),
        "utf8"
      );
    });
}

fetch_hanzidb();
