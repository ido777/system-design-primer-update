# Key system design concepts, trade-offs, problem-solving approaches

New to system design?

First, you'll need a basic understanding of common principles, learning about what they are, how they are used, and their pros and cons.

# Web Application Deployment and Scaling basics

[Scalability Video Lecture at Harvard 2012](https://www.youtube.com/watch?v=-W9F__D3oY4)

## Lecture Summary: Web Application Deployment and Scaling

This lecture addresses strategies for deploying and scaling web applications beyond local development to multiple servers on the internet. It covers key considerations when choosing web hosting services and infrastructure setups, emphasizing the importance of features like secure file transfer (SFTP), privacy, and resource management.

### Hosting and Infrastructure Considerations:
- **Web Hosting Services:** Discusses shared hosting, VPS (Virtual Private Server), and cloud services like Amazon EC2, highlighting pros and cons related to performance, privacy, and scalability.
- **Vertical vs. Horizontal Scaling:**
  - **Vertical Scaling:** Upgrading existing hardware (e.g., CPU, RAM) to handle increased load. It solves the immediate need for performance improvement but is limited by physical hardware constraints and financial costs.
  - **Horizontal Scaling:** Distributing workload across multiple, less expensive servers. It addresses the limitations of vertical scaling by providing a flexible, scalable architecture that can easily handle increased traffic and user demand.

### Load Balancing:
- **Load Balancing:** Manages traffic distribution among multiple servers. It solves the problem of server overload by evenly distributing incoming requests, ensuring high availability and optimal resource utilization. Methods include round-robin DNS, dedicated load balancers, and application-layer approaches using cookies to maintain "sticky sessions."
- Hardware vs. software solutions for load balancing were compared, with software options such as HAProxy recommended for cost-effectiveness.

### Data Storage and Caching:
- **Session Management:** Challenges arise with maintaining session consistency across multiple servers. Solutions include centralized session storage or using cookies to track server affinity.
- **Caching:** Addresses performance bottlenecks by temporarily storing frequently accessed data in fast-access memory. Techniques like memcache for memory caching, MySQL query caching, and static HTML caching enhance response times and reduce database load.

### Database Scaling and Reliability:
- **Database Replication:** Involves creating exact copies (replicas) of databases, typically through master-slave or master-master configurations. Replication enhances reliability by providing redundancy—if one database fails, another copy can immediately serve user requests. It also allows for load distribution, particularly useful for read-heavy applications, by spreading read operations across multiple databases.
- **Database Partitioning:** Splits large databases into smaller, manageable segments based on defined criteria, such as user ID ranges or alphabetical groups. Partitioning addresses scalability issues by reducing the load on individual databases, enabling more efficient handling of large datasets and high traffic volumes.

### Security:
- Firewall configuration and security measures are essential to restrict unnecessary access, limiting potential exploits by enforcing minimal required access (principle of least privilege).

This summary outlines foundational concepts necessary for effectively deploying, scaling, and securing web applications in production environments.



### Scalability for Dummies Article

### Clones
- **Motivation (Problem):** When a single server becomes insufficient to handle increasing user demand, performance issues like slow response times and server crashes arise.
- **Solution:** Use "clones" or identical copies of servers to distribute user requests evenly, effectively scaling horizontally to enhance system capacity and reliability.

### Databases
- **Motivation (Problem):** A single database can become a bottleneck, slowing down performance and limiting scalability due to high read/write operations.
- **Solution:** Implement database replication (creating copies) to distribute read operations and ensure redundancy, and partitioning (splitting data into smaller subsets) to distribute the load and enhance database management.

### Caches
- **Motivation (Problem):** Frequently accessing the database for commonly requested data leads to performance degradation and slow response times.
- **Solution:** Employ caching mechanisms to temporarily store frequently accessed data in memory, reducing database queries, significantly improving response times and overall performance.

### Asynchronism
- **Motivation (Problem):** Certain operations (e.g., email sending, payment processing) slow down the application if executed synchronously, resulting in poor user experience.
- **Solution:** Adopt asynchronous task handling, allowing heavy or slow operations to run in the background without blocking immediate user requests, thus improving responsiveness and user experience.


See [Scalability for Dummies Article](https://web.archive.org/web/20221030091841/http://www.lecloud.net/tagged/scalability/chrono)
  * [Clones](https://web.archive.org/web/20220530193911/https://www.lecloud.net/post/7295452622/scalability-for-dummies-part-1-clones)
  * [Databases](https://web.archive.org/web/20220602114024/https://www.lecloud.net/post/7994751381/scalability-for-dummies-part-2-database)
  * [Caches](https://web.archive.org/web/20230126233752/https://www.lecloud.net/post/9246290032/scalability-for-dummies-part-3-cache)
  * [Asynchronism](https://web.archive.org/web/20220926171507/https://www.lecloud.net/post/9699762917/scalability-for-dummies-part-4-asynchronism)

### Video Resources

* Watch [**20 System Design Concepts**](https://www.youtube.com/watch?v=i53Gi_K3o7I) to become familiar with the various topics within system design.
* Watch the [**System Design Course for Beginners**](https://www.youtube.com/watch?v=MbjObHmDbZo) for a free high level crash course on the system design concepts.
* To learn about specific System Design Concepts in greater detail, check out the [**System Design playlist**](https://www.youtube.com/playlist?list=PLCRMIe5FDPsd0gVs500xeOewfySTsmEjf)
