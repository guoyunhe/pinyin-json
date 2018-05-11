const fs = require("fs");
const cheerio = require("cheerio");
const axios = require("axios");
const _ = require("lodash");

const hanzi_pinyin_table = {};
const hanzi_no_tone_pinyin_table = {};
const pinyin_hanzi_table = {};
const no_tone_pinyin_hanzi_table = {};

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
        const no_tone_pinyin = remove_tone(pinyin);

        if (!hanzi_pinyin_table[hanzi]) {
          hanzi_pinyin_table[hanzi] = [];
        }
        hanzi_pinyin_table[hanzi].push(pinyin);

        if (!hanzi_no_tone_pinyin_table[hanzi]) {
          hanzi_no_tone_pinyin_table[hanzi] = [];
        }
        hanzi_no_tone_pinyin_table[hanzi] = _.union(
          hanzi_no_tone_pinyin_table[hanzi],
          [no_tone_pinyin]
        );

        if (!pinyin_hanzi_table[pinyin]) {
          pinyin_hanzi_table[pinyin] = [];
        }
        pinyin_hanzi_table[pinyin].push(hanzi);

        if (!no_tone_pinyin_hanzi_table[no_tone_pinyin]) {
          no_tone_pinyin_hanzi_table[no_tone_pinyin] = [];
        }
        no_tone_pinyin_hanzi_table[no_tone_pinyin] = _.union(
          no_tone_pinyin_hanzi_table[no_tone_pinyin],
          [hanzi]
        );
      });
      fetch_hanzidb(page + 1);
    })
    .catch(function() {
      fs.writeFile(
        "hanzi-pinyin-table.json",
        JSON.stringify(hanzi_pinyin_table),
        "utf8",
        function(err) {
          if (err) console.log(err);
        }
      );

      fs.writeFile(
        "hanzi-no-tone-pinyin-table.json",
        JSON.stringify(hanzi_no_tone_pinyin_table),
        "utf8",
        function(err) {
          if (err) console.log(err);
        }
      );

      fs.writeFile(
        "pinyin-hanzi-table.json",
        JSON.stringify(pinyin_hanzi_table),
        "utf8",
        function(err) {
          if (err) console.log(err);
        }
      );

      fs.writeFile(
        "no-tone-pinyin-hanzi-table.json",
        JSON.stringify(no_tone_pinyin_hanzi_table),
        "utf8",
        function(err) {
          if (err) console.log(err);
        }
      );
    });
}

/**
 * Remove tone from pinyin string
 * @param {string} pinyin String with tone 'wǒ'
 * @return {string} String without tone, like 'wo'
 */
function remove_tone(pinyin) {
  let output = pinyin;
  output = output.replace(/[āáǎà]/, "a");
  output = output.replace(/[ōóǒò]/, "o");
  output = output.replace(/[ēéěè]/, "e");
  output = output.replace(/[īǐíì]/, "i");
  output = output.replace(/[ūúǔù]/, "u");
  output = output.replace(/[ǖǘǚǜ]/, "v");
  return output;
}

fetch_hanzidb();
