*[English](README.md) ∙ [日本語](README-ja.md) ∙ [简体中文](README-zh-Hans.md) ∙ [繁體中文](README-zh-TW.md) | [Arabic](https://github.com/donnemartin/system-design-primer/issues/170) ∙ [Brazilian Portuguese](https://github.com/donnemartin/system-design-primer/issues/40) ∙ [German](https://github.com/donnemartin/system-design-primer/issues/186) ∙ [Greek](https://github.com/donnemartin/system-design-primer/issues/130) ∙ [Italian](https://github.com/donnemartin/system-design-primer/issues/104) ∙ [Korean](https://github.com/donnemartin/system-design-primer/issues/102) ∙ [Persian](https://github.com/donnemartin/system-design-primer/issues/110) ∙ [Polish](https://github.com/donnemartin/system-design-primer/issues/68) ∙ [Russian](https://github.com/donnemartin/system-design-primer/issues/87) ∙ [Spanish](https://github.com/donnemartin/system-design-primer/issues/136) ∙ [Thai](https://github.com/donnemartin/system-design-primer/issues/187) ∙ [Turkish](https://github.com/donnemartin/system-design-primer/issues/39) ∙ [Vietnamese](https://github.com/donnemartin/system-design-primer/issues/127) . [Bengali](https://github.com/donnemartin/system-design-primer/issues220) | [Add Translation](https://github.com/donnemartin/system-design-primer/issues/28)*

# সিস্টেম ডিজাইন পাঠ

<p align="center">
  <img src="http://i.imgur.com/jj3A5N8.png">
  <br/>
</p>

# অনুপ্রেরণা

> বড়-স্কেলের সিস্টেম ডিজাইন সম্বন্ধে ধারণা ।
>
> চাকুরির ইন্টারভিউতে সিস্টেম ডিজাইন বিষয়ক প্রশ্নের প্রস্তুতি ।

### বড়-স্কেলের সিস্টেম ডিজাইন সম্বন্ধে ধারণা

স্কেলেবেল সিস্টেম ডিজাইন সম্বন্ধে ধারণা আপনাকে একজন ভাল প্রকৌশলী হতে সাহায্য করবে।

সিস্টেম ডিজাইন একটি বিশদ বিষয় । সিস্টেম ডিজাইন নীতি নিয়ে **সুবিশাল তথ্যাদি ইন্টারনেটে ছড়িয়ে আছে।**

এখানে তথ্যাদিগুলো সুসংগঠিতভাবে সংগৃহীত হয়েছে যা আপনাকে স্কেলেবেল সিস্টেম সম্বন্ধে জানতে সাহায্য করবে ।

### ওপেন সোর্স জনগোষ্ঠী থেকে শিক্ষা

এটি একটি অবিরাম সংযোজিত, ওপেন সোর্স প্রোজেক্ট।

আমরা [কন্ট্রিবিউশানকে](#contributing)  স্বাগতম জানাই!

### সিস্টেম ডিজাইন ইন্টারভিউয়ের জন্য প্রস্তুতি

এছাড়াও কোডিং ইন্টারভিউয়ের জন্য অনেক টেক কোম্পানিতে **টেকনিক্যাল ইন্টারভিউ প্রক্রিয়ায়** সিস্টেম ডিজাইন একটি **আবশ্যিক উপাদান**

**সাধারণ সিস্টেম ডিজাইন ইন্টারভিউ প্রশ্নগুলো অনুশীলন করুন** এবং **নমুনা সমাধানের** সাথে নিজের সমাধান **তুলনা** করুন: আলোচনা করুন, কোড করুন এবং ডায়াগ্রাম ব্যবহার করতে শিখুন

ইন্টারভিউ প্রস্তুতির জন্য আরও কিছু টপিক নিম্নে দেওয়া হল:

* [শিক্ষার পথপ্রদর্শক](#study-guide)
* [কিভাবে সিস্টেম ডিজাইন ইন্টারভিউ প্রশ্ন মোকাবেলা করবেন](#how-to-approach-a-system-design-interview-question)
* [সিস্টেম ডিজাইন ইন্টারভিউ প্রশ্ন, **সমাধানসহ**](#system-design-interview-questions-with-solutions)
* [অবজেক্ট ওরিয়েন্টেড ডিজাইন ইন্টারভিউ প্রশ্ন, **সমাধানসহ**](#object-oriented-design-interview-questions-with-solutions)
* [আরও সিস্টেম ডিজাইন ইন্টারভিউ প্রশ্ন](#additional-system-design-interview-questions)

## Anki flashcards

<p align="center">
  <img src="http://i.imgur.com/zdCAkB3.png">
  <br/>
</p>

প্রদত্ত [Anki flashcard decks](https://apps.ankiweb.net/) স্থান পুনরাবৃত্তি করে আপনাকে সিস্টেম ডিজাইনের মুল ধারণা বুঝতে সাহায্য করবে।

 [সিস্টেম ডিজাইন ডেক](https://github.com/donnemartin/system-design-primer/tree/master/resources/flash_cards/System%20Design.apkg)
* [সিস্টেম ডিজাইন অনুশীলনী ডেক](https://github.com/donnemartin/system-design-primer/tree/master/resources/flash_cards/System%20Design%20Exercises.apkg)
* [অবজেক্ট ওরিয়েন্টেড ডিজাইন অনুশীলনী ডেক](https://github.com/donnemartin/system-design-primer/tree/master/resources/flash_cards/OO%20Design.apkg)

সামনের টপিক গুলো পড়তে এটি অনেক সাহায্য করবে।

### কোডিং রিসোর্স: ইন্টারেক্টিভ কোডিং চ্যালেঞ্জ

আপনি কি [**কোডিং ইন্টারভিয়ের**](https://github.com/donnemartin/interactive-coding-challenges) জন্য রিসোর্স খুঁজছেন?

<p align="center">
  <img src="http://i.imgur.com/b4YtAEN.png">
  <br/>
</p>

আপনি [**ইন্টারেক্টিভ কোডিং চ্যালেঞ্জ**](https://github.com/donnemartin/interactive-coding-challenges) নামের অণু-প্রোজেক্টটি দেখতে পারেন, যাতে আরও Anki ডেক রয়েছে।

* [কোডিং ডেক](https://github.com/donnemartin/interactive-coding-challenges/tree/master/anki_cards/Coding.apkg)

## কন্ট্রিবিউটিং

> কমিউনিটি থেকে শিক্ষা নিন

বিনা দ্বিধায় পুল রিকুয়েস্ট সাবমিট করে আমাদের সাহায্য করুন:

* ভুল সংশোধন (ফিক্স এরর)
* সেকশনের উন্নয়ন
* নতুন সেকশন সংযোজন
* [অনুবাদ](https://github.com/donnemartin/system-design-primer/issues/28)