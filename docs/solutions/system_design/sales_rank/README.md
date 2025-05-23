# Design Amazon's sales rank by category feature

*Note: This document links directly to relevant areas found in the [system design topics](https://github.com/ido777/system-design-primer-update#index-of-system-design-topics) to avoid duplication.  Refer to the linked content for general talking points, tradeoffs, and alternatives.*


Adding clarifying questions is the first step in the process.
Remember your goal is to understand the problem and establish the design scope.

### What questions should you ask to clarify the problem?


Here is an example of the dialog you could have with the interviewer:

**Example dialog with your interviewer:**


**Interviewer**: Design Amazon's sales rank by category feature

**Candidate**: To clarify and understand the scope, may I start with a few quick questions?

**Interviewer**: Yes, please.

**Candidate**: What are the **main features, users, and use cases** of the system?

**Interviewer**: The system will calculate the sales rank of products by category.  Users will be able to view the sales rank of products by category.

**Candidate**: What is the **expected traffic**?

**Interviewer**: The system will be able to handle 100 million requests per day.

**Candidate**: What is the **expected read/write ratio**?

**Interviewer**: The system will be able to handle 100:1 read/write ratio.

**Candidate**: What is the **expected data size**?

**Interviewer**: The system will be able to handle 100 million products.



### Use cases

#### We'll scope the problem to handle only the following use case

* **Service** calculates the past week's most popular products by category
* **User** views the past week's most popular products by category
* **Service** has high availability

#### Out of scope

* The general e-commerce site
    * Design components only for calculating sales rank

### Constraints and assumptions

#### State assumptions

* Traffic is not evenly distributed
* Items can be in multiple categories
* Items cannot change categories
* There are no subcategories ie `foo/bar/baz`
* Results must be updated hourly
    * More popular products might need to be updated more frequently
* 10 million products
* 1000 categories
* 1 billion transactions per month
* 100 billion read requests per month
* 100:1 read to write ratio

#### Calculate usage

**Clarify with your interviewer if you should run back-of-the-envelope usage calculations.**

* Size per transaction:
    * `created_at` - 5 bytes
    * `product_id` - 8 bytes
    * `category_id` - 4 bytes
    * `seller_id` - 8 bytes
    * `buyer_id` - 8 bytes
    * `quantity` - 4 bytes
    * `total_price` - 5 bytes
    * Total: ~40 bytes
* 40 GB of new transaction content per month
    * 40 bytes per transaction * 1 billion transactions per month
    * 1.44 TB of new transaction content in 3 years
    * Assume most are new transactions instead of updates to existing ones
* 400 transactions per second on average
* 40,000 read requests per second on average

Handy conversion guide:

* 2.5 million seconds per month
* 1 request per second = 2.5 million requests per month
* 40 requests per second = 100 million requests per month
* 400 requests per second = 1 billion requests per month

## Step 2: Create a high level design

> Outline a high level design with all important components.

![Imgur](http://i.imgur.com/vwMa1Qu.png)

## Step 3: Design core components

> Dive into details for each core component.

### Use case: Service calculates the past week's most popular products by category

We could store the raw **Sales API** server log files on a managed **Object Store** such as Amazon S3, rather than managing our own distributed file system.

**Clarify with your interviewer the expected amount, style, and purpose of the code you should write**.

We'll assume this is a sample log entry, tab delimited:

```
timestamp   product_id  category_id    qty     total_price   seller_id    buyer_id
t1          product1    category1      2       20.00         1            1
t2          product1    category2      2       20.00         2            2
t2          product1    category2      1       10.00         2            3
t3          product2    category1      3        7.00         3            4
t4          product3    category2      7        2.00         4            5
t5          product4    category1      1        5.00         5            6
...
```

The **Sales Rank Service** could use **MapReduce**, using the **Sales API** server log files as input and writing the results to an aggregate table `sales_rank` in a **SQL Database**.  We should discuss the [use cases and tradeoffs between choosing SQL or NoSQL](https://github.com/ido777/system-design-primer-update#sql-or-nosql).

We'll use a multi-step **MapReduce**:

* **Step 1** - Transform the data to `(category, product_id), sum(quantity)`
* **Step 2** - Perform a distributed sort

```python
class SalesRanker(MRJob):

    def within_past_week(self, timestamp):
        """Return True if timestamp is within past week, False otherwise."""
        ...

    def mapper(self, _ line):
        """Parse each log line, extract and transform relevant lines.

        Emit key value pairs of the form:

        (category1, product1), 2
        (category2, product1), 2
        (category2, product1), 1
        (category1, product2), 3
        (category2, product3), 7
        (category1, product4), 1
        """
        timestamp, product_id, category_id, quantity, total_price, seller_id, \
            buyer_id = line.split('\t')
        if self.within_past_week(timestamp):
            yield (category_id, product_id), quantity

    def reducer(self, key, value):
        """Sum values for each key.

        (category1, product1), 2
        (category2, product1), 3
        (category1, product2), 3
        (category2, product3), 7
        (category1, product4), 1
        """
        yield key, sum(values)

    def mapper_sort(self, key, value):
        """Construct key to ensure proper sorting.

        Transform key and value to the form:

        (category1, 2), product1
        (category2, 3), product1
        (category1, 3), product2
        (category2, 7), product3
        (category1, 1), product4

        The shuffle/sort step of MapReduce will then do a
        distributed sort on the keys, resulting in:

        (category1, 1), product4
        (category1, 2), product1
        (category1, 3), product2
        (category2, 3), product1
        (category2, 7), product3
        """
        category_id, product_id = key
        quantity = value
        yield (category_id, quantity), product_id

    def reducer_identity(self, key, value):
        yield key, value

    def steps(self):
        """Run the map and reduce steps."""
        return [
            self.mr(mapper=self.mapper,
                    reducer=self.reducer),
            self.mr(mapper=self.mapper_sort,
                    reducer=self.reducer_identity),
        ]
```

The result would be the following sorted list, which we could insert into the `sales_rank` table:

```
(category1, 1), product4
(category1, 2), product1
(category1, 3), product2
(category2, 3), product1
(category2, 7), product3
```

The `sales_rank` table could have the following structure:

```
id int NOT NULL AUTO_INCREMENT
category_id int NOT NULL
total_sold int NOT NULL
product_id int NOT NULL
PRIMARY KEY(id)
FOREIGN KEY(category_id) REFERENCES Categories(id)
FOREIGN KEY(product_id) REFERENCES Products(id)
```

We'll create an [index](https://github.com/ido777/system-design-primer-update#use-good-indices) on `id `, `category_id`, and `product_id` to speed up lookups (log-time instead of scanning the entire table) and to keep the data in memory.  Reading 1 MB sequentially from memory takes about 250 microseconds, while reading from SSD takes 4x and from disk takes 80x longer.<sup><a href=https://github.com/ido777/system-design-primer-update#latency-numbers-every-programmer-should-know>1</a></sup>

### Use case: User views the past week's most popular products by category

* The **Client** sends a request to the **Web Server**, running as a [reverse proxy](https://github.com/ido777/system-design-primer-update#reverse-proxy-web-server)
* The **Web Server** forwards the request to the **Read API** server
* The **Read API** server reads from the **SQL Database** `sales_rank` table

We'll use a public [**REST API**](https://github.com/ido777/system-design-primer-update#representational-state-transfer-rest):

```
$ curl https://amazon.com/api/v1/popular?category_id=1234
```

Response:

```
{
    "id": "100",
    "category_id": "1234",
    "total_sold": "100000",
    "product_id": "50",
},
{
    "id": "53",
    "category_id": "1234",
    "total_sold": "90000",
    "product_id": "200",
},
{
    "id": "75",
    "category_id": "1234",
    "total_sold": "80000",
    "product_id": "3",
},
```

For internal communications, we could use [Remote Procedure Calls](https://github.com/ido777/system-design-primer-update#remote-procedure-call-rpc).

## Step 4: Scale the design

> Identify and address bottlenecks, given the constraints.

![Imgur](http://i.imgur.com/MzExP06.png)

**Important: Do not simply jump right into the final design from the initial design!**

State you would 1) **Benchmark/Load Test**, 2) **Profile** for bottlenecks 3) address bottlenecks while evaluating alternatives and trade-offs, and 4) repeat.  See [Design a system that scales to millions of users on AWS](../scaling_aws/README.md) as a sample on how to iteratively scale the initial design.

It's important to discuss what bottlenecks you might encounter with the initial design and how you might address each of them.  For example, what issues are addressed by adding a **Load Balancer** with multiple **Web Servers**?  **CDN**?  **Master-Slave Replicas**?  What are the alternatives and **Trade-Offs** for each?

We'll introduce some components to complete the design and to address scalability issues.  Internal load balancers are not shown to reduce clutter.

*To avoid repeating discussions*, refer to the following [system design topics](https://github.com/ido777/system-design-primer-update#index-of-system-design-topics) for main talking points, tradeoffs, and alternatives:

* [DNS](https://github.com/ido777/system-design-primer-update#domain-name-system)
* [CDN](https://github.com/ido777/system-design-primer-update#content-delivery-network)
* [Load balancer](https://github.com/ido777/system-design-primer-update#load-balancer)
* [Horizontal scaling](https://github.com/ido777/system-design-primer-update#horizontal-scaling)
* [Web server (reverse proxy)](https://github.com/ido777/system-design-primer-update#reverse-proxy-web-server)
* [API server (application layer)](https://github.com/ido777/system-design-primer-update#application-layer)
* [Cache](https://github.com/ido777/system-design-primer-update#cache)
* [Relational database management system (RDBMS)](https://github.com/ido777/system-design-primer-update#relational-database-management-system-rdbms)
* [SQL write master-slave failover](https://github.com/ido777/system-design-primer-update#fail-over)
* [Master-slave replication](https://github.com/ido777/system-design-primer-update#master-slave-replication)
* [Consistency patterns](https://github.com/ido777/system-design-primer-update#consistency-patterns)
* [Availability patterns](https://github.com/ido777/system-design-primer-update#availability-patterns)

The **Analytics Database** could use a data warehousing solution such as Amazon Redshift or Google BigQuery.

We might only want to store a limited time period of data in the database, while storing the rest in a data warehouse or in an **Object Store**.  An **Object Store** such as Amazon S3 can comfortably handle the constraint of 40 GB of new content per month.

To address the 40,000 *average* read requests per second (higher at peak), traffic for popular content (and their sales rank) should be handled by the **Memory Cache** instead of the database.  The **Memory Cache** is also useful for handling the unevenly distributed traffic and traffic spikes.  With the large volume of reads, the **SQL Read Replicas** might not be able to handle the cache misses.  We'll probably need to employ additional SQL scaling patterns.

400 *average* writes per second (higher at peak) might be tough for a single **SQL Write Master-Slave**, also pointing to a need for additional scaling techniques.

SQL scaling patterns include:

* [Federation](https://github.com/ido777/system-design-primer-update#federation)
* [Sharding](https://github.com/ido777/system-design-primer-update#sharding)
* [Denormalization](https://github.com/ido777/system-design-primer-update#denormalization)
* [SQL Tuning](https://github.com/ido777/system-design-primer-update#sql-tuning)

We should also consider moving some data to a **NoSQL Database**.

## Additional talking points

> Additional topics to dive into, depending on the problem scope and time remaining.

#### NoSQL

* [Key-value store](https://github.com/ido777/system-design-primer-update#key-value-store)
* [Document store](https://github.com/ido777/system-design-primer-update#document-store)
* [Wide column store](https://github.com/ido777/system-design-primer-update#wide-column-store)
* [Graph database](https://github.com/ido777/system-design-primer-update#graph-database)
* [SQL vs NoSQL](https://github.com/ido777/system-design-primer-update#sql-or-nosql)

### Caching

* Where to cache
    * [Client caching](https://github.com/ido777/system-design-primer-update#client-caching)
    * [CDN caching](https://github.com/ido777/system-design-primer-update#cdn-caching)
    * [Web server caching](https://github.com/ido777/system-design-primer-update#web-server-caching)
    * [Database caching](https://github.com/ido777/system-design-primer-update#database-caching)
    * [Application caching](https://github.com/ido777/system-design-primer-update#application-caching)
* What to cache
    * [Caching at the database query level](https://github.com/ido777/system-design-primer-update#caching-at-the-database-query-level)
    * [Caching at the object level](https://github.com/ido777/system-design-primer-update#caching-at-the-object-level)
* When to update the cache
    * [Cache-aside](https://github.com/ido777/system-design-primer-update#cache-aside)
    * [Write-through](https://github.com/ido777/system-design-primer-update#write-through)
    * [Write-behind (write-back)](https://github.com/ido777/system-design-primer-update#write-behind-write-back)
    * [Refresh ahead](https://github.com/ido777/system-design-primer-update#refresh-ahead)

### Asynchronism and microservices

* [Message queues](https://github.com/ido777/system-design-primer-update#message-queues)
* [Task queues](https://github.com/ido777/system-design-primer-update#task-queues)
* [Back pressure](https://github.com/ido777/system-design-primer-update#back-pressure)
* [Microservices](https://github.com/ido777/system-design-primer-update#microservices)

### Communications

* Discuss tradeoffs:
    * External communication with clients - [HTTP APIs following REST](https://github.com/ido777/system-design-primer-update#representational-state-transfer-rest)
    * Internal communications - [RPC](https://github.com/ido777/system-design-primer-update#remote-procedure-call-rpc)
* [Service discovery](https://github.com/ido777/system-design-primer-update#service-discovery)

### Security

Refer to the [security section](https://github.com/ido777/system-design-primer-update#security).

### Latency numbers

See [Latency numbers every programmer should know](https://github.com/ido777/system-design-primer-update#latency-numbers-every-programmer-should-know).

### Ongoing

* Continue benchmarking and monitoring your system to address bottlenecks as they come up
* Scaling is an iterative process
