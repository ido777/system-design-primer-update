## Appendix

You'll sometimes be asked to do 'back-of-the-envelope' estimates.  For example, you might need to determine how long it will take to generate 100 image thumbnails from disk or how much memory a data structure will take.  The **Powers of two table** and **Latency numbers every programmer should know** are handy references.

### Powers of two table


```
Power           Exact Value         Approx Value    Short Name       Full Name    Decimal
---------------------------------------------------------------------------------------------
7                             128
8                             256
10                           1024   1 thousand           1 KB       1 Kilobyte   10^3
16                         65,536                       64 KB        
20                      1,048,576   1 million            1 MB       1 Megabyte   10^6
30                  1,073,741,824   1 billion            1 GB       1 Gigabyte   10^9
32                  4,294,967,296                        4 GB      
40              1,099,511,627,776   1 trillion           1 TB       1 Terabyte   10^12
50          1,125,899,906,842,624   1 quadrillion        1 PB       1 Petabyte   10^15
60      1,152,921,504,606,846,976   1 quintillion        1 EB       1 Exabyte    10^18
```

#### Source(s) and further reading

* [Powers of two](https://en.wikipedia.org/wiki/Power_of_two)

### Latency numbers every programmer should know

```
Latency Comparison Numbers (~2020 based on colin-scott interactive latency numbers)
--------------------------
L1 cache reference                           1   ns
Branch mispredict                            3   ns
L2 cache reference                           4   ns                      4x L1 cache
Mutex lock/unlock                           17   ns
Main memory reference                      100   ns                      20x L2 cache, 200x L1 cache
Compress 1K bytes with Zippy             2,000   ns        2 us
Send 1 KB bytes over 1 Gbps network     10,000   ns       10 us
Read 4 KB randomly from SSD*           150,000   ns      150 us          ~1GB/sec SSD
Read 1 MB sequentially from memory     250,000   ns      250 us
Round trip within same datacenter      500,000   ns      500 us
Read 1 MB sequentially from SSD*     1,000,000   ns    1,000 us    1 ms  ~1GB/sec SSD, 4X memory
HDD seek                            10,000,000   ns   10,000 us   10 ms  20x datacenter roundtrip
Read 1 MB sequentially from 1 Gbps  10,000,000   ns   10,000 us   10 ms  40x memory, 10X SSD
Read 1 MB sequentially from HDD     30,000,000   ns   30,000 us   30 ms 120x memory, 30X SSD
Send packet CA->Netherlands->CA    150,000,000   ns  150,000 us  150 ms

Notes
-----
1 ns = 10^-9 seconds
1 us = 10^-6 seconds = 1,000 ns
1 ms = 10^-3 seconds = 1,000 us = 1,000,000 ns
```

Handy metrics based on numbers above:

* Read sequentially from HDD at 30 MB/s
* Read sequentially from 1 Gbps Ethernet at 100 MB/s
* Read sequentially from SSD at 1 GB/s
* Read sequentially from main memory at 4 GB/s
* 6-7 world-wide round trips per second
* 2,000 round trips per second within a data center

#### Latency numbers visualized (you can play with the years to get the values for different years)

![](https://colin-scott.github.io/personal_website/research/interactive_latency.html)

#### Source(s) and further reading

* [Latency numbers every programmer should know - 1](https://gist.github.com/jboner/2841832)
* [Latency numbers every programmer should know - 2](https://gist.github.com/hellerbarde/2843375)
* [Designs, lessons, and advice from building large distributed systems](http://www.cs.cornell.edu/projects/ladis2009/talks/dean-keynote-ladis2009.pdf)
* [Software Engineering Advice from Building Large-Scale Distributed Systems](https://static.googleusercontent.com/media/research.google.com/en//people/jeff/stanford-295-talk.pdf)

