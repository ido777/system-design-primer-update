graph TD
    %% Client-side
    Client[fa:fa-user Client] --> DNS[fa:fa-globe DNS]
    Client --> CDN[fa:fa-cloud CDN]

    %% Server-side
    DNS --> LoadBalancer[fa:fa-random Load Balancer]
    CDN --> LoadBalancer

    LoadBalancer --> WebServer[fa:fa-server Web Server]

    %% APIs
    WebServer --> WriteAPIAsync[fa:fa-pencil-square-o Write API Async]
    WebServer --> WriteAPI[fa:fa-pencil Write API]
    WebServer --> ReadAPI[fa:fa-book Read API]

    %% Memory Cache
    ReadAPI --> MemoryCache[fa:fa-flash Memory Cache]

    %% Queue and Worker
    WriteAPIAsync --> Queue[fa:fa-bars Queue]
    Queue --> WorkerService[fa:fa-cogs Worker Service]

    %% Databases
    WorkerService --> NoSQL[(fa:fa-database NoSQL)]
    WriteAPIAsync --> NoSQL
    WriteAPI --> SQLWrite[(fa:fa-database SQL Write Master-Slave)]
    ReadAPI --> SQLRead[(fa:fa-database SQL Read Replicas)]
    ReadAPI --> ObjectStore[(fa:fa-cubes Object Store)]

    %% Sharded and Partitioned Databases
    WorkerService --> CustomersAM[(fa:fa-database Customers A-M SQL)]
    WorkerService --> CustomersNZ[(fa:fa-database Customers N-Z SQL)]
    WorkerService --> Products[(fa:fa-database Products SQL)]
