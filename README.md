# pinyin-json

JSON data for Chinese/Hanyu Pinyin. Only contains common characters so it is samll and fast for daily usage.

JSON 格式的中文拼音数据。只包含常用汉字，因此小巧快速，适合日常使用。

* Pinyin table 拼音表

  ```json
  ["a", "o", "e", "ê", "ai", "ei", "ang", "eng", "er", "yi", "..."]
  ```

* Pinyin-Chinese table 拼音-汉字码表

  ```json
  {
    "a": ["啊", "阿"],
    "he": ["和", "喝", "何", "合", "贺"]
  }
  ```

* Chinese-Pinyin table 汉字-拼音码表

  ```json
  {
    "啊": ["a"],
    "阿": ["a", "e"],
    "和": ["he", "huo"],
    "...": "..."
  }
  ```

* Phrases fetched from Chinese Wikipedia, Chinese Wikitionary. 从维基百科和维基词典获取的词汇。

  ```json
  ["我们", "世界", "Linux", "V2火箭"]
  ```

GNU General Public License version 3
