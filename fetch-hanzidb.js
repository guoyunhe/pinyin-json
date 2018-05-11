const fs = require("fs");
const cheerio = require("cheerio");
const axios = require("axios");
const _ = require("lodash");

const hanzi_pinyin_table = {};
const hanzi_no_tone_pinyin_table = {};
const pinyin_hanzi_table = {};
const no_tone_pinyin_hanzi_table = {};

let hanzi_array;

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
      $("table tr:not(:first-child)").each(function() {
        const hanzi = $(this)
          .find("td:first-child")
          .text();
        console.log(hanzi);
        const pinyin = $(this)
          .find("td:nth-child(2)")
          .text();
        console.log(pinyin);

        add_hanzi_pinyin(hanzi, pinyin);
      });

      fetch_hanzidb(page + 1);
    })
    .catch(function(response) {
      console.log(response.status);
      hanzi_array = Object.keys(hanzi_pinyin_table);
      fetch_polyphone();
    });
}

/**
 * Fetch pinyin of polyphones.
 *
 * @param {number} index Array index of hanzi_array
 */
function fetch_polyphone(index = 0) {
  if (index >= hanzi_array.length) {
    save_json_files();
    return;
  }
  const hanzi = hanzi_array[index];
  console.log(hanzi);
  axios
    .get("http://hanzidb.org/character/" + encodeURIComponent(hanzi))
    .then(function(response) {
      const $ = cheerio.load(response.data);
      $(".ceent > div:first-child span").each(function() {
        const pinyin = $(this)
          .text()
          .toLocaleLowerCase();
        console.log(pinyin);
        add_hanzi_pinyin(hanzi, pinyin);
      });
      fetch_polyphone(index + 1);
    })
    .catch(function(response) {
      console.log("Error while fetching data of " + hanzi);
    });
}

/**
 * Add Hanzi-Pinyin pair to dictionary
 *
 * @param {string} hanzi
 * @param {string} pinyin
 */
function add_hanzi_pinyin(hanzi, pinyin) {
  const no_tone_pinyin = remove_tone(pinyin);

  if (!hanzi_pinyin_table[hanzi]) {
    hanzi_pinyin_table[hanzi] = [];
  }
  hanzi_pinyin_table[hanzi] = _.union(hanzi_pinyin_table[hanzi], [pinyin]);

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
  pinyin_hanzi_table[pinyin] = _.union(pinyin_hanzi_table[pinyin], [hanzi]);

  if (!no_tone_pinyin_hanzi_table[no_tone_pinyin]) {
    no_tone_pinyin_hanzi_table[no_tone_pinyin] = [];
  }
  no_tone_pinyin_hanzi_table[no_tone_pinyin] = _.union(
    no_tone_pinyin_hanzi_table[no_tone_pinyin],
    [hanzi]
  );
}

function save_json_files() {
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
