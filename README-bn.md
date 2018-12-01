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

আমরা [কন্ট্রিবিউশানকে](#contributing) স্বাগতম জানাই!

### সিস্টেম ডিজাইন ইন্টারভিউয়ের জন্য প্রস্তুতি

এছাড়াও কোডিং ইন্টারভিউয়ের জন্য অনেক টেক কোম্পানিতে **টেকনিক্যাল ইন্টারভিউ প্রক্রিয়ায়** সিস্টেম ডিজাইন একটি **আবশ্যিক উপাদান**

**সাধারণ সিস্টেম ডিজাইন ইন্টারভিউ প্রশ্নগুলো অনুশীলন করুন** এবং **নমুনা সমাধানের** সাথে নিজের সমাধান **তুলনা** করুন: আলোচনা করুন, কোড করুন এবং ডায়াগ্রাম ব্যবহার করতে শিখুন

ইন্টারভিউ প্রস্তুতির জন্য আরও কিছু টপিক নিম্নে দেওয়া হল:

* [শিক্ষার গাইডলাইন](#study-guide)
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

* ভুল সংশোধন (ফিক্স এরর)
* সেকশনের উন্নয়ন
* নতুন সেকশন সংযোজন
* [অনুবাদ](https://github.com/donnemartin/system-design-primer/issues/28)

কিছু বিষয় আমাদের আরও ঝালাই করতে হবে যা আপনি [উন্নয়নাধীন](#under-development) সেকশনে এ পাবেন।

[কন্ট্রিবিউটিং গাইডলাইন](CONTRIBUTING.md) পর্যবেক্ষণ করুন।

## সিস্টেম ডিজাইনের বিষয়গুলোর সূচি

> বিভিন্ন সিস্টেম ডিজাইনের বিষয়গুলোর সুবিধা-অসুবিধাসহ সারমর্ম   **সবকিছুর ভাল-মন্দ দিক আছে**.
>
> প্রতিটি সেকশনে কিছু লিঙ্ক রয়েছে যা আপনাকে আরও গভীর রিসোর্সে নিয়ে যাবে।

<p align="center">
  <img src="http://i.imgur.com/jrUBAF7.png">
  <br/>
</p>

* [ সিস্টেম ডিজাইন টপিকঃ ভূমিকা](#system-design-topics-start-here)
    * [ধাপ ১ঃ স্কেলেবিলিটি ভিডিও লেকচারগুলো পর্যালোচনা](#step-1-review-the-scalability-video-lecture)
    * [ধাপ ২ঃ স্কেলেবিলিটি আর্টিকেল পর্যালোচনা](#step-2-review-the-scalability-article)
    * [পরবর্তী ধাপ](#next-steps)
* [পারফরমেন্স বনাম স্কেলেবিলিটি](#performance-vs-scalability)
* [ল্যাটেন্সি বনাম থ্রোপুট](#latency-vs-throughput)
* [এভাইলিবিলিটি বনাম কন্সিস্টেন্সি/দৃঢ়তা](#availability-vs-consistency)
    * [সিএপি তত্ত্ব](#cap-theorem)
        * [সিপি - কন্সিস্টেন্সি এবং পারটিশান টলারেন্স](#cp---consistency-and-partition-tolerance)
        * [এপি - এভাইলিবিলিটি এবং পারটিশান টলারেন্স](#ap---availability-and-partition-tolerance)
* [কন্সিস্টেন্সি ধরণসমূহ](#consistency-patterns)
    * [দুর্বল কন্সিস্টেন্সি](#weak-consistency)
    * [ইভেনচুয়াল কন্সিস্টেন্সি](#eventual-consistency)
    * [সবল কন্সিস্টেন্সি](#strong-consistency)
* [এভাইলিবিলিটি ধরণসমূহ](#availability-patterns)
    * [ফেইল-ওভার](#fail-over)
    * [রেপ্লিকেশান](#replication)
* [ডোমেইন নাম সিস্টেম](#domain-name-system)
* [কন্টেন্ট ডেলিভারি নেটওয়ার্ক](#content-delivery-network)
    * [পুশ সিডিএন](#push-cdns)
    * [পুল সিডিএন](#pull-cdns)
* [লোড ব্যালেন্সার](#load-balancer)
    * [একটিভ-পেসিভ](#active-passive)
    * [একটিভ-একটিভ](#active-active)
    * [লেয়ার ৪ লোড ব্যালান্সিং](#layer-4-load-balancing)
    * [লেয়ার ৭ লোড ব্যালান্সিং](#layer-7-load-balancing)
    * [অনুভূমিক স্কেলিং](#horizontal-scaling)
* [রিভার্স প্রক্সি (ওয়েব সার্ভার)](#reverse-proxy-web-server)
    * [লোড ব্যালেন্সার বনাম রিভার্স প্রক্সি](#load-balancer-vs-reverse-proxy)
* [এপ্লিকেশন লেয়ার](#application-layer)
    * [মাইক্রোসার্ভিসেস](#microservices)
    * [সার্ভিস ডিসকভারি](#service-discovery)
* [ডাটাবেজ](#database)
    * [রিলেশানাল ডাটাবেজ ম্যানেজমেন্ট সিস্টেম(RDBMS)](#relational-database-management-system-rdbms)
        * [মাস্টার-স্লেভ রেপ্লিকেশন](#master-slave-replication)
        * [মাস্টার-মাস্টার রেপ্লিকেশন](#master-master-replication)
        * [ফেডারেশন](#federation)
        * [শারদিং](#sharding)
        * [ডিনরমালিজেশন](#denormalization)
        * [এস কিউ এল(SQL) টিউনিং](#sql-tuning)
    * [নো এস কিউ এল (NoSQL)](#nosql)
        * [কি-ভেলু স্টোর](#key-value-store)
        * [ডকুমেন্ট স্টোর](#document-store)
        * [ওয়াইড কলাম স্টোর](#wide-column-store)
        * [গ্রাফ ডাটাবেজ](#graph-database)
    * [এস কিউ এল(SQL) অথবা  নো এস কিউ এল (NoSQL](#sql-or-nosql)
* [কেশ](#cache)
    * [ক্লাইন্ট কেশিং](#client-caching)
    * [সি ডি এন(CDN) কেশিং](#cdn-caching)
    * [ওয়েব সার্ভার কেশিং](#web-server-caching)
    * [ডাটাবেজ কেশিং](#database-caching)
    * [এপ্লিকেশন কেশিং](#application-caching)
    * [ডাটাবেজের কোয়েরি লেভেলে কেশিং](#caching-at-the-database-query-level)
    * [অবজেক্ট লেভেলে কেশিং](#caching-at-the-object-level)
    * [কখন কেশ আপডেট করবেন](#when-to-update-the-cache)
        * [কেশ-এসাইড](#cache-aside)
        * [রাইট-থ্রু](#write-through)
        * [রাইট-বিহাইন্ড (রাইট-ব্যাক)](#write-behind-write-back)
        * [রিফ্রেশ-এহেড](#refresh-ahead)
* [এসিঙ্ক্রনিসম (Asynchronism)](#asynchronism)
    * [মেসেজ কিউস](#message-queues)
    * [টাস্ক কিউস](#task-queues)
    * [ব্যাক প্রেশার](#back-pressure)
* [কমুনিকেশন](#communication)
    * [ট্রান্সমিশন কন্ট্রোল প্রটোকল (TCP)](#transmission-control-protocol-tcp)
    * [ইউজার ডায়াগ্রাম প্রটোকল (UDP)](#user-datagram-protocol-udp)
    * [রিমোট প্রসিডিউর কল (RPC)](#remote-procedure-call-rpc)
    * [রিপ্রেসেন্টেশনাল স্টেট ট্রান্সফার (REST)](#representational-state-transfer-rest)
* [সিকুরিটি](#security)
* [উপাঙ্গ](#appendix)
    * [দুটি টেবিলের পাওয়ারস](#powers-of-two-table)
    * [লেটেন্সি সংখ্যা যা সব প্রোগ্রামারের জানা উচিত](#latency-numbers-every-programmer-should-know)
    * [আরও সিস্টেম ডিজাইন ইন্টারভিউ প্রশ্ন](#additional-system-design-interview-questions)
    * [বাস্তব জীবনের আর্কিটেকচার](#real-world-architectures)
    * [কোম্পানির আর্কিটেকচার](#company-architectures)
    * [কোম্পানির ইঞ্জিনিয়ারিং ব্লগ](#company-engineering-blogs)
* [উন্নয়নাধীন](#under-development)
* [ক্রেডিট](#credits)
* [যোগাযোগ করুন](#contact-info)
* [লাইসেন্স](#license)
